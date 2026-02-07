import { GAME_CONFIG } from '@among-us/shared';
import type { DeadBody, PlayerColor } from '@among-us/shared';

export interface KillTarget {
  id: string;
  x: number;
  y: number;
  alive: boolean;
  color: PlayerColor;
}

function distanceSq(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

export class KillSystem {
  cooldownRemaining: number;
  readonly deadBodies: DeadBody[] = [];

  private readonly killRangeSq: number;
  private bodyIdCounter = 0;

  constructor() {
    this.cooldownRemaining = GAME_CONFIG.KILL_COOLDOWN;
    this.killRangeSq = GAME_CONFIG.KILL_RANGE * GAME_CONFIG.KILL_RANGE;
  }

  update(dt: number): void {
    if (this.cooldownRemaining > 0) {
      this.cooldownRemaining = Math.max(0, this.cooldownRemaining - dt);
    }
  }

  canKill(
    playerPos: { x: number; y: number },
    targets: KillTarget[],
  ): string | null {
    if (this.cooldownRemaining > 0) return null;

    let closestId: string | null = null;
    let closestDist = Infinity;

    for (const t of targets) {
      if (!t.alive) continue;
      const d = distanceSq(playerPos.x, playerPos.y, t.x, t.y);
      if (d <= this.killRangeSq && d < closestDist) {
        closestDist = d;
        closestId = t.id;
      }
    }

    return closestId;
  }

  performKill(killerId: string, victim: KillTarget): DeadBody {
    const body: DeadBody = {
      id: `body_${killerId}_${this.bodyIdCounter++}`,
      playerId: victim.id,
      x: victim.x,
      y: victim.y,
      color: victim.color,
    };
    this.deadBodies.push(body);
    this.cooldownRemaining = GAME_CONFIG.KILL_COOLDOWN;
    return body;
  }

  resetCooldown(): void {
    this.cooldownRemaining = GAME_CONFIG.KILL_COOLDOWN;
  }

  removeBody(bodyId: string): void {
    const idx = this.deadBodies.findIndex((b) => b.id === bodyId);
    if (idx !== -1) this.deadBodies.splice(idx, 1);
  }

  clearBodies(): void {
    this.deadBodies.length = 0;
  }
}
