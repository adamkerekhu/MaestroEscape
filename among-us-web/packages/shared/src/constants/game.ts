export const GAME_CONFIG = {
  // Screen / canvas dimensions (from settings.py WIDTH, HEIGHT)
  SCREEN_WIDTH: 1280,
  SCREEN_HEIGHT: 640,

  // Tile and grid (from settings.py TILESIZE)
  TILE_SIZE: 32,
  GRID_WIDTH: 40, // 1280 / 32
  GRID_HEIGHT: 20, // 640 / 32

  // Map dimensions (from game.py mini_map calculations: 5792 x 3168)
  MAP_WIDTH: 5792,
  MAP_HEIGHT: 3168,

  // Player (from settings.py PLAYER_SPEED; sprite sizes 64x86)
  PLAYER_SPEED: 400,
  PLAYER_SPRITE_WIDTH: 64,
  PLAYER_SPRITE_HEIGHT: 86,

  // Frame counts for animations (from settings.py sprite loading loops)
  ANIM_FRAMES_WALK: 17,
  ANIM_FRAMES_DOWN: 18,

  // Target FPS (from settings.py FPS)
  FPS: 60,

  // Missions / tasks (from settings.py NO_OF_MISSIONS)
  TOTAL_TASKS: 8,

  // Max players (original has 1 player + 9 bots = 10 total)
  MAX_PLAYERS: 10,
  MIN_PLAYERS_TO_START: 4,
  IMPOSTORS_PER_GAME: 1,

  // Timers (seconds, from game.py timer initializations)
  KILL_COOLDOWN: 15,
  SABOTAGE_COOLDOWN: 15,
  REACTOR_MELTDOWN_TIME: 20,
  MEETING_DURATION: 30,
  MEETING_COOLDOWN: 15,
  LIGHTS_SABOTAGE_COOLDOWN: 15,
  GAME_START_DELAY: 3,

  // Vent cooldowns (milliseconds, from game.py vent logic)
  VENT_ENTER_COOLDOWN: 500,
  VENT_TELEPORT_COOLDOWN: 750,

  // Interaction radii (from settings.py)
  TASK_DETECT_RADIUS: 250,
  SABOTAGE_FIX_RADIUS: 50,
  KILL_RANGE: 150,
  REPORT_BODY_RANGE: 250,

  // Task-specific radii (from settings.py)
  STABILIZE_NAV_RADIUS: 140,
  EMPTY_GARBAGE_RADIUS: 70,
  REBOOT_WIFI_RADIUS: 50,
  FIX_WIRING_RADIUS: 50,
  VIEW_ADMIN_MAP_RADIUS: 85,
  VIEW_SECURITY_MONITOR_RADIUS: 170,
  DIVERT_POWER_RADIUS: 50,
  ALIGN_ENGINE_RADIUS: 50,
  PICK_GAS_CAN_RADIUS: 50,
  FUEL_ENGINE_RADIUS: 50,

  // Visual (from settings.py LIGHT_RADIUS)
  LIGHT_RADIUS: 500,
} as const;

// Spawn positions for players (from game.py self.player_pos)
export const SPAWN_POSITIONS: ReadonlyArray<{ x: number; y: number }> = [
  { x: 3288, y: 873 },
  { x: 3046, y: 791 },
  { x: 3046, y: 651 },
  { x: 3563, y: 653 },
  { x: 3563, y: 762 },
  { x: 2968, y: 530 },
  { x: 3566, y: 553 },
];

// Vent locations (from game.py self.vent)
export const VENT_POSITIONS: ReadonlyArray<{ x: number; y: number }> = [
  { x: 3898, y: 791 },
  { x: 5309, y: 1144 },
  { x: 5309, y: 1525 },
  { x: 4513, y: 1525 },
  { x: 4531, y: 2459 },
  { x: 3694, y: 1942 },
  { x: 2220, y: 1711 },
  { x: 1580, y: 2407 },
  { x: 1887, y: 1578 },
  { x: 931, y: 1626 },
  { x: 802, y: 1151 },
  { x: 1586, y: 460 },
  { x: 2121, y: 1249 },
  { x: 4447, y: 363 },
];

// Bot/NPC spawn positions (from settings.py BOT_POS)
export const BOT_POSITIONS: ReadonlyArray<{ x: number; y: number }> = [
  { x: 5401, y: 1530 },
  { x: 3686, y: 1857 },
  { x: 3733, y: 2626 },
  { x: 2325, y: 1814 },
  { x: 1718, y: 1282 },
  { x: 1288, y: 2418 },
  { x: 1249, y: 506 },
  { x: 2513, y: 1286 },
];

// Vent connectivity: which vents connect to each other (indices into VENT_POSITIONS)
// Grouped by proximity / room pairings based on the map layout
export const VENT_CONNECTIONS: ReadonlyArray<ReadonlyArray<number>> = [
  [0, 1], // cafeteria area <-> upper engine area
  [1, 2], // upper right vents
  [2, 3], // right side vents
  [4, 5], // lower right <-> middle
  [6, 7, 8], // left side cluster
  [9, 10], // far left vents
  [11, 12], // upper left vents
  [13, 0], // top vent <-> cafeteria
];

// Ambient sound detection radii per room (from settings.py)
export const ROOM_AMBIENT_RADII = {
  cafeteria: 750,
  medbay: 450,
  security: 350,
  reactor: 450,
  upper_engine: 400,
  lower_engine: 400,
  electrical: 570,
  storage: 580,
  admin: 400,
  communications: 370,
  oxygen: 250,
  cockpit: 300,
  weapons: 400,
} as const;
