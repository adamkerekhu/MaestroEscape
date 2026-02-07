import type { TaskType } from '@among-us/shared';
import type { ServerGameState, ServerPlayerState } from './game-state';

const ALL_TASKS: TaskType[] = [
  'fix_wiring',
  'stabilize_nav',
  'empty_garbage',
  'reboot_wifi',
  'divert_power',
  'align_engine',
  'fuel_engine',
  'clear_asteroids',
];

/** Assign a random subset of tasks to a player using Fisher-Yates shuffle. */
export function assignTasks(player: ServerPlayerState, count: number): void {
  const shuffled = [...ALL_TASKS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  player.assignedTasks = shuffled.slice(0, Math.min(count, shuffled.length));
  player.completedTasks = new Set();
}

/** Record a task completion. Returns true if the task was valid and newly completed. */
export function completeTask(
  state: ServerGameState,
  playerId: string,
  taskType: TaskType,
): boolean {
  const player = state.players.get(playerId);
  if (!player || !player.alive) return false;
  if (state.impostorIds.has(playerId)) return false;
  if (!player.assignedTasks.includes(taskType)) return false;
  if (player.completedTasks.has(taskType)) return false;

  player.completedTasks.add(taskType);
  player.tasksCompleted = player.completedTasks.size;
  return true;
}
