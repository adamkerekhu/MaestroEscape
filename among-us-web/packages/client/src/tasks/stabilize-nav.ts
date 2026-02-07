import { Graphics, Text } from 'pixi.js';
import { TaskBase } from './task-base';

/**
 * Stabilize Navigation: A crosshair drifts around. Click and drag it
 * to the center circle to stabilize it.
 */
export class StabilizeNavTask extends TaskBase {
  private crosshair!: Graphics;
  private targetZone!: Graphics;
  private draggingCrosshair = false;
  private driftX = 0.5;
  private driftY = 0.3;

  constructor() {
    super('stabilize_nav');
  }

  protected setupTask(): void {
    const title = new Text({
      text: 'Stabilize Navigation',
      style: { fontSize: 22, fill: 0xffffff, fontFamily: 'Arial', fontWeight: 'bold' },
    });
    title.anchor.set(0.5, 0);
    title.y = -180;
    this.panel.addChild(title);

    // Radar background
    const radar = new Graphics();
    radar.circle(0, 20, 150);
    radar.fill({ color: 0x112211 });
    radar.stroke({ color: 0x33cc33, width: 2 });
    // Crosshairs on radar
    radar.moveTo(-150, 20);
    radar.lineTo(150, 20);
    radar.stroke({ color: 0x225522, width: 1 });
    radar.moveTo(0, -130);
    radar.lineTo(0, 170);
    radar.stroke({ color: 0x225522, width: 1 });
    this.panel.addChild(radar);

    // Target zone at center
    this.targetZone = new Graphics();
    this.targetZone.circle(0, 20, 25);
    this.targetZone.fill({ color: 0x33cc33, alpha: 0.3 });
    this.targetZone.stroke({ color: 0x33cc33, width: 2 });
    this.panel.addChild(this.targetZone);

    // Drifting crosshair
    this.crosshair = new Graphics();
    this.drawCrosshair();
    this.crosshair.x = 80;
    this.crosshair.y = -40;
    this.crosshair.eventMode = 'static';
    this.crosshair.cursor = 'grab';
    this.panel.addChild(this.crosshair);

    this.crosshair.on('pointerdown', () => {
      this.draggingCrosshair = true;
      this.crosshair.cursor = 'grabbing';
    });

    this.overlay.on('pointermove', (e: { global: { x: number; y: number } }) => {
      if (!this.draggingCrosshair) return;
      const local = this.panel.toLocal({ x: e.global.x, y: e.global.y });
      this.crosshair.x = local.x;
      this.crosshair.y = local.y;
    });

    this.overlay.on('pointerup', () => {
      if (!this.draggingCrosshair) return;
      this.draggingCrosshair = false;
      this.crosshair.cursor = 'grab';

      // Check if crosshair is within target zone
      const dx = this.crosshair.x - 0;
      const dy = this.crosshair.y - 20;
      if (dx * dx + dy * dy < 25 * 25) {
        this.crosshair.x = 0;
        this.crosshair.y = 20;
        this.onComplete();
      }
    });
  }

  private drawCrosshair(): void {
    this.crosshair.clear();
    // Outer ring
    this.crosshair.circle(0, 0, 15);
    this.crosshair.stroke({ color: 0xff3333, width: 2 });
    // Cross lines
    this.crosshair.moveTo(-20, 0);
    this.crosshair.lineTo(20, 0);
    this.crosshair.stroke({ color: 0xff3333, width: 2 });
    this.crosshair.moveTo(0, -20);
    this.crosshair.lineTo(0, 20);
    this.crosshair.stroke({ color: 0xff3333, width: 2 });
    // Hit area
    this.crosshair.circle(0, 0, 25);
    this.crosshair.fill({ color: 0xff0000, alpha: 0.01 });
  }

  override update(dt: number): void {
    if (this.draggingCrosshair) return;

    // Drift the crosshair
    this.crosshair.x += this.driftX * dt * 60;
    this.crosshair.y += this.driftY * dt * 60;

    // Bounce within radar bounds
    const radius = 130;
    const cx = this.crosshair.x;
    const cy = this.crosshair.y - 20;
    if (cx * cx + cy * cy > radius * radius) {
      this.driftX = -this.driftX + (Math.random() - 0.5) * 0.3;
      this.driftY = -this.driftY + (Math.random() - 0.5) * 0.3;
      // Push back inside
      const angle = Math.atan2(cy, cx);
      this.crosshair.x = Math.cos(angle) * (radius - 5);
      this.crosshair.y = Math.sin(angle) * (radius - 5) + 20;
    }
  }
}
