import type { WinReason } from '@among-us/shared';
import type { ServerGameState } from './game-state';

export interface WinResult {
  winner: 'crewmate' | 'impostor' | null;
  reason: WinReason | null;
}

export function checkWinCondition(state: ServerGameState): WinResult {
  // All impostors ejected or dead
  const aliveImpostors = state.getAliveImpostors();
  if (aliveImpostors.length === 0 && state.impostorIds.size > 0) {
    return { winner: 'crewmate', reason: 'all_impostors_ejected' };
  }

  // All tasks completed
  const { completedTaskCount, totalTaskCount } = state.getTaskProgress();
  if (totalTaskCount > 0 && completedTaskCount >= totalTaskCount) {
    return { winner: 'crewmate', reason: 'tasks_completed' };
  }

  // Impostors outnumber or equal crewmates
  const aliveCrewmates = state.getAliveCrewmates();
  if (aliveImpostors.length >= aliveCrewmates.length && aliveCrewmates.length > 0) {
    return { winner: 'impostor', reason: 'all_crewmates_killed' };
  }

  // Reactor meltdown
  if (state.sabotage?.type === 'reactor' && state.sabotage.timeRemaining <= 0) {
    return { winner: 'impostor', reason: 'sabotage_meltdown' };
  }

  return { winner: null, reason: null };
}
