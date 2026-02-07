import { Spritesheet } from 'pixi.js';
import {
  DirectionalAnimatedSprite,
  type Direction,
} from '../rendering/sprite-animation';
import { inputManager } from '../core/input-manager';
import { CollisionSystem, type Collidable } from './collision';

const PLAYER_SPEED = 400;
const HITBOX_WIDTH = 30;
const HITBOX_HEIGHT = 20;

export class Player {
  private sprite: DirectionalAnimatedSprite;
  private collisionSystem: CollisionSystem | null = null;

  x: number;
  y: number;

  constructor(sheet: Spritesheet, color: string, startX: number, startY: number) {
    this.sprite = new DirectionalAnimatedSprite(sheet, color);
    this.x = startX;
    this.y = startY;
    this.syncSpritePosition();
  }

  setCollisionSystem(system: CollisionSystem): void {
    this.collisionSystem = system;
  }

  update(dt: number): void {
    const movement = inputManager.getMovementVector();
    const dx = movement.x * PLAYER_SPEED * dt;
    const dy = movement.y * PLAYER_SPEED * dt;

    if (this.collisionSystem && (dx !== 0 || dy !== 0)) {
      const hitbox: Collidable = {
        x: this.x - HITBOX_WIDTH / 2,
        y: this.y - HITBOX_HEIGHT,
        width: HITBOX_WIDTH,
        height: HITBOX_HEIGHT,
      };
      const result = this.collisionSystem.moveAndCollide(hitbox, dx, dy);
      this.x = result.x + HITBOX_WIDTH / 2;
      this.y = result.y + HITBOX_HEIGHT;
    } else {
      this.x += dx;
      this.y += dy;
    }

    const moving = movement.x !== 0 || movement.y !== 0;
    if (moving) {
      const dir = this.resolveDirection(movement.x, movement.y);
      this.sprite.setDirection(dir, true);
    } else {
      this.sprite.setDirection(this.currentDirection(), false);
    }

    this.syncSpritePosition();
  }

  getContainer() {
    return this.sprite.getContainer();
  }

  private syncSpritePosition(): void {
    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }

  private currentDirection(): Direction {
    // Return whatever the sprite is currently facing
    return this._lastDirection;
  }

  private _lastDirection: Direction = 'down';

  private resolveDirection(mx: number, my: number): Direction {
    // Prioritize horizontal when diagonal, matching original behavior
    let dir: Direction;
    if (mx < 0) {
      dir = 'left';
    } else if (mx > 0) {
      dir = 'right';
    } else if (my < 0) {
      dir = 'up';
    } else {
      dir = 'down';
    }
    this._lastDirection = dir;
    return dir;
  }
}
