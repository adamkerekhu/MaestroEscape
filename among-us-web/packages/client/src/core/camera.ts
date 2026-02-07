import { Container } from 'pixi.js';

export class Camera {
  private worldContainer: Container;
  private mapWidth: number;
  private mapHeight: number;
  private screenWidth: number;
  private screenHeight: number;

  constructor(
    worldContainer: Container,
    mapWidth: number,
    mapHeight: number,
    screenWidth: number,
    screenHeight: number,
  ) {
    this.worldContainer = worldContainer;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
  }

  resize(screenWidth: number, screenHeight: number): void {
    this.screenWidth = screenWidth;
    this.screenHeight = screenHeight;
  }

  update(playerX: number, playerY: number): void {
    let x = -playerX + this.screenWidth / 2;
    let y = -playerY + this.screenHeight / 2;

    // Clamp to map bounds
    x = Math.min(0, x);
    x = Math.max(-(this.mapWidth - this.screenWidth), x);
    y = Math.min(0, y);
    y = Math.max(-(this.mapHeight - this.screenHeight), y);

    this.worldContainer.x = x;
    this.worldContainer.y = y;
  }
}
