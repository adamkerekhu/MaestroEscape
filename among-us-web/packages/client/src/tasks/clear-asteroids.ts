import { Graphics, Text, Container } from 'pixi.js';
import { TaskBase } from './task-base';

interface Asteroid {
  graphics: Graphics;
  x: number;
  y: number;
  speed: number;
  size: number;
  alive: boolean;
}

const ASTEROIDS_TO_DESTROY = 10;

/**
 * Clear Asteroids: Asteroids move across the screen.
 * Click on them to destroy them. Destroy enough to complete.
 */
export class ClearAsteroidsTask extends TaskBase {
  private asteroids: Asteroid[] = [];
  private asteroidContainer!: Container;
  private destroyed = 0;
  private spawnTimer = 0;
  private counterText!: Text;

  constructor() {
    super('clear_asteroids');
  }

  protected setupTask(): void {
    const title = new Text({
      text: 'Clear Asteroids',
      style: { fontSize: 22, fill: 0xffffff, fontFamily: 'Arial', fontWeight: 'bold' },
    });
    title.anchor.set(0.5, 0);
    title.y = -180;
    this.panel.addChild(title);

    // Space background
    const space = new Graphics();
    space.rect(-230, -150, 460, 320);
    space.fill({ color: 0x050510 });
    space.stroke({ color: 0x333355, width: 2 });
    this.panel.addChild(space);

    // Stars
    for (let i = 0; i < 30; i++) {
      const star = new Graphics();
      star.circle(
        -220 + Math.random() * 440,
        -140 + Math.random() * 300,
        Math.random() * 1.5 + 0.5,
      );
      star.fill({ color: 0xffffff, alpha: 0.5 + Math.random() * 0.5 });
      this.panel.addChild(star);
    }

    // Crosshair cursor area
    const crosshairArea = new Graphics();
    crosshairArea.rect(-230, -150, 460, 320);
    crosshairArea.fill({ color: 0x000000, alpha: 0.01 });
    crosshairArea.eventMode = 'static';
    crosshairArea.cursor = 'crosshair';
    this.panel.addChild(crosshairArea);

    // Asteroid container
    this.asteroidContainer = new Container();
    this.panel.addChild(this.asteroidContainer);

    // Counter
    this.counterText = new Text({
      text: `Destroyed: 0 / ${ASTEROIDS_TO_DESTROY}`,
      style: { fontSize: 14, fill: 0xffffff, fontFamily: 'monospace' },
    });
    this.counterText.anchor.set(0.5, 0);
    this.counterText.y = 168;
    this.panel.addChild(this.counterText);

    // Spawn initial asteroids
    for (let i = 0; i < 4; i++) {
      this.spawnAsteroid();
    }
  }

  private spawnAsteroid(): void {
    const size = 12 + Math.random() * 20;
    const y = -130 + Math.random() * 280;
    const x = 240;
    const speed = 40 + Math.random() * 80;

    const g = new Graphics();
    // Draw irregular asteroid shape
    const points = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const r = size * (0.7 + Math.random() * 0.3);
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) {
        g.moveTo(px, py);
      } else {
        g.lineTo(px, py);
      }
    }
    g.closePath();
    g.fill({ color: 0x886644 });
    g.stroke({ color: 0xaa8866, width: 1 });

    // Hit area circle
    g.circle(0, 0, size + 5);
    g.fill({ color: 0x000000, alpha: 0.01 });

    g.x = x;
    g.y = y;
    g.eventMode = 'static';
    g.cursor = 'crosshair';

    const asteroid: Asteroid = { graphics: g, x, y, speed, size, alive: true };

    g.on('pointerdown', () => {
      if (!asteroid.alive) return;
      asteroid.alive = false;
      this.destroyed++;
      this.counterText.text = `Destroyed: ${this.destroyed} / ${ASTEROIDS_TO_DESTROY}`;

      // Explosion effect
      g.clear();
      g.circle(0, 0, size * 1.5);
      g.fill({ color: 0xff6600, alpha: 0.7 });

      // Remove after brief flash
      setTimeout(() => {
        this.asteroidContainer.removeChild(g);
      }, 150);

      if (this.destroyed >= ASTEROIDS_TO_DESTROY) {
        this.onComplete();
      }
    });

    this.asteroidContainer.addChild(g);
    this.asteroids.push(asteroid);
  }

  override update(dt: number): void {
    // Move asteroids
    for (const asteroid of this.asteroids) {
      if (!asteroid.alive) continue;
      asteroid.x -= asteroid.speed * dt;
      asteroid.graphics.x = asteroid.x;

      // Remove if off screen
      if (asteroid.x < -250) {
        asteroid.alive = false;
        this.asteroidContainer.removeChild(asteroid.graphics);
      }
    }

    // Clean up dead asteroids
    this.asteroids = this.asteroids.filter(
      (a) => a.alive || this.asteroidContainer.children.includes(a.graphics),
    );

    // Spawn new asteroids periodically
    this.spawnTimer += dt;
    if (this.spawnTimer > 0.6) {
      this.spawnTimer = 0;
      if (this.asteroids.filter((a) => a.alive).length < 6) {
        this.spawnAsteroid();
      }
    }
  }
}
