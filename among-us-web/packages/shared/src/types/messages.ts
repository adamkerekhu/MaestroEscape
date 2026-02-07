import type { PlayerColor, Direction, PlayerRole } from "./player";
import type {
  GamePhase,
  SabotageType,
  TaskType,
  WinReason,
  GameState,
  DeadBody,
  VoteState,
} from "./game";

// --- Client -> Server messages ---

export type ClientMessage =
  | JoinMessage
  | MoveMessage
  | StopMessage
  | KillMessage
  | ReportBodyMessage
  | CallEmergencyMessage
  | VoteMessage
  | DoTaskMessage
  | CompleteTaskMessage
  | EnterVentMessage
  | ExitVentMessage
  | VentTeleportMessage
  | SabotageMessage
  | FixSabotageMessage;

export interface JoinMessage {
  type: "join";
  name: string;
  color: PlayerColor;
}

export interface MoveMessage {
  type: "move";
  direction: Direction;
  x: number;
  y: number;
}

export interface StopMessage {
  type: "stop";
  x: number;
  y: number;
}

export interface KillMessage {
  type: "kill";
  targetId: string;
}

export interface ReportBodyMessage {
  type: "report_body";
  bodyId: string;
}

export interface CallEmergencyMessage {
  type: "call_emergency";
}

export interface VoteMessage {
  type: "vote";
  targetId: string | "skip";
}

export interface DoTaskMessage {
  type: "do_task";
  taskType: TaskType;
}

export interface CompleteTaskMessage {
  type: "complete_task";
  taskType: TaskType;
}

export interface EnterVentMessage {
  type: "enter_vent";
  ventIndex: number;
}

export interface ExitVentMessage {
  type: "exit_vent";
}

export interface VentTeleportMessage {
  type: "vent_teleport";
  targetVentIndex: number;
}

export interface SabotageMessage {
  type: "sabotage";
  sabotageType: SabotageType;
}

export interface FixSabotageMessage {
  type: "fix_sabotage";
  sabotageType: SabotageType;
}

// --- Server -> Client messages ---

export type ServerMessage =
  | WelcomeMessage
  | PlayerJoinedMessage
  | PlayerLeftMessage
  | GameStartMessage
  | GameStateUpdateMessage
  | PlayerMovedMessage
  | PlayerStoppedMessage
  | PlayerKilledMessage
  | BodyReportedMessage
  | MeetingStartedMessage
  | VoteUpdateMessage
  | VoteResultMessage
  | PlayerEjectedMessage
  | TaskCompletedMessage
  | TaskProgressMessage
  | SabotageStartedMessage
  | SabotageFixedMessage
  | PlayerEnteredVentMessage
  | PlayerExitedVentMessage
  | GameOverMessage
  | ErrorMessage;

export interface WelcomeMessage {
  type: "welcome";
  playerId: string;
  gameState: GameState;
}

export interface PlayerJoinedMessage {
  type: "player_joined";
  playerId: string;
  name: string;
  color: PlayerColor;
  x: number;
  y: number;
}

export interface PlayerLeftMessage {
  type: "player_left";
  playerId: string;
}

export interface GameStartMessage {
  type: "game_start";
  role: PlayerRole;
  impostorIds: string[];
  tasks: { type: TaskType; completed: boolean }[];
}

export interface GameStateUpdateMessage {
  type: "game_state_update";
  gameState: GameState;
}

export interface PlayerMovedMessage {
  type: "player_moved";
  playerId: string;
  x: number;
  y: number;
  direction: Direction;
  animFrame: number;
}

export interface PlayerStoppedMessage {
  type: "player_stopped";
  playerId: string;
  x: number;
  y: number;
}

export interface PlayerKilledMessage {
  type: "player_killed";
  killerId: string;
  victimId: string;
  body: DeadBody;
}

export interface BodyReportedMessage {
  type: "body_reported";
  reporterId: string;
  bodyId: string;
}

export interface MeetingStartedMessage {
  type: "meeting_started";
  callerId: string;
  reason: "emergency" | "body_reported";
  timeRemaining: number;
}

export interface VoteUpdateMessage {
  type: "vote_update";
  vote: VoteState;
}

export interface VoteResultMessage {
  type: "vote_result";
  votes: Record<string, string | "skip">;
  ejectedPlayerId: string | null;
  ejectedWasImpostor: boolean | null;
}

export interface PlayerEjectedMessage {
  type: "player_ejected";
  playerId: string;
  wasImpostor: boolean;
  color: PlayerColor;
}

export interface TaskCompletedMessage {
  type: "task_completed";
  playerId: string;
  taskType: TaskType;
}

export interface TaskProgressMessage {
  type: "task_progress";
  completedTaskCount: number;
  totalTaskCount: number;
}

export interface SabotageStartedMessage {
  type: "sabotage_started";
  sabotageType: SabotageType;
  timeRemaining: number;
}

export interface SabotageFixedMessage {
  type: "sabotage_fixed";
  sabotageType: SabotageType;
}

export interface PlayerEnteredVentMessage {
  type: "player_entered_vent";
  playerId: string;
  ventIndex: number;
}

export interface PlayerExitedVentMessage {
  type: "player_exited_vent";
  playerId: string;
  ventIndex: number;
}

export interface GameOverMessage {
  type: "game_over";
  winningRole: "crewmate" | "impostor";
  winReason: WinReason;
  impostorIds: string[];
}

export interface ErrorMessage {
  type: "error";
  message: string;
}
