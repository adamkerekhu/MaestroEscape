import type { SabotageType } from '@among-us/shared';
import { GAME_CONFIG } from '@among-us/shared';

export class SabotageSystem {
  activeSabotage: SabotageType | null = null;
  cooldownRemaining = 0;
  meltdownTimer = 0;

  startSabotage(type: SabotageType): void {
    this.activeSabotage = type;
    if (type === 'reactor') {
      this.meltdownTimer = GAME_CONFIG.REACTOR_MELTDOWN_TIME;
    }
  }

  fixSabotage(_type: SabotageType): void {
    this.activeSabotage = null;
    this.meltdownTimer = 0;
    this.cooldownRemaining = GAME_CONFIG.SABOTAGE_COOLDOWN;
  }

  update(dt: number): void {
    if (this.cooldownRemaining > 0) {
      this.cooldownRemaining = Math.max(0, this.cooldownRemaining - dt);
    }

    if (this.activeSabotage === 'reactor' && this.meltdownTimer > 0) {
      this.meltdownTimer = Math.max(0, this.meltdownTimer - dt);
    }
  }

  isLightsSabotaged(): boolean {
    return this.activeSabotage === 'lights';
  }

  isReactorActive(): boolean {
    return this.activeSabotage === 'reactor';
  }

  getMeltdownTimeRemaining(): number {
    return this.meltdownTimer;
  }
}
