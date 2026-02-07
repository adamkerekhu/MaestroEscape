import type { PlayerColor, PlayerState } from '@among-us/shared';
import { GAME_CONFIG } from '@among-us/shared';

export type MeetingPhase =
  | 'none'
  | 'alert'
  | 'discussion'
  | 'voting'
  | 'results'
  | 'ejecting';

export interface MeetingVoteResult {
  votes: Record<string, string | 'skip'>;
  ejectedPlayerId: string | null;
  ejectedWasImpostor: boolean | null;
}

export interface MeetingInfo {
  callerId: string;
  reason: 'emergency' | 'body_reported';
}

const ALERT_DURATION = 1.5;
const RESULTS_DURATION = 3;
const EJECT_DURATION = 3;

export class MeetingManager {
  private _phase: MeetingPhase = 'none';
  private timer = 0;
  private _meetingInfo: MeetingInfo | null = null;
  private _votes: Record<string, string | 'skip'> = {};
  private _voteTimeRemaining = 0;
  private _result: MeetingVoteResult | null = null;
  private _localPlayerId = '';
  private _players: Record<string, PlayerState> = {};

  get phase(): MeetingPhase {
    return this._phase;
  }

  get meetingInfo(): MeetingInfo | null {
    return this._meetingInfo;
  }

  get votes(): Record<string, string | 'skip'> {
    return this._votes;
  }

  get voteTimeRemaining(): number {
    return this._voteTimeRemaining;
  }

  get result(): MeetingVoteResult | null {
    return this._result;
  }

  get localPlayerId(): string {
    return this._localPlayerId;
  }

  get players(): Record<string, PlayerState> {
    return this._players;
  }

  get hasLocalVoted(): boolean {
    return this._localPlayerId in this._votes;
  }

  setLocalPlayerId(id: string): void {
    this._localPlayerId = id;
  }

  setPlayers(players: Record<string, PlayerState>): void {
    this._players = players;
  }

  callMeeting(callerId: string, reason: 'emergency' | 'body_reported'): void {
    this._phase = 'alert';
    this.timer = ALERT_DURATION;
    this._meetingInfo = { callerId, reason };
    this._votes = {};
    this._result = null;
  }

  castVote(targetId: string | 'skip'): void {
    if (this._phase !== 'voting') return;
    if (this.hasLocalVoted) return;
    this._votes[this._localPlayerId] = targetId;
  }

  receiveVoteUpdate(votes: Record<string, string | 'skip'>, timeRemaining: number): void {
    this._votes = votes;
    this._voteTimeRemaining = timeRemaining;
  }

  receiveVoteResult(result: MeetingVoteResult): void {
    this._result = result;
    this._votes = result.votes;
    this._phase = 'results';
    this.timer = RESULTS_DURATION;
  }

  /** In freeplay mode, simulate bot votes */
  simulateBotVotes(
    botIds: string[],
    allPlayerIds: string[],
    impostorId: string | null,
  ): void {
    for (const botId of botIds) {
      if (botId in this._votes) continue;
      const player = this._players[botId];
      if (!player || !player.alive) continue;

      const roll = Math.random();
      if (roll < 0.15) {
        // 15% chance to skip
        this._votes[botId] = 'skip';
      } else if (impostorId && roll < 0.35) {
        // 20% chance to vote for the actual impostor
        this._votes[botId] = impostorId;
      } else {
        // Vote for a random alive player
        const candidates = allPlayerIds.filter(
          (id) => id !== botId && this._players[id]?.alive,
        );
        if (candidates.length > 0) {
          this._votes[botId] = candidates[Math.floor(Math.random() * candidates.length)];
        } else {
          this._votes[botId] = 'skip';
        }
      }
    }
  }

  /** Tally votes and determine ejection in freeplay mode */
  tallyVotes(): MeetingVoteResult {
    const tally: Record<string, number> = { skip: 0 };

    for (const vote of Object.values(this._votes)) {
      tally[vote] = (tally[vote] ?? 0) + 1;
    }

    let maxVotes = 0;
    let maxTarget: string | null = null;
    let tie = false;

    for (const [target, count] of Object.entries(tally)) {
      if (count > maxVotes) {
        maxVotes = count;
        maxTarget = target;
        tie = false;
      } else if (count === maxVotes) {
        tie = true;
      }
    }

    const ejectedPlayerId = tie || maxTarget === 'skip' ? null : maxTarget;
    let ejectedWasImpostor: boolean | null = null;
    if (ejectedPlayerId) {
      ejectedWasImpostor = this._players[ejectedPlayerId]?.role === 'impostor';
    }

    const result: MeetingVoteResult = {
      votes: { ...this._votes },
      ejectedPlayerId,
      ejectedWasImpostor,
    };

    this._result = result;
    return result;
  }

  update(dt: number): void {
    if (this._phase === 'none') return;

    this.timer -= dt;

    switch (this._phase) {
      case 'alert':
        if (this.timer <= 0) {
          this._phase = 'discussion';
          this._voteTimeRemaining = GAME_CONFIG.MEETING_DURATION;
          // Transition quickly to voting for freeplay
          this._phase = 'voting';
        }
        break;
      case 'voting':
        this._voteTimeRemaining -= dt;
        if (this._voteTimeRemaining <= 0) {
          this._voteTimeRemaining = 0;
          // Force remaining players to skip
          for (const [id, player] of Object.entries(this._players)) {
            if (player.alive && !(id in this._votes)) {
              this._votes[id] = 'skip';
            }
          }
          const result = this.tallyVotes();
          this.receiveVoteResult(result);
        }
        break;
      case 'results':
        if (this.timer <= 0) {
          if (this._result?.ejectedPlayerId) {
            this._phase = 'ejecting';
            this.timer = EJECT_DURATION;
          } else {
            this.reset();
          }
        }
        break;
      case 'ejecting':
        if (this.timer <= 0) {
          this.reset();
        }
        break;
    }
  }

  reset(): void {
    this._phase = 'none';
    this.timer = 0;
    this._meetingInfo = null;
    this._votes = {};
    this._result = null;
    this._voteTimeRemaining = 0;
  }
}
