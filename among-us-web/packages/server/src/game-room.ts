import { DurableObject } from 'cloudflare:workers';
import type {
  ClientMessage,
  ServerMessage,
  PlayerColor,
  DeadBody,
  TaskType,
  SabotageType,
  Direction,
  WinReason,
} from '@among-us/shared';
import {
  GAME_CONFIG,
  SPAWN_POSITIONS,
  VENT_POSITIONS,
  VENT_CONNECTIONS,
} from '@among-us/shared';
import { ServerGameState } from './game/game-state';
import { assignImpostors } from './game/impostor';
import {
  startMeeting,
  castVote,
  allVotesCast,
  tallyVotes,
  ejectPlayer,
} from './game/meeting';
import { startSabotage, fixSabotage } from './game/sabotage';
import { assignTasks, completeTask } from './game/tasks';
import { checkWinCondition } from './game/win-condition';

export interface Env {
  GAME_ROOM: DurableObjectNamespace;
  LOBBY: DurableObjectNamespace;
}

type AlarmType = 'game_start' | 'reactor_meltdown' | 'vote_deadline';

export class GameRoom extends DurableObject<Env> {
  private gameState: ServerGameState = new ServerGameState();

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/ws') {
      const upgradeHeader = request.headers.get('Upgrade');
      if (upgradeHeader !== 'websocket') {
        return new Response('Expected WebSocket upgrade', { status: 426 });
      }

      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      const playerId = crypto.randomUUID();
      server.serializeAttachment({ playerId });
      this.ctx.acceptWebSocket(server, [`player:${playerId}`]);

