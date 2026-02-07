import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { Scene } from '../core/scene-manager';
import { sceneManager } from '../core/scene-manager';
import { Camera } from '../core/camera';
import { loadPlayerSpritesheet } from '../core/asset-loader';
import { inputManager } from '../core/input-manager';
import { getAudioManager } from '../core/audio-manager';
import { loadTMX } from '../map/tiled-map';
import { MiniMap } from '../map/mini-map';
import { Player } from '../game/player';
import { CollisionSystem } from '../game/collision';
import { BotManager } from '../game/bot-manager';
import { KillSystem, type KillTarget } from '../game/kill-system';
import { VentSystem } from '../game/vent-system';
import { SabotageSystem } from '../game/sabotage';
import { MeetingManager } from '../game/meeting';
import { FogRenderer } from '../rendering/fog-renderer';
import { HUD, type HUDState } from '../rendering/hud';
import { createTaskScene } from '../tasks/index';
import { MeetingScene } from './meeting-scene';
import { GameOverScene } from './game-over-scene';
import { WebSocketClient } from '../network/ws-client';
import { StateSync } from '../network/state-sync';
import {
  GAME_CONFIG,
  SPAWN_POSITIONS,
  VENT_POSITIONS,
} from '@among-us/shared';
import type {
  PlayerColor,
  PlayerRole,
  PlayerState,
  TaskType,
  WinReason,
  DeadBody,
  Direction,
} from '@among-us/shared';

const MAP_PATH = '/assets/maps/map.tmx';
const BOT_COUNT = 9;
const TOTAL_TASKS = GAME_CONFIG.TOTAL_TASKS;

// Movement send throttle interval in seconds (~20Hz)
const MOVE_SEND_INTERVAL = 1 / 20;

// Task locations mapped to approximate positions on the Skeld map
const TASK_LOCATIONS: { type: TaskType; x: number; y: number }[] = [
  { type: 'fix_wiring', x: 2450, y: 1850 },      // Electrical
  { type: 'stabilize_nav', x: 5350, y: 1350 },    // Navigation
  { type: 'empty_garbage', x: 3100, y: 2400 },     // Storage
  { type: 'reboot_wifi', x: 3800, y: 2600 },       // Communications
  { type: 'divert_power', x: 2450, y: 1950 },      // Electrical
  { type: 'align_engine', x: 1360, y: 700 },       // Upper Engine
  { type: 'fuel_engine', x: 1360, y: 2180 },       // Lower Engine
  { type: 'clear_asteroids', x: 4500, y: 600 },    // Weapons
];

// Emergency button location (cafeteria center table)
const EMERGENCY_BUTTON = { x: 3277, y: 658 };
const EMERGENCY_BUTTON_RADIUS = 80;

// Report body range
const REPORT_RANGE = GAME_CONFIG.REPORT_BODY_RANGE;

export type GameMode = 'freeplay' | 'multiplayer';

export interface MultiplayerConfig {
  roomId: string;
  playerName: string;
  playerColor: PlayerColor;
}

export class GameScene implements Scene {
  container = new Container();
  isOverlay = false;

  private mode: GameMode;
  private multiplayerConfig: MultiplayerConfig | null;

  private world = new Container();
  private uiLayer = new Container();
  private camera: Camera | null = null;
  private player: Player | null = null;
  private collisionSystem = new CollisionSystem();

  // Phase 3 systems (freeplay)
  private botManager = new BotManager();
  private killSystem = new KillSystem();
  private ventSystem = new VentSystem();
  private sabotageSystem = new SabotageSystem();
  private meetingManager = new MeetingManager();
  private fogRenderer = new FogRenderer();
  private hud = new HUD();
  private miniMap = new MiniMap();

  // Multiplayer networking
  private wsClient: WebSocketClient | null = null;
  private stateSync: StateSync | null = null;
  private localPlayerId = 'local-player';
  private moveSendTimer = 0;
  private lastSentX = 0;
  private lastSentY = 0;
  private lastSentMoving = false;

  // Game state
  private playerColor: PlayerColor = 'red';
  private playerName = 'You';
  private playerRole: PlayerRole = 'impostor'; // Freeplay: player is impostor
  private playerAlive = true;
  private tasksCompleted = new Set<TaskType>();
  private taskInProgress = false;
  private meetingActive = false;
  private meetingScene: MeetingScene | null = null;
  private gameOver = false;
  private emergencyCooldown = 0;

