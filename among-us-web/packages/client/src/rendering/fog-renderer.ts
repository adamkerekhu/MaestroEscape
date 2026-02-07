import { Container, Graphics } from 'pixi.js';
import { GAME_CONFIG } from '@among-us/shared';

const FOG_ALPHA_LIGHTS = 0.85;
const FOG_ALPHA_REACTOR = 0.6;
const FOG_COLOR_LIGHTS = 0x141414; // NIGHT_COLOR (20,20,20) from settings.py
const FOG_COLOR_REACTOR = 0xc81414; // NIGHT_COLOR_REACTOR (200,20,20) from settings.py

export class FogRenderer {
  private container = new Container();
  private fog = new Graphics();

  constructor() {
    this.container.addChild(this.fog);
    this.container.visible = false;
  }

  getContainer(): Container {
    return this.container;
  }

  update(
    playerScreenX: number,
    playerScreenY: number,
    isLightsSabotaged: boolean,
    isReactorActive: boolean,
    screenWidth: number,
    screenHeight: number,
  ): void {
    if (!isLightsSabotaged && !isReactorActive) {
      this.container.visible = false;
      return;
    }

    this.container.visible = true;
    this.fog.clear();

    const color = isReactorActive ? FOG_COLOR_REACTOR : FOG_COLOR_LIGHTS;
    const alpha = isReactorActive ? FOG_ALPHA_REACTOR : FOG_ALPHA_LIGHTS;
    const radius = GAME_CONFIG.LIGHT_RADIUS;

    // Draw the dark overlay covering the whole screen, then cut a circle
    // around the player position to create a spotlight effect.
    this.fog.rect(0, 0, screenWidth, screenHeight);
    this.fog.circle(playerScreenX, playerScreenY, radius);
    this.fog.cut();
    this.fog.fill({ color, alpha });
  }
}
