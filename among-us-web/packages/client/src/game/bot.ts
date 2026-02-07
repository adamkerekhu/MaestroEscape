import { Container, Spritesheet } from 'pixi.js';
import {
  DirectionalAnimatedSprite,
  type Direction,
} from '../rendering/sprite-animation';
import { CollisionSystem, type Collidable } from './collision';
import { GAME_CONFIG } from '@among-us/shared';

const BOT_SPEED_MIN = 0.6;
const BOT_SPEED_MAX = 0.8;
const PLAYER_SPEED = GAME_CONFIG.PLAYER_SPEED;
const HITBOX_WIDTH = 30;
const HITBOX_HEIGHT = 20;
const PATROL_RADIUS = 300;
const ARRIVAL_THRESHOLD = 20;
const PAUSE_MIN = 1.0;
const PAUSE_MAX = 3.0;

type BotState = 'walking' | 'paused';

export class Bot {
  readonly id: string;
  readonly name: string;
  readonly color: string;

  x: number;
  y: number;
  alive = true;

  private sprite: DirectionalAnimatedSprite;
  private speed: number;
  private state: BotState = 'paused';
  private targetX: number;
  private targetY: number;
  private pauseTimer = 0;
  private _lastDirection: Direction = 'down';

  constructor(
    id: string,
    name: string,
    color: string,
    startX: number,
    startY: number,
    sheet: Spritesheet,
  ) {
    this.id = id;
    this.name = name;
    this.color = color;
    this.x = startX;
    this.y = startY;
    this.targetX = startX;
    this.targetY = startY;
    this.speed = PLAYER_SPEED * (BOT_SPEED_MIN + Math.random() * (BOT_SPEED_MAX - BOT_SPEED_MIN));
    this.sprite = new DirectionalAnimatedSprite(sheet, color);
    this.syncSpritePosition();

    // Start with a random pause before first move
    this.pauseTimer = PAUSE_MIN + Math.random() * (PAUSE_MAX - PAUSE_MIN);
  }

  update(dt: number, collisionSystem: CollisionSystem): void {
    if (!this.alive) return;

    if (this.state === 'paused') {
      this.pauseTimer -= dt;
      if (this.pauseTimer <= 0) {
        this.pickNewTarget();
        this.state = 'walking';
      }
      this.sprite.setDirection(this._lastDirection, false);
      return;
    }

    // Walking state
    const diffX = this.targetX - this.x;
    const diffY = this.targetY - this.y;
    const dist = Math.sqrt(diffX * diffX + diffY * diffY);

    if (dist < ARRIVAL_THRESHOLD) {
      this.state = 'paused';
      this.pauseTimer = PAUSE_MIN + Math.random() * (PAUSE_MAX - PAUSE_MIN);
      this.sprite.setDirection(this._lastDirection, false);
      return;
    }

    // Normalize direction and apply speed
    const nx = diffX / dist;
    const ny = diffY / dist;
    const dx = nx * this.speed * dt;
    const dy = ny * this.speed * dt;

    const hitbox: Collidable = {
      x: this.x - HITBOX_WIDTH / 2,
      y: this.y - HITBOX_HEIGHT,
      width: HITBOX_WIDTH,
      height: HITBOX_HEIGHT,
    };

    const result = collisionSystem.moveAndCollide(hitbox, dx, dy);
    const newX = result.x + HITBOX_WIDTH / 2;
    const newY = result.y + HITBOX_HEIGHT;

    // If we barely moved (stuck on a wall), pick a new target
    const movedDist = Math.sqrt(
      (newX - this.x) * (newX - this.x) + (newY - this.y) * (newY - this.y),
    );
    if (movedDist < 0.5 && dist > ARRIVAL_THRESHOLD) {
      this.pickNewTarget();
    }

    this.x = newX;
    this.y = newY;

    // Update sprite direction
    const dir = this.resolveDirection(nx, ny);
    this.sprite.setDirection(dir, true);

    this.syncSpritePosition();
  }

  kill(): void {
    this.alive = false;
    this.sprite.setDirection(this._lastDirection, false);
    this.sprite.getContainer().visible = false;
  }

  getContainer(): Container {
    return this.sprite.getContainer();
  }

  private syncSpritePosition(): void {
    this.sprite.x = this.x;
    this.sprite.y = this.y;
  }

  private pickNewTarget(): void {
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * PATROL_RADIUS;
    const rawX = this.x + Math.cos(angle) * radius;
    const rawY = this.y + Math.sin(angle) * radius;

    // Clamp to map bounds
    this.targetX = Math.max(50, Math.min(GAME_CONFIG.MAP_WIDTH - 50, rawX));
    this.targetY = Math.max(50, Math.min(GAME_CONFIG.MAP_HEIGHT - 50, rawY));
  }

  private resolveDirection(nx: number, ny: number): Direction {
    let dir: Direction;
    if (Math.abs(nx) > Math.abs(ny)) {
      dir = nx < 0 ? 'left' : 'right';
    } else {
      dir = ny < 0 ? 'up' : 'down';
    }
    this._lastDirection = dir;
    return dir;
  }
}