      return new Response(null, { status: 101, webSocket: client });
    }

    return new Response('Not found', { status: 404 });
  }

  async webSocketMessage(
    ws: WebSocket,
    message: string | ArrayBuffer,
  ): Promise<void> {
    if (typeof message !== 'string') return;

    const attachment = ws.deserializeAttachment() as {
      playerId: string;
    } | null;
    if (!attachment) return;

    const { playerId } = attachment;

    let parsed: ClientMessage;
    try {
      parsed = JSON.parse(message);
    } catch {
      return;
    }

    switch (parsed.type) {
      case 'join':
        this.handleJoin(playerId, ws, parsed.name, parsed.color);
        break;
      case 'move':
        this.handleMove(playerId, parsed.x, parsed.y, parsed.direction);
        break;
      case 'stop':
        this.handleStop(playerId, parsed.x, parsed.y);
        break;
      case 'kill':
        this.handleKill(playerId, parsed.targetId);
        break;
      case 'report_body':
        this.handleReportBody(playerId, parsed.bodyId);
        break;
      case 'call_emergency':
        this.handleCallEmergency(playerId);
        break;
      case 'vote':
        this.handleVote(playerId, parsed.targetId);
        break;
      case 'complete_task':
        this.handleCompleteTask(playerId, parsed.taskType);
        break;
      case 'enter_vent':
        this.handleEnterVent(playerId, parsed.ventIndex);
        break;
      case 'exit_vent':
        this.handleExitVent(playerId);
        break;
      case 'vent_teleport':
        this.handleVentTeleport(playerId, parsed.targetVentIndex);
        break;
      case 'sabotage':
        this.handleSabotage(playerId, parsed.sabotageType);
        break;
      case 'fix_sabotage':
        this.handleFixSabotage(playerId, parsed.sabotageType);
        break;
      case 'do_task':
        // Client-side only; no server action needed
        break;
    }
  }

  async webSocketClose(
    ws: WebSocket,
    code: number,
    reason: string,
    wasClean: boolean,
  ): Promise<void> {
    const attachment = ws.deserializeAttachment() as {
      playerId: string;
    } | null;
    if (attachment) {
      const { playerId } = attachment;
      this.gameState.removePlayer(playerId);
      this.broadcast({ type: 'player_left', playerId });

      if (this.gameState.phase === 'playing') {
        const result = checkWinCondition(this.gameState);
        if (result.winner && result.reason) {
          this.endGame(result.winner, result.reason);
        }
      }
    }
    ws.close();
  }

  async alarm(): Promise<void> {
    const alarmType = (await this.ctx.storage.get<AlarmType>('alarmType')) ?? null;
    if (!alarmType) return;
    await this.ctx.storage.delete('alarmType');

    switch (alarmType) {
      case 'game_start':
        this.doStartGame();
        break;
      case 'reactor_meltdown':
        if (this.gameState.sabotage?.type === 'reactor') {
          this.gameState.sabotage.timeRemaining = 0;
          this.endGame('impostor', 'sabotage_meltdown');
        }
        break;
      case 'vote_deadline':
        if (this.gameState.phase === 'voting') {
          this.resolveMeeting();
        }
        break;
    }
  }

  // --- Handlers ---

  private handleJoin(
    playerId: string,
    ws: WebSocket,
    name: string,
    color: PlayerColor,
  ): void {
    if (this.gameState.phase !== 'lobby') {
      this.sendTo(ws, { type: 'error', message: 'Game already in progress' });
      return;
    }

    if (this.gameState.players.size >= GAME_CONFIG.MAX_PLAYERS) {
      this.sendTo(ws, { type: 'error', message: 'Room is full' });
      return;
    }

    // Resolve color conflict
    const usedColors = new Set(
      Array.from(this.gameState.players.values()).map(p => p.color),
    );
    const finalColor = usedColors.has(color)
      ? this.gameState.getAvailableColor() ?? color
      : color;

    const player = this.gameState.addPlayer(playerId, name, finalColor);

    // Send welcome to the joining player
    this.sendTo(ws, {
      type: 'welcome',
      playerId,
      gameState: this.gameState.toGameState(),
    });

    // Broadcast player_joined to all
    this.broadcast({
      type: 'player_joined',
      playerId,
      name: player.name,
      color: player.color,
      x: player.x,
      y: player.y,
    });

    // Auto-start when enough players
    if (
      this.gameState.players.size >= GAME_CONFIG.MIN_PLAYERS_TO_START &&
      this.gameState.phase === 'lobby'
    ) {
      this.gameState.phase = 'starting';
      this.setAlarm('game_start', GAME_CONFIG.GAME_START_DELAY * 1000);
      this.broadcast({
        type: 'game_state_update',
        gameState: this.gameState.toGameState(),
      });
    }
  }

  private handleMove(
    playerId: string,
    x: number,
    y: number,
    direction: Direction,
  ): void {
    const player = this.gameState.players.get(playerId);
    if (!player || !player.alive || player.inVent) return;
    if (this.gameState.phase !== 'playing' && this.gameState.phase !== 'lobby')
      return;

    player.x = x;
    player.y = y;
    player.direction = direction;
    player.moving = true;
    player.animFrame =
      (player.animFrame + 1) % GAME_CONFIG.ANIM_FRAMES_WALK;

    this.broadcast({
      type: 'player_moved',
      playerId,
      x,
      y,
      direction: player.direction,
      animFrame: player.animFrame,
    });
  }

  private handleStop(playerId: string, x: number, y: number): void {
    const player = this.gameState.players.get(playerId);
    if (!player) return;

    player.x = x;
    player.y = y;
    player.moving = false;

    this.broadcast({ type: 'player_stopped', playerId, x, y });
  }

  private handleKill(killerId: string, targetId: string): void {
    if (this.gameState.phase !== 'playing') return;
    if (!this.gameState.impostorIds.has(killerId)) return;

    const killer = this.gameState.players.get(killerId);
    const target = this.gameState.players.get(targetId);
    if (!killer || !target || !killer.alive || !target.alive) return;
    if (target.inVent) return;

    // Cooldown check
    const now = Date.now();
    if (now - killer.lastKillTime < GAME_CONFIG.KILL_COOLDOWN * 1000) return;

    // Proximity check
    const dx = killer.x - target.x;
    const dy = killer.y - target.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > GAME_CONFIG.KILL_RANGE) return;

    // Execute kill
    target.alive = false;
    killer.lastKillTime = now;
    // Teleport killer to victim position
    killer.x = target.x;
    killer.y = target.y;

    const body: DeadBody = {
      id: crypto.randomUUID(),
      playerId: target.id,
      x: target.x,
      y: target.y,
      color: target.color,
    };
    this.gameState.deadBodies.push(body);

    this.broadcast({
      type: 'player_killed',
      killerId,
      victimId: targetId,
      body,
    });

    const result = checkWinCondition(this.gameState);
    if (result.winner && result.reason) {
      this.endGame(result.winner, result.reason);
    }
  }

  private handleReportBody(reporterId: string, bodyId: string): void {
    if (this.gameState.phase !== 'playing') return;

    const reporter = this.gameState.players.get(reporterId);
    if (!reporter || !reporter.alive) return;

    const body = this.gameState.deadBodies.find(b => b.id === bodyId);
    if (!body) return;

    // Proximity check
    const dx = reporter.x - body.x;
    const dy = reporter.y - body.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > GAME_CONFIG.REPORT_BODY_RANGE) return;

    this.broadcast({ type: 'body_reported', reporterId, bodyId });
    this.startMeetingPhase(reporterId, 'body_reported');
  }

  private handleCallEmergency(callerId: string): void {
    if (this.gameState.phase !== 'playing') return;

    const caller = this.gameState.players.get(callerId);
    if (!caller || !caller.alive) return;

    const now = Date.now();
    if (now - this.gameState.lastMeetingTime < GAME_CONFIG.MEETING_COOLDOWN * 1000)
      return;

    // Cannot call meeting during sabotage
    if (this.gameState.sabotage) return;

    this.startMeetingPhase(callerId, 'emergency');
  }

  private handleVote(voterId: string, targetId: string | 'skip'): void {
    if (this.gameState.phase !== 'voting') return;

    const success = castVote(this.gameState, voterId, targetId);
    if (!success) return;

    this.broadcast({
      type: 'vote_update',
      vote: {
        votes: Object.fromEntries(this.gameState.votes),
        timeRemaining: 0,
      },
    });

    if (allVotesCast(this.gameState)) {
      this.resolveMeeting();
    }
  }

  private handleCompleteTask(playerId: string, taskType: TaskType): void {
    if (this.gameState.phase !== 'playing') return;

    const success = completeTask(this.gameState, playerId, taskType);
    if (!success) return;

    this.broadcast({ type: 'task_completed', playerId, taskType });

    const { completedTaskCount, totalTaskCount } =
      this.gameState.getTaskProgress();
    this.broadcast({ type: 'task_progress', completedTaskCount, totalTaskCount });

    const result = checkWinCondition(this.gameState);
    if (result.winner && result.reason) {
      this.endGame(result.winner, result.reason);
    }
  }

  private handleEnterVent(playerId: string, ventIndex: number): void {
    if (this.gameState.phase !== 'playing') return;
    if (!this.gameState.impostorIds.has(playerId)) return;

    const player = this.gameState.players.get(playerId);
    if (!player || !player.alive || player.inVent) return;
    if (ventIndex < 0 || ventIndex >= VENT_POSITIONS.length) return;

    // Proximity check
    const vent = VENT_POSITIONS[ventIndex];
    const dx = player.x - vent.x;
    const dy = player.y - vent.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    if (distance > GAME_CONFIG.TASK_DETECT_RADIUS) return;

    player.inVent = true;
    player.ventIndex = ventIndex;

    this.broadcast({ type: 'player_entered_vent', playerId, ventIndex });
  }

  private handleExitVent(playerId: string): void {
    if (this.gameState.phase !== 'playing') return;

    const player = this.gameState.players.get(playerId);
    if (!player || !player.inVent || player.ventIndex === null) return;

    const exitVentIndex = player.ventIndex;
    const vent = VENT_POSITIONS[exitVentIndex];
    player.x = vent.x;
    player.y = vent.y;
    player.inVent = false;
    player.ventIndex = null;

    this.broadcast({
      type: 'player_exited_vent',
      playerId,
      ventIndex: exitVentIndex,
    });
  }

  private handleVentTeleport(
    playerId: string,
    targetVentIndex: number,
  ): void {
    if (this.gameState.phase !== 'playing') return;

    const player = this.gameState.players.get(playerId);
    if (!player || !player.inVent || player.ventIndex === null) return;

    // Validate connectivity
    const currentVent = player.ventIndex;
    const isConnected = VENT_CONNECTIONS.some(
      group => group.includes(currentVent) && group.includes(targetVentIndex),
    );
    if (!isConnected) return;

    const vent = VENT_POSITIONS[targetVentIndex];
    player.ventIndex = targetVentIndex;
    player.x = vent.x;
    player.y = vent.y;

    this.broadcast({
      type: 'player_entered_vent',
      playerId,
      ventIndex: targetVentIndex,
    });
  }

  private handleSabotage(
    playerId: string,
    sabotageType: SabotageType,
  ): void {
    if (this.gameState.phase !== 'playing') return;
    if (!this.gameState.impostorIds.has(playerId)) return;

    const success = startSabotage(this.gameState, sabotageType);
    if (!success) return;

    const timeRemaining =
      sabotageType === 'reactor' ? GAME_CONFIG.REACTOR_MELTDOWN_TIME : 0;

    this.broadcast({
      type: 'sabotage_started',
      sabotageType,
      timeRemaining,
    });

    if (sabotageType === 'reactor') {
      this.setAlarm(
        'reactor_meltdown',
        GAME_CONFIG.REACTOR_MELTDOWN_TIME * 1000,
      );
    }
  }

  private handleFixSabotage(
    playerId: string,
    sabotageType: SabotageType,
  ): void {
    if (this.gameState.phase !== 'playing') return;

    const player = this.gameState.players.get(playerId);
    if (!player || !player.alive) return;

    const success = fixSabotage(this.gameState, sabotageType);
    if (!success) return;

    this.broadcast({ type: 'sabotage_fixed', sabotageType });

    // Cancel reactor alarm
    if (sabotageType === 'reactor') {
      this.ctx.storage.delete('alarmType');
      this.ctx.storage.deleteAlarm();
    }
  }

  // --- Game flow ---

  private doStartGame(): void {
    const playerIds = Array.from(this.gameState.players.keys());

    // Assign impostors
    const impostors = assignImpostors(
      playerIds,
      GAME_CONFIG.IMPOSTORS_PER_GAME,
    );
    this.gameState.impostorIds = new Set(impostors);

    // Set roles and assign tasks
    for (const [id, player] of this.gameState.players) {
      if (this.gameState.impostorIds.has(id)) {
        player.role = 'impostor';
        player.assignedTasks = [];
      } else {
        player.role = 'crewmate';
        assignTasks(player, GAME_CONFIG.TOTAL_TASKS);
      }
    }

    this.gameState.resetPositionsToSpawn();
    this.gameState.phase = 'playing';

    // Send personalized game_start to each player
    for (const [id, player] of this.gameState.players) {
      const ws = this.getPlayerWs(id);
      if (!ws) continue;

      const tasks = player.assignedTasks.map(t => ({
        type: t,
        completed: false,
      }));

      this.sendTo(ws, {
        type: 'game_start',
        role: player.role,
        impostorIds: this.gameState.impostorIds.has(id) ? impostors : [],
        tasks,
      });
    }

    this.broadcast({
      type: 'game_state_update',
      gameState: this.gameState.toGameState(),
    });
  }

  private startMeetingPhase(
    callerId: string,
    reason: 'emergency' | 'body_reported',
  ): void {
    startMeeting(this.gameState, callerId);
    this.gameState.resetPositionsToSpawn();

    // Cancel active sabotage
    if (this.gameState.sabotage) {
      this.gameState.sabotage = null;
      this.ctx.storage.delete('alarmType');
      this.ctx.storage.deleteAlarm();
    }

    this.broadcast({
      type: 'meeting_started',
      callerId,
      reason,
      timeRemaining: GAME_CONFIG.MEETING_DURATION,
    });

    this.setAlarm('vote_deadline', GAME_CONFIG.MEETING_DURATION * 1000);
  }

  private resolveMeeting(): void {
    const { ejectedPlayerId, votes } = tallyVotes(this.gameState);

    let ejectedWasImpostor: boolean | null = null;

    if (ejectedPlayerId) {
      ejectedWasImpostor = ejectPlayer(this.gameState, ejectedPlayerId);
      const ejectedPlayer = this.gameState.players.get(ejectedPlayerId);
      if (ejectedPlayer) {
        this.broadcast({
          type: 'player_ejected',
          playerId: ejectedPlayerId,
          wasImpostor: ejectedWasImpostor,
          color: ejectedPlayer.color,
        });
      }
    }

    this.broadcast({
      type: 'vote_result',
      votes,
      ejectedPlayerId,
      ejectedWasImpostor,
    });

    this.gameState.votes.clear();

    const result = checkWinCondition(this.gameState);
    if (result.winner && result.reason) {
      this.endGame(result.winner, result.reason);
    } else {
      this.gameState.phase = 'playing';
      this.gameState.resetPositionsToSpawn();
      this.broadcast({
        type: 'game_state_update',
        gameState: this.gameState.toGameState(),
      });
    }
  }

  private endGame(winner: 'crewmate' | 'impostor', reason: WinReason): void {
    this.gameState.phase = 'game_over';
    this.broadcast({
      type: 'game_over',
      winningRole: winner,
      winReason: reason,
      impostorIds: Array.from(this.gameState.impostorIds),
    });
  }

  // --- Helpers ---

  private getPlayerWs(playerId: string): WebSocket | null {
    const sockets = this.ctx.getWebSockets(`player:${playerId}`);
    return sockets[0] ?? null;
  }

  private sendTo(ws: WebSocket, message: ServerMessage): void {
    try {
      ws.send(JSON.stringify(message));
    } catch {
      // WebSocket already closed
    }
  }

  private broadcast(message: ServerMessage): void {
    const data = JSON.stringify(message);
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(data);
      } catch {
        // WebSocket already closed
      }
    }
  }

  private setAlarm(type: AlarmType, delayMs: number): void {
    this.ctx.storage.put('alarmType', type);
    this.ctx.storage.setAlarm(Date.now() + delayMs);
  }
}
