import { GAME_CONFIG, VENT_POSITIONS, VENT_CONNECTIONS } from '@among-us/shared';

const VENT_PROXIMITY = 100;
const VENT_PROXIMITY_SQ = VENT_PROXIMITY * VENT_PROXIMITY;

function distanceSq(ax: number, ay: number, bx: number, by: number): number {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy;
}

export class VentSystem {
  private _isInVent = false;
  private _currentVentIndex: number | null = null;
  private enterCooldown = 0;
  private teleportCooldown = 0;
  private exitCooldown = 0;

  get isInVent(): boolean {
    return this._isInVent;
  }

  get currentVentIndex(): number | null {
    return this._currentVentIndex;
  }

  update(dt: number): void {
    const dtMs = dt * 1000;
    if (this.enterCooldown > 0) {
      this.enterCooldown = Math.max(0, this.enterCooldown - dtMs);
    }
    if (this.teleportCooldown > 0) {
      this.teleportCooldown = Math.max(0, this.teleportCooldown - dtMs);
    }
    if (this.exitCooldown > 0) {
      this.exitCooldown = Math.max(0, this.exitCooldown - dtMs);
    }
  }

  getNearestVent(playerX: number, playerY: number): number | null {
    let nearest: number | null = null;
    let nearestDist = Infinity;

    for (let i = 0; i < VENT_POSITIONS.length; i++) {
      const v = VENT_POSITIONS[i];
      const d = distanceSq(playerX, playerY, v.x, v.y);
      if (d <= VENT_PROXIMITY_SQ && d < nearestDist) {
        nearestDist = d;
        nearest = i;
      }
    }

    return nearest;
  }

  canEnterVent(): boolean {
    return !this._isInVent && this.enterCooldown <= 0;
  }

  enterVent(ventIndex: number): void {
    if (!this.canEnterVent()) return;
    this._isInVent = true;
    this._currentVentIndex = ventIndex;
    this.enterCooldown = GAME_CONFIG.VENT_ENTER_COOLDOWN;
    this.teleportCooldown = GAME_CONFIG.VENT_TELEPORT_COOLDOWN;
  }

  getConnectedVents(ventIndex: number): number[] {
    const connected: number[] = [];
    for (const group of VENT_CONNECTIONS) {
      const pos = group.indexOf(ventIndex);
      if (pos !== -1) {
        for (const idx of group) {
          if (idx !== ventIndex) connected.push(idx);
        }
      }
    }
    return connected;
  }

  canTeleport(): boolean {
    return this._isInVent && this.teleportCooldown <= 0;
  }

  teleportToVent(targetIndex: number): { x: number; y: number } | null {
    if (!this.canTeleport()) return null;
    if (this._currentVentIndex === null) return null;

    const connected = this.getConnectedVents(this._currentVentIndex);
    if (!connected.includes(targetIndex)) return null;

    this._currentVentIndex = targetIndex;
    this.teleportCooldown = GAME_CONFIG.VENT_TELEPORT_COOLDOWN;
    const pos = VENT_POSITIONS[targetIndex];
    return { x: pos.x, y: pos.y };
  }

  canExitVent(): boolean {
    return this._isInVent && this.exitCooldown <= 0;
  }

  exitVent(): { x: number; y: number } | null {
    if (!this.canExitVent()) return null;
    if (this._currentVentIndex === null) return null;

    const pos = VENT_POSITIONS[this._currentVentIndex];
    this._isInVent = false;
    this._currentVentIndex = null;
    this.exitCooldown = GAME_CONFIG.VENT_ENTER_COOLDOWN;
    return { x: pos.x, y: pos.y };
  }

  reset(): void {
    this._isInVent = false;
    this._currentVentIndex = null;
    this.enterCooldown = 0;
    this.teleportCooldown = 0;
    this.exitCooldown = 0;
  }
}
