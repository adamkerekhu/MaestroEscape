import { AnimatedSprite, Container, Spritesheet, Texture } from 'pixi.js';

export type Direction = 'left' | 'right' | 'up' | 'down';

const DIRECTION_FRAME_COUNTS: Record<Direction, number> = {
  left: 17,
  right: 17,
  up: 17,
  down: 18,
};

const ANIMATION_SPEED = 0.15;

export class DirectionalAnimatedSprite {
  private container = new Container();
  private sprites = new Map<Direction, AnimatedSprite>();
  private currentDirection: Direction = 'down';

  constructor(sheet: Spritesheet, color: string) {
    const directions: Direction[] = ['left', 'right', 'up', 'down'];

    for (const dir of directions) {
      const frames: Texture[] = [];
      const count = DIRECTION_FRAME_COUNTS[dir];
      for (let i = 1; i <= count; i++) {
        const key = `${color}_${dir}_walk/step${i}.png`;
        const tex = sheet.textures[key];
        if (tex) {
          frames.push(tex);
        }
      }

      if (frames.length === 0) continue;

      const sprite = new AnimatedSprite(frames);
      sprite.animationSpeed = ANIMATION_SPEED;
      sprite.loop = true;
      sprite.anchor.set(0.5, 1.0);
      sprite.visible = dir === this.currentDirection;

      this.sprites.set(dir, sprite);
      this.container.addChild(sprite);
    }
  }

  setDirection(dir: Direction, moving: boolean): void {
    if (dir !== this.currentDirection) {
      const prev = this.sprites.get(this.currentDirection);
      if (prev) {
        prev.visible = false;
        prev.stop();
      }

      this.currentDirection = dir;
      const next = this.sprites.get(dir);
      if (next) {
        next.visible = true;
      }
    }

    const current = this.sprites.get(this.currentDirection);
    if (!current) return;

    if (moving) {
      if (!current.playing) {
        current.play();
      }
    } else {
      current.stop();
      current.currentFrame = 0;
    }
  }

  getContainer(): Container {
    return this.container;
  }

  get x(): number {
    return this.container.x;
  }

  set x(val: number) {
    this.container.x = val;
  }

  get y(): number {
    return this.container.y;
  }

  set y(val: number) {
    this.container.y = val;
  }
}
