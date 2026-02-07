import { Spritesheet } from 'pixi.js';
import {
  DirectionalAnimatedSprite,
  type Direction,
} from '../rendering/sprite-animation';

const LERP_SPEED = 12; // Higher = snappier interpolation

export class RemotePlayer {
  private sprite: DirectionalAnimatedSprite;
  private targetX: number;
  private targetY: number;
  private targetDirection: Direction = 'down';
  private moving = false;

  x: number;
  y: number;
  id: string;
  color: string;
  name: string;
  alive = true;

  constructor(
    id: string,
    name: string,
    sheet: Spritesheet,
    color: string,
    startX: number,
    startY: number,
  ) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.sprite = new DirectionalAnimatedSprite(sheet, color);
    this.x = startX;
    this.y = startY;
    this.targetX = startX;
    this.targetY = startY;
    this.syncSpritePosition();
  }

  setTargetPosition(x: number, y: number, direction: Direction): void {
    this.targetX = x;
    this.targetY = y;
    this.targetDirection = direction;
    this.moving = true;
  }

  stop(x: number, y: number): void {
    this.targetX = x;
    this.targetY = y;
    this.x = x;
    this.y = y;
    this.moving = false;
    this.syncSpritePosition();
  }

  update(dt: number): void {
    if (this.moving) {
      const alpha = Math.min(1, LERP_SPEED * dt);
      this.x += (this.targetX - this.x) * alpha;
      this.y += (this.targetY - this.y) * alpha;

      // Snap when close enough
      const dx = this.targetX - this.x;
      const dy = this.targetY - this.y;
      if (dx * dx + dy * dy < 1) {
        this.x = this.targetX;
        this.y = this.targetY;
      }
    }

    this.sprite.setDirection(this.targetDirection, this.moving);
    this.syncSpritePosition();
  }

  kill(): void {
    this.alive = false;
    this.getContainer().visible = false;
  }

  getContainer() {
    return this.sprite.getContainer();
  }

  private syncSpritePosition(): void {
    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }
}