  // Dead body rendering
  private bodyGraphics = new Map<string, Graphics>();

  // Key press tracking (for one-shot keys)
  private prevKeys = new Set<string>();

  constructor(mode: GameMode = 'freeplay', config?: MultiplayerConfig) {
    this.mode = mode;
    this.multiplayerConfig = config ?? null;
    if (config) {
      this.playerColor = config.playerColor;
      this.playerName = config.playerName;
    }
  }

  async onEnter(): Promise<void> {
    this.container.addChild(this.world);
    this.container.addChild(this.uiLayer);

    // Load TMX map
    const mapData = await loadTMX(MAP_PATH);
    this.world.addChild(mapData.container);

    // Set up collision system
    this.collisionSystem.setWalls(mapData.objects.collisions);

    // Load player spritesheet and create the player
    const sheet = await loadPlayerSpritesheet(this.playerColor);
    const spawn = SPAWN_POSITIONS[0];
    this.player = new Player(sheet, this.playerColor, spawn.x, spawn.y);
    this.player.setCollisionSystem(this.collisionSystem);
    this.world.addChild(this.player.getContainer());

    if (this.mode === 'freeplay') {
      // Spawn bots
      await this.botManager.spawnBots(BOT_COUNT, this.collisionSystem);
      for (const c of this.botManager.getAllContainers()) {
        this.world.addChild(c);
      }
    }

    if (this.mode === 'multiplayer') {
      // Set up multiplayer networking
      this.stateSync = new StateSync();
      this.world.addChild(this.stateSync.getContainer());
      await this.connectMultiplayer();
    }

    // Camera
    this.camera = new Camera(
      this.world,
      mapData.widthPx,
      mapData.heightPx,
      window.innerWidth,
      window.innerHeight,
    );

    // Fog renderer (screen-space overlay)
    this.uiLayer.addChild(this.fogRenderer.getContainer());

    // HUD (screen-space overlay)
    this.uiLayer.addChild(this.hud.getContainer());

    // Mini-map (screen-space overlay)
    this.uiLayer.addChild(this.miniMap.getContainer());

    // Set up HUD callbacks
    this.hud.setCallbacks({
      onKill: () => this.tryKill(),
      onSabotage: () => this.trySabotage(),
      onReport: () => this.tryReportBody(),
      onUse: () => this.tryUse(),
    });

    // Set up meeting manager
    this.meetingManager.setLocalPlayerId(this.localPlayerId);
    if (this.mode === 'freeplay') {
      this.updateMeetingPlayers();
    }

    // Listen for task completion events
    window.addEventListener('task_complete', this.onTaskComplete as EventListener);

    // Handle window resize
    window.addEventListener('resize', this.onResize);

    // Initial camera update
    this.camera.update(this.player.x, this.player.y);

    // Start ambient BGM
    const audio = getAudioManager();
    audio.playBGM('main');
    audio.playSFX('round_start');
  }

  update(dt: number): void {
    if (this.gameOver) return;

    if (this.mode === 'multiplayer') {
      this.updateMultiplayer(dt);
    }

    // Update meeting if active
    if (this.meetingActive) {
      if (this.mode === 'freeplay') {
        this.meetingManager.update(dt);
        if (this.meetingManager.phase === 'none') {
          this.endMeeting();
        }
      }
      return;
    }

    // Update systems (freeplay only uses local systems)
    if (this.mode === 'freeplay') {
      this.killSystem.update(dt);
      this.ventSystem.update(dt);
      this.sabotageSystem.update(dt);
    }

    if (this.emergencyCooldown > 0) {
      this.emergencyCooldown = Math.max(0, this.emergencyCooldown - dt);
    }

    // Handle player in vent (freeplay only)
    if (this.mode === 'freeplay' && this.ventSystem.isInVent) {
      this.handleVentControls();
      this.updateCamera();
      this.updateFog();
      this.updateHUD();
      this.updateAudio();
      this.checkWinConditions();
      this.trackKeys();
      return;
    }

    // Update player
    if (this.player && this.playerAlive) {
      this.player.update(dt);
    }

    // Update bots (freeplay only)
    if (this.mode === 'freeplay') {
      this.botManager.update(dt);
    }

    // Update remote players (multiplayer only)
    if (this.mode === 'multiplayer' && this.stateSync) {
      this.stateSync.update(dt);
    }

    // Handle keyboard input
    this.handleKeyboard();

    // Send movement to server (multiplayer)
    if (this.mode === 'multiplayer') {
      this.sendMovement(dt);
    }

    // Update camera
    this.updateCamera();

    // Update fog
    this.updateFog();

    // Update HUD
    this.updateHUD();

    // Update mini-map
    if (this.player) {
      this.miniMap.update(this.player.x, this.player.y, this.playerColor);
    }

    // Update audio
    this.updateAudio();

    if (this.mode === 'freeplay') {
      // Check sabotage meltdown
      if (this.sabotageSystem.isReactorActive() && this.sabotageSystem.getMeltdownTimeRemaining() <= 0) {
        this.triggerGameOver('impostor', 'sabotage_meltdown');
      }

      // Check win conditions
      this.checkWinConditions();
    }

    // Track keys for one-shot detection
    this.trackKeys();
  }

