import type {
  PlayerState,
  PlayerColor,
  PlayerRole,
  Direction,
  GamePhase,
  GameState,
  DeadBody,
  SabotageType,
  TaskType,
  TaskState,
  VoteState,
  SabotageState,
  WinReason,
} from '@among-us/shared';
import { GAME_CONFIG, SPAWN_POSITIONS, PLAYER_COLORS } from '@among-us/shared';

export interface ServerPlayerState extends PlayerState {
  lastKillTime: number;
  assignedTasks: TaskType[];
  completedTasks: Set<TaskType>;
  ventIndex: number | null;
}

export class ServerGameState {
  players: Map<string, ServerPlayerState> = new Map();
  phase: GamePhase = 'lobby';
  impostorIds: Set<string> = new Set();
  deadBodies: DeadBody[] = [];
  sabotage: { type: SabotageType; timeRemaining: number } | null = null;
  votes: Map<string, string | 'skip'> = new Map();
  hostId: string | null = null;
  meetingCallerId: string | null = null;
  lastMeetingTime: number = 0;

  addPlayer(id: string, name: string, color: PlayerColor): ServerPlayerState {
    const spawnIndex = this.players.size % SPAWN_POSITIONS.length;
    const spawn = SPAWN_POSITIONS[spawnIndex];

    const player: ServerPlayerState = {
      id,
      name,
      color,
      x: spawn.x,
      y: spawn.y,
      direction: 'down' as Direction,
      animFrame: 0,
      moving: false,
      alive: true,
      inVent: false,
      role: 'crewmate',
      tasksCompleted: 0,
      lastKillTime: 0,
      assignedTasks: [],
      completedTasks: new Set(),
      ventIndex: null,
    };

    if (!this.hostId) {
      this.hostId = id;
    }

    this.players.set(id, player);
    return player;
  }

  removePlayer(id: string): void {
    this.players.delete(id);
    this.impostorIds.delete(id);
    if (this.hostId === id) {
      const first = this.players.keys().next();
      this.hostId = first.done ? null : first.value;
    }
  }

  getAlivePlayers(): ServerPlayerState[] {
    return Array.from(this.players.values()).filter(p => p.alive);
  }

  getAliveCrewmates(): ServerPlayerState[] {
    return this.getAlivePlayers().filter(p => !this.impostorIds.has(p.id));
  }

  getAliveImpostors(): ServerPlayerState[] {
    return this.getAlivePlayers().filter(p => this.impostorIds.has(p.id));
  }

  getAvailableColor(): PlayerColor | null {
    const usedColors = new Set(
      Array.from(this.players.values()).map(p => p.color),
    );
    return (PLAYER_COLORS.find(c => !usedColors.has(c)) as PlayerColor) ?? null;
  }

  resetPositionsToSpawn(): void {
    let i = 0;
    for (const player of this.players.values()) {
      if (player.alive) {
        const spawn = SPAWN_POSITIONS[i % SPAWN_POSITIONS.length];
        player.x = spawn.x;
        player.y = spawn.y;
        player.moving = false;
        player.inVent = false;
        player.ventIndex = null;
        i++;
      }
    }
  }

  getTaskProgress(): { completedTaskCount: number; totalTaskCount: number } {
    let completed = 0;
    let total = 0;
    for (const player of this.players.values()) {
      if (!this.impostorIds.has(player.id)) {
        completed += player.completedTasks.size;
        total += player.assignedTasks.length;
      }
    }
    return { completedTaskCount: completed, totalTaskCount: total };
  }

  toGameState(): GameState {
    const players: Record<string, PlayerState> = {};
    for (const [id, p] of this.players) {
      players[id] = {
        id: p.id,
        name: p.name,
        color: p.color,
        x: p.x,
        y: p.y,
        direction: p.direction,
        animFrame: p.animFrame,
        moving: p.moving,
        alive: p.alive,
        inVent: p.inVent,
        role: p.role,
        tasksCompleted: p.tasksCompleted,
      };
    }

    const { completedTaskCount, totalTaskCount } = this.getTaskProgress();

    const sabotageState: SabotageState | null = this.sabotage
      ? { type: this.sabotage.type, active: true, timeRemaining: this.sabotage.timeRemaining }
      : null;

    const voteState: VoteState | null =
      this.phase === 'meeting' || this.phase === 'voting'
        ? { votes: Object.fromEntries(this.votes), timeRemaining: 0 }
        : null;

    return {
      phase: this.phase,
      players,
      tasks: [],
      totalTaskCount,
      completedTaskCount,
      sabotage: sabotageState,
      deadBodies: [...this.deadBodies],
      vote: voteState,
      winReason: null,
      winningRole: null,
      ejectedPlayerId: null,
    };
  }
}
