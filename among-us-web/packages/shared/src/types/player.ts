export const PLAYER_COLORS = [
  "red",
  "blue",
  "green",
  "orange",
  "yellow",
  "black",
  "brown",
  "pink",
  "purple",
  "white",
] as const;

export type PlayerColor = (typeof PLAYER_COLORS)[number];

export type Direction = "left" | "right" | "up" | "down";

export type PlayerRole = "crewmate" | "impostor";

export interface PlayerState {
  id: string;
  name: string;
  color: PlayerColor;
  x: number;
  y: number;
  direction: Direction;
  animFrame: number;
  moving: boolean;
  alive: boolean;
  inVent: boolean;
  role: PlayerRole;
  tasksCompleted: number;
}
