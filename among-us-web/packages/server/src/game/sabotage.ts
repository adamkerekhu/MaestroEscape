import type { SabotageType } from '@among-us/shared';
import { GAME_CONFIG } from '@among-us/shared';
import type { ServerGameState } from './game-state';

export function startSabotage(
  state: ServerGameState,
  sabotageType: SabotageType,
): boolean {
  if (state.sabotage) return false;
  if (state.phase !== 'playing') return false;

  const timeRemaining =
    sabotageType === 'reactor' ? GAME_CONFIG.REACTOR_MELTDOWN_TIME : 0;

  state.sabotage = { type: sabotageType, timeRemaining };
  return true;
}

export function fixSabotage(
  state: ServerGameState,
  sabotageType: SabotageType,
): boolean {
  if (!state.sabotage || state.sabotage.type !== sabotageType) return false;
  state.sabotage = null;
  return true;
}
