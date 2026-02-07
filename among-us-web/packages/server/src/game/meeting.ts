import type { ServerGameState } from './game-state';

export function startMeeting(state: ServerGameState, callerId: string): void {
  state.phase = 'voting';
  state.votes.clear();
  state.meetingCallerId = callerId;
  state.deadBodies = [];
  state.lastMeetingTime = Date.now();
}

export function castVote(
  state: ServerGameState,
  voterId: string,
  targetId: string | 'skip',
): boolean {
  const voter = state.players.get(voterId);
  if (!voter || !voter.alive) return false;
  if (state.votes.has(voterId)) return false;

  if (targetId !== 'skip') {
    const target = state.players.get(targetId);
    if (!target || !target.alive) return false;
  }

  state.votes.set(voterId, targetId);
  return true;
}

export function allVotesCast(state: ServerGameState): boolean {
  const alivePlayers = state.getAlivePlayers();
  return alivePlayers.every(p => state.votes.has(p.id));
}

export function tallyVotes(
  state: ServerGameState,
): { ejectedPlayerId: string | null; votes: Record<string, string | 'skip'> } {
  const voteCounts = new Map<string, number>();
  let skipCount = 0;

  for (const target of state.votes.values()) {
    if (target === 'skip') {
      skipCount++;
    } else {
      voteCounts.set(target, (voteCounts.get(target) || 0) + 1);
    }
  }

  let maxVotes = skipCount;
  let ejectedPlayerId: string | null = null;
  let tie = false;

  for (const [playerId, count] of voteCounts) {
    if (count > maxVotes) {
      maxVotes = count;
      ejectedPlayerId = playerId;
      tie = false;
    } else if (count === maxVotes && ejectedPlayerId !== null) {
      tie = true;
    }
  }

  if (tie) {
    ejectedPlayerId = null;
  }

  const votes = Object.fromEntries(state.votes);
  return { ejectedPlayerId, votes };
}

export function ejectPlayer(state: ServerGameState, playerId: string): boolean {
  const player = state.players.get(playerId);
  if (!player) return false;
  player.alive = false;
  return state.impostorIds.has(playerId);
}