  async onExit(): Promise<void> {
    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('task_complete', this.onTaskComplete as EventListener);

    // Disconnect multiplayer
    if (this.wsClient) {
      this.wsClient.disconnect();
      this.wsClient = null;
    }
    if (this.stateSync) {
      this.stateSync.clear();
      this.stateSync = null;
    }

    this.world.removeChildren();
    this.uiLayer.removeChildren();
    this.container.removeChildren();
    this.camera = null;
    this.player = null;
    getAudioManager().stopBGM();
  }

  // --- Multiplayer networking ---

  private async connectMultiplayer(): Promise<void> {
    if (!this.multiplayerConfig) return;

    const { roomId, playerName, playerColor } = this.multiplayerConfig;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/api/rooms/${roomId}/ws`;

    this.wsClient = new WebSocketClient();

    try {
      await this.wsClient.connect(wsUrl);
    } catch {
      // Fall back if connection fails - stay in scene but without networking
      return;
    }

    // Send join message
    this.wsClient.send({
      type: 'join',
      name: playerName,
      color: playerColor,
    });

    // Set up message handlers
    this.wsClient.on('welcome', (msg) => {
      this.localPlayerId = msg.playerId;
      this.meetingManager.setLocalPlayerId(this.localPlayerId);

      // Set up existing players from game state
      if (msg.gameState.players) {
        for (const [id, ps] of Object.entries(msg.gameState.players)) {
          if (id !== this.localPlayerId && this.stateSync) {
            this.stateSync.addPlayer(id, ps.name, ps.color, ps.x, ps.y);
          }
        }
      }
    });

    this.wsClient.on('player_joined', (msg) => {
      if (msg.playerId !== this.localPlayerId && this.stateSync) {
        this.stateSync.addPlayer(msg.playerId, msg.name, msg.color, msg.x, msg.y);
      }
    });

    this.wsClient.on('player_left', (msg) => {
      if (this.stateSync) {
        this.stateSync.removePlayer(msg.playerId);
      }
    });

    this.wsClient.on('player_moved', (msg) => {
      if (msg.playerId !== this.localPlayerId && this.stateSync) {
        this.stateSync.handlePlayerMoved(msg.playerId, msg.x, msg.y, msg.direction);
      }
    });

    this.wsClient.on('player_stopped', (msg) => {
      if (msg.playerId !== this.localPlayerId && this.stateSync) {
        this.stateSync.handlePlayerStopped(msg.playerId, msg.x, msg.y);
      }
    });

    this.wsClient.on('game_start', (msg) => {
      this.playerRole = msg.role;
    });

    this.wsClient.on('player_killed', (msg) => {
      if (msg.victimId === this.localPlayerId) {
        this.playerAlive = false;
        if (this.player) {
          this.player.getContainer().visible = false;
        }
      } else if (this.stateSync) {
        this.stateSync.handlePlayerKilled(msg.victimId);
      }
      this.spawnBodyGraphic(msg.body);
      getAudioManager().playSFX('kill');
    });

    this.wsClient.on('meeting_started', (msg) => {
      this.meetingActive = true;
      getAudioManager().playSFX(msg.reason === 'emergency' ? 'emergency_alarm' : 'body_found');

      // Clear dead bodies visually
      for (const [, g] of this.bodyGraphics) {
        this.world.removeChild(g);
      }
      this.bodyGraphics.clear();
    });

    this.wsClient.on('vote_result', (msg) => {
      // Meeting ended; server handles ejection
      if (msg.ejectedPlayerId === this.localPlayerId) {
        this.playerAlive = false;
        if (this.player) {
          this.player.getContainer().visible = false;
        }
      } else if (msg.ejectedPlayerId && this.stateSync) {
        this.stateSync.handlePlayerKilled(msg.ejectedPlayerId);
      }
    });

    this.wsClient.on('game_state_update', (msg) => {
      // Sync full game state from server
      const gs = msg.gameState;
      if (gs.phase === 'playing' && this.meetingActive) {
        this.meetingActive = false;
        if (this.meetingScene) {
          sceneManager.pop();
          this.meetingScene = null;
        }
      }
    });

    this.wsClient.on('sabotage_started', (msg) => {
      getAudioManager().playSFX('crisis_alarm');
    });

    this.wsClient.on('game_over', (msg) => {
      this.triggerGameOver(msg.winningRole, msg.winReason);
    });

    this.wsClient.on('task_completed', (_msg) => {
      getAudioManager().playSFX('task_complete');
    });

    this.wsClient.on('error', (msg) => {
      console.warn('[WS] Server error:', msg.message);
    });
  }

  private updateMultiplayer(_dt: number): void {
    // Multiplayer-specific per-frame updates can go here
  }

  private sendMovement(dt: number): void {
    if (!this.wsClient?.isConnected || !this.player) return;

    this.moveSendTimer += dt;
    if (this.moveSendTimer < MOVE_SEND_INTERVAL) return;
    this.moveSendTimer = 0;

    const movement = inputManager.getMovementVector();
    const moving = movement.x !== 0 || movement.y !== 0;

    if (moving) {
      // Only send if position changed meaningfully
      const dx = this.player.x - this.lastSentX;
      const dy = this.player.y - this.lastSentY;
      if (dx * dx + dy * dy > 1 || !this.lastSentMoving) {
        let direction: Direction;
        if (movement.x < 0) direction = 'left';
        else if (movement.x > 0) direction = 'right';
        else if (movement.y < 0) direction = 'up';
        else direction = 'down';

        this.wsClient.send({
          type: 'move',
          direction,
          x: this.player.x,
          y: this.player.y,
        });
        this.lastSentX = this.player.x;
        this.lastSentY = this.player.y;
        this.lastSentMoving = true;
      }
    } else if (this.lastSentMoving) {
      // Send stop
      this.wsClient.send({
        type: 'stop',
        x: this.player.x,
        y: this.player.y,
      });
      this.lastSentX = this.player.x;
      this.lastSentY = this.player.y;
      this.lastSentMoving = false;
    }
  }

  // --- Input handling ---

  private isKeyJustPressed(code: string): boolean {
    return inputManager.isDown(code) && !this.prevKeys.has(code);
  }

  private trackKeys(): void {
    this.prevKeys.clear();
    // Track keys we care about
    const keysToTrack = [
      'KeyE', 'KeyV', 'KeyQ', 'KeyR',
      'ArrowLeft', 'ArrowRight',
    ];
    for (const k of keysToTrack) {
      if (inputManager.isDown(k)) {
        this.prevKeys.add(k);
      }
    }
  }

  private handleKeyboard(): void {
    if (!this.player || !this.playerAlive || this.taskInProgress) return;

    if (this.mode === 'multiplayer') {
      // In multiplayer, E key sends actions to server
      if (this.isKeyJustPressed('KeyE')) {
        if (this.playerRole === 'impostor') {
          // Try kill via server
          this.tryKillMultiplayer();
        } else if (this.canReportBody()) {
          this.tryReportBodyMultiplayer();
        } else {
          this.tryUseMultiplayer();
        }
      }
      return;
    }

    // Freeplay keyboard handling
    // E key: Kill / Use / Report (context-sensitive)
    if (this.isKeyJustPressed('KeyE')) {
      // Priority: Kill > Report > Use (emergency button / task)
      if (this.playerRole === 'impostor' && this.canKillAnyone()) {
        this.tryKill();
      } else if (this.canReportBody()) {
        this.tryReportBody();
      } else {
        this.tryUse();
      }
    }

    // V key: Enter/Exit vent (impostor only)
    if (this.isKeyJustPressed('KeyV') && this.playerRole === 'impostor') {
      this.tryEnterVent();
    }

    // Q key: Sabotage lights (impostor only)
    if (this.isKeyJustPressed('KeyQ') && this.playerRole === 'impostor') {
      this.trySabotageLights();
    }

    // R key: Sabotage reactor (impostor only)
    if (this.isKeyJustPressed('KeyR') && this.playerRole === 'impostor') {
      this.trySabotageReactor();
    }
  }

  private handleVentControls(): void {
    if (!this.player) return;

    // V key: Exit vent
    if (this.isKeyJustPressed('KeyV')) {
      const exitPos = this.ventSystem.exitVent();
      if (exitPos) {
        this.player.x = exitPos.x;
        this.player.y = exitPos.y;
        this.player.getContainer().visible = true;
        getAudioManager().playSFX('vent');
      }
      return;
    }

    // Arrow keys: Teleport to connected vent
    const currentIdx = this.ventSystem.currentVentIndex;
    if (currentIdx === null) return;

    const connected = this.ventSystem.getConnectedVents(currentIdx);
    if (connected.length === 0) return;

    if (this.isKeyJustPressed('ArrowLeft') || this.isKeyJustPressed('ArrowRight')) {
      const targetIdx = connected[0]; // Teleport to first connected vent
      const pos = this.ventSystem.teleportToVent(targetIdx);
      if (pos) {
        this.player.x = pos.x;
        this.player.y = pos.y;
      }
    }
  }

  // --- Kill system ---

  private canKillAnyone(): boolean {
    if (!this.player) return false;
    const targets = this.getKillTargets();
    return this.killSystem.canKill({ x: this.player.x, y: this.player.y }, targets) !== null;
  }

  private getKillTargets(): KillTarget[] {
    if (this.mode === 'multiplayer' && this.stateSync) {
      const targets: KillTarget[] = [];
      for (const [, remote] of this.stateSync.getRemotePlayers()) {
        if (remote.alive) {
          targets.push({
            id: remote.id,
            x: remote.x,
            y: remote.y,
            alive: remote.alive,
            color: remote.color as PlayerColor,
          });
        }
      }
      return targets;
    }

    return this.botManager.getAliveBots().map((bot) => ({
      id: bot.id,
      x: bot.x,
      y: bot.y,
      alive: bot.alive,
      color: bot.color as PlayerColor,
    }));
  }

  private tryKill(): void {
    if (!this.player || this.playerRole !== 'impostor') return;

    const targets = this.getKillTargets();
    const targetId = this.killSystem.canKill(
      { x: this.player.x, y: this.player.y },
      targets,
    );

    if (!targetId) return;

    const target = targets.find((t) => t.id === targetId);
    if (!target) return;

    // Perform kill
    const body = this.killSystem.performKill(this.localPlayerId, target);

    // Kill the bot
    const bots = this.botManager.getAliveBots();
    const bot = bots.find((b) => b.id === targetId);
    if (bot) {
      bot.kill();
    }

    // Teleport player to victim's position
    this.player.x = target.x;
    this.player.y = target.y;

    // Draw dead body
    this.spawnBodyGraphic(body);

    // Audio
    getAudioManager().playSFX('kill');

    // Update meeting player states
    this.updateMeetingPlayers();
  }

  private tryKillMultiplayer(): void {
    if (!this.wsClient?.isConnected || !this.player) return;

    // Find nearest target from remote players
    const targets = this.getKillTargets();
    const killRange = GAME_CONFIG.KILL_RANGE;

    let nearestId: string | null = null;
    let nearestDist = killRange * killRange;

    for (const t of targets) {
      const dx = this.player.x - t.x;
      const dy = this.player.y - t.y;
      const distSq = dx * dx + dy * dy;
      if (distSq < nearestDist) {
        nearestDist = distSq;
        nearestId = t.id;
      }
    }

    if (nearestId) {
      this.wsClient.send({ type: 'kill', targetId: nearestId });
    }
  }

  private tryReportBodyMultiplayer(): void {
    if (!this.wsClient?.isConnected || !this.player) return;
    // In multiplayer, body IDs come from server messages.
    // For now, report any body in range.
    for (const body of this.killSystem.deadBodies) {
      const dx = this.player.x - body.x;
      const dy = this.player.y - body.y;
      if (dx * dx + dy * dy <= REPORT_RANGE * REPORT_RANGE) {
        this.wsClient.send({ type: 'report_body', bodyId: body.id });
        return;
      }
    }
  }

  private tryUseMultiplayer(): void {
    if (!this.wsClient?.isConnected || !this.player) return;

    // Emergency button
    if (this.isNearEmergencyButton()) {
      this.wsClient.send({ type: 'call_emergency' });
      return;
    }

    // Tasks still handled locally for now
    const nearTask = this.getNearbyTask();
    if (nearTask && !this.taskInProgress) {
      this.taskInProgress = true;
      this.wsClient.send({ type: 'do_task', taskType: nearTask });
      const taskScene = createTaskScene(nearTask);
      sceneManager.push(taskScene);
    }
  }

  private spawnBodyGraphic(body: DeadBody): void {
    const COLOR_HEX: Record<string, number> = {
      red: 0xc51111, blue: 0x132ed1, green: 0x117f2d,
      orange: 0xed7a09, yellow: 0xf5f557, black: 0x3f474e,
      brown: 0x71491e, pink: 0xd6b1ff, purple: 0x6b2fbb,
      white: 0xd5e0ef,
    };

    const g = new Graphics();
    // Draw a simple "body" shape: half-circle (fallen crewmate)
    g.ellipse(0, 0, 20, 12);
    g.fill(COLOR_HEX[body.color] ?? 0xaaaaaa);
    g.circle(8, -8, 8);
    g.fill(COLOR_HEX[body.color] ?? 0xaaaaaa);
    // Bone marker
    const x = new Text({
      text: 'X',
      style: new TextStyle({ fontSize: 14, fill: 0xff0000, fontFamily: 'monospace' }),
    });
    x.anchor.set(0.5);
    x.y = -20;
    g.addChild(x);

    g.x = body.x;
    g.y = body.y;
    this.world.addChild(g);
    this.bodyGraphics.set(body.id, g);
  }

  // --- Report body ---

  private canReportBody(): boolean {
    if (!this.player) return false;
    for (const body of this.killSystem.deadBodies) {
      const dx = this.player.x - body.x;
      const dy = this.player.y - body.y;
      if (dx * dx + dy * dy <= REPORT_RANGE * REPORT_RANGE) {
        return true;
      }
    }
    return false;
  }

  private tryReportBody(): void {
    if (!this.player || !this.canReportBody()) return;
    getAudioManager().playSFX('body_found');
    this.startMeeting(this.localPlayerId, 'body_reported');
  }

  // --- Emergency meeting ---

  private isNearEmergencyButton(): boolean {
    if (!this.player) return false;
    const dx = this.player.x - EMERGENCY_BUTTON.x;
    const dy = this.player.y - EMERGENCY_BUTTON.y;
    return dx * dx + dy * dy <= EMERGENCY_BUTTON_RADIUS * EMERGENCY_BUTTON_RADIUS;
  }

  // --- Vent system ---

  private tryEnterVent(): void {
    if (!this.player || this.playerRole !== 'impostor') return;

    const nearVent = this.ventSystem.getNearestVent(this.player.x, this.player.y);
    if (nearVent === null) return;

    if (this.ventSystem.canEnterVent()) {
      this.ventSystem.enterVent(nearVent);
      this.player.getContainer().visible = false;
      getAudioManager().playSFX('vent');
    }
  }

  // --- Sabotage system ---

  private trySabotage(): void {
    if (this.mode === 'multiplayer') {
      if (this.wsClient?.isConnected) {
        this.wsClient.send({ type: 'sabotage', sabotageType: 'lights' });
      }
      return;
    }
    // Cycle through sabotage types
    if (this.sabotageSystem.cooldownRemaining > 0) return;
    if (this.sabotageSystem.activeSabotage !== null) return;

    // Default to lights
    this.trySabotageLights();
  }

  private trySabotageLights(): void {
    if (this.playerRole !== 'impostor') return;
    if (this.sabotageSystem.cooldownRemaining > 0) return;
    if (this.sabotageSystem.activeSabotage !== null) return;
    this.sabotageSystem.startSabotage('lights');
    getAudioManager().playSFX('crisis_alarm');
  }

  private trySabotageReactor(): void {
    if (this.playerRole !== 'impostor') return;
    if (this.sabotageSystem.cooldownRemaining > 0) return;
    if (this.sabotageSystem.activeSabotage !== null) return;
    this.sabotageSystem.startSabotage('reactor');
    getAudioManager().playSFX('crisis_alarm');
  }

  // --- Task system ---

  private getNearbyTask(): TaskType | null {
    if (!this.player) return null;
    const detectRadius = GAME_CONFIG.TASK_DETECT_RADIUS;
    const detectRadiusSq = detectRadius * detectRadius;

    for (const tl of TASK_LOCATIONS) {
      if (this.tasksCompleted.has(tl.type)) continue;
      const dx = this.player.x - tl.x;
      const dy = this.player.y - tl.y;
      if (dx * dx + dy * dy <= detectRadiusSq) {
        return tl.type;
      }
    }
    return null;
  }

  private tryUse(): void {
    if (!this.player || !this.playerAlive) return;

    // Check emergency button first
    if (this.isNearEmergencyButton() && this.emergencyCooldown <= 0) {
      getAudioManager().playSFX('emergency_alarm');
      this.emergencyCooldown = GAME_CONFIG.MEETING_COOLDOWN;
      this.startMeeting(this.localPlayerId, 'emergency');
      return;
    }

    // Check nearby tasks
    const nearTask = this.getNearbyTask();
    if (nearTask && !this.taskInProgress) {
      this.taskInProgress = true;
      const taskScene = createTaskScene(nearTask);
      sceneManager.push(taskScene);
    }
  }

  private onTaskComplete = (e: Event): void => {
    const detail = (e as CustomEvent).detail;
    if (detail?.type) {
      this.tasksCompleted.add(detail.type as TaskType);
      getAudioManager().playSFX('task_complete');

      // Notify server in multiplayer
      if (this.mode === 'multiplayer' && this.wsClient?.isConnected) {
        this.wsClient.send({ type: 'complete_task', taskType: detail.type });
      }
    }
    this.taskInProgress = false;
  };

  // --- Meeting system ---

  private updateMeetingPlayers(): void {
    const players: Record<string, PlayerState> = {};

    // Local player
    players[this.localPlayerId] = {
      id: this.localPlayerId,
      name: this.playerName,
      color: this.playerColor,
      x: this.player?.x ?? 0,
      y: this.player?.y ?? 0,
      direction: 'down',
      animFrame: 0,
      moving: false,
      alive: this.playerAlive,
      inVent: this.ventSystem.isInVent,
      role: this.playerRole,
      tasksCompleted: this.tasksCompleted.size,
    };

    // Bots (freeplay only)
    if (this.mode === 'freeplay') {
      const bots = this.botManager.getAliveBots();
      const allBots = [...bots];
      for (let i = 0; i < BOT_COUNT; i++) {
        const botId = `bot-${i}`;
        const colors: PlayerColor[] = [
          'blue', 'green', 'orange', 'yellow', 'black', 'brown', 'pink', 'purple', 'white',
        ];
        const bot = allBots.find((b) => b.id === botId);
        const color = colors[i] ?? 'white';
        const name = `Bot ${color.charAt(0).toUpperCase() + color.slice(1)}`;
        players[botId] = {
          id: botId,
          name,
          color,
          x: bot?.x ?? 0,
          y: bot?.y ?? 0,
          direction: 'down',
          animFrame: 0,
          moving: false,
          alive: bot?.alive ?? false,
          inVent: false,
          role: 'crewmate',
          tasksCompleted: 0,
        };
      }
    }

    this.meetingManager.setPlayers(players);
  }

  private startMeeting(callerId: string, reason: 'emergency' | 'body_reported'): void {
    if (this.meetingActive) return;
    this.meetingActive = true;

    // Exit vent if in vent
    if (this.ventSystem.isInVent) {
      this.ventSystem.exitVent();
      if (this.player) {
        this.player.getContainer().visible = true;
      }
    }

    // Update player states
    this.updateMeetingPlayers();

    // Start meeting
    this.meetingManager.callMeeting(callerId, reason);

    if (this.mode === 'freeplay') {
      // Simulate bot votes after a short delay
      const botIds = Array.from({ length: BOT_COUNT }, (_, i) => `bot-${i}`);
      const allPlayerIds = [this.localPlayerId, ...botIds];
      setTimeout(() => {
        this.meetingManager.simulateBotVotes(botIds, allPlayerIds, null);
      }, 2000);
    }

    // Push meeting scene
    this.meetingScene = new MeetingScene(this.meetingManager);
    sceneManager.push(this.meetingScene);

    // Clear dead bodies visually
    for (const [, g] of this.bodyGraphics) {
      this.world.removeChild(g);
    }
    this.bodyGraphics.clear();
    this.killSystem.clearBodies();
  }

  private endMeeting(): void {
    this.meetingActive = false;

    // Pop meeting scene
    if (this.meetingScene) {
      sceneManager.pop();
      this.meetingScene = null;
    }

    // Handle ejection result
    const result = this.meetingManager.result;
    if (result?.ejectedPlayerId) {
      if (result.ejectedPlayerId === this.localPlayerId) {
        this.playerAlive = false;
        if (this.player) {
          this.player.getContainer().visible = false;
        }
        // Impostor ejected -> crew wins
        this.triggerGameOver('crewmate', 'all_impostors_ejected');
        return;
      } else {
        // A bot was ejected - mark them as dead
        const botId = result.ejectedPlayerId;
        const bots = this.botManager.getAliveBots();
        const bot = bots.find((b) => b.id === botId);
        if (bot) {
          bot.kill();
        }
      }
    }

    // Reset meeting
    this.meetingManager.reset();

    // Reset kill cooldown
    this.killSystem.resetCooldown();

    // Update meeting players
    this.updateMeetingPlayers();

    // Check win conditions after ejection
    this.checkWinConditions();
  }

  // --- Win conditions ---

  private checkWinConditions(): void {
    if (this.gameOver || this.mode === 'multiplayer') return;

    // Crew wins: all tasks completed
    if (this.tasksCompleted.size >= TOTAL_TASKS) {
      this.triggerGameOver('crewmate', 'tasks_completed');
      return;
    }

    // Check alive counts
    const aliveBots = this.botManager.getAliveBots().length;

    // Impostor wins: equal or more kills than remaining crew
    // In freeplay, player is impostor. Crew = alive bots
    if (aliveBots <= 1 && this.playerAlive) {
      this.triggerGameOver('impostor', 'all_crewmates_killed');
      return;
    }
  }

  private triggerGameOver(winningRole: PlayerRole, reason: WinReason): void {
    if (this.gameOver) return;
    this.gameOver = true;

    const audio = getAudioManager();
    if (winningRole === this.playerRole) {
      audio.playSFX('victory_impostor');
    } else {
      audio.playSFX('victory_crew');
    }

    const gameOverScene = new GameOverScene(
      winningRole,
      this.playerRole,
      reason,
      [this.playerName],
    );
    sceneManager.push(gameOverScene);
  }

  // --- Rendering updates ---

  private updateCamera(): void {
    if (!this.camera || !this.player) return;
    this.camera.update(this.player.x, this.player.y);
  }

  private updateFog(): void {
    if (!this.player) return;

    // Compute player's screen position
    const playerScreenX = this.player.x + this.world.x;
    const playerScreenY = this.player.y + this.world.y;

    this.fogRenderer.update(
      playerScreenX,
      playerScreenY,
      this.sabotageSystem.isLightsSabotaged(),
      this.sabotageSystem.isReactorActive(),
      window.innerWidth,
      window.innerHeight,
    );
  }

  private updateHUD(): void {
    if (!this.player) return;

    const canKill = this.playerRole === 'impostor' && this.canKillAnyone();
    const canReport = this.canReportBody();
    const nearTask = this.getNearbyTask();
    const nearButton = this.isNearEmergencyButton();
    const canUse = (nearTask !== null || (nearButton && this.emergencyCooldown <= 0)) && this.playerAlive;

    const state: HUDState = {
      role: this.playerRole,
      alive: this.playerAlive,
      killCooldown: this.killSystem.cooldownRemaining,
      killCooldownMax: GAME_CONFIG.KILL_COOLDOWN,
      canKill,
      canReport,
      canUse,
      canSabotage: this.playerRole === 'impostor' &&
        this.sabotageSystem.cooldownRemaining <= 0 &&
        this.sabotageSystem.activeSabotage === null,
      taskProgress: this.tasksCompleted.size / TOTAL_TASKS,
      inMeeting: this.meetingActive,
    };

    this.hud.update(state);
  }

  private updateAudio(): void {
    if (!this.player) return;

    const audio = getAudioManager();
    const movement = inputManager.getMovementVector();
    const moving = movement.x !== 0 || movement.y !== 0;

    if (moving && this.playerAlive && !this.ventSystem.isInVent) {
      audio.playFootstep();
    }

    audio.updateAmbient(this.player.x, this.player.y);
  }

  private onResize = (): void => {
    this.camera?.resize(window.innerWidth, window.innerHeight);
  };
}
