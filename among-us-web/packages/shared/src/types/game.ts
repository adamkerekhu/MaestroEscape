import type { PlayerColor, PlayerState } from "./player";

export type GamePhase =
  | "lobby"
  | "starting"
  | "playing"
  | "meeting"
  | "voting"
  | "ejecting"
  | "game_over";

export type SabotageType = "lights" | "reactor";

export type TaskType =
  | "fix_wiring"
  | "stabilize_nav"
  | "empty_garbage"
  | "reboot_wifi"
  | "divert_power"
  | "align_engine"
  | "fuel_engine"
  | "clear_asteroids";

export type WinReason =
  | "tasks_completed"
  | "all_impostors_ejected"
  | "all_crewmates_killed"
  | "sabotage_meltdown"
  | "disconnect";

export interface TaskState {
  type: TaskType;
  completed: boolean;
}

export interface SabotageState {
  type: SabotageType;
  active: boolean;
  timeRemaining: number;
}

export interface VoteState {
  votes: Record<string, string | "skip">;
  timeRemaining: number;
}

export interface DeadBody {
  id: string;
  playerId: string;
  x: number;
  y: number;
  color: PlayerColor;
}

export interface GameState {
  phase: GamePhase;
  players: Record<string, PlayerState>;
  tasks: TaskState[];
  totalTaskCount: number;
  completedTaskCount: number;
  sabotage: SabotageState | null;
  deadBodies: DeadBody[];
  vote: VoteState | null;
  winReason: WinReason | null;
  winningRole: "crewmate" | "impostor" | null;
  ejectedPlayerId: string | null;
}
