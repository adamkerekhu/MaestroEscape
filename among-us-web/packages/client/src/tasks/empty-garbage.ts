import { Graphics, Text } from 'pixi.js';
import { TaskBase } from './task-base';

/**
 * Empty Garbage: Click and drag the lever down to empty the garbage chute.
 * Hold it down until progress completes.
 */
export class EmptyGarbageTask extends TaskBase {
  private lever!: Graphics;
  private progressBar!: Graphics;
  private pulling = false;
  private progress = 0;

  constructor() {
    super('empty_garbage');
  }

  protected setupTask(): void {
    const title = new Text({
      text: 'Empty Garbage',
      style: { fontSize: 22, fill: 0xffffff, fontFamily: 'Arial', fontWeight: 'bold' },
    });
    title.anchor.set(0.5, 0);
    title.y = -180;
    this.panel.addChild(title);

    // Garbage chute visual
    const chute = new Graphics();
    chute.rect(-100, -80, 200, 200);
    chute.fill({ color: 0x555555 });
    chute.stroke({ color: 0x888888, width: 2 });
    this.panel.addChild(chute);

    // Garbage items
    const garbageColors = [0x884422, 0x44aa44, 0xdddd33, 0xaa2222, 0x2255aa];
    for (let i = 0; i < 8; i++) {
      const g = new Graphics();
      const x = -80 + Math.random() * 160;
      const y = -60 + Math.random() * 140;
      const size = 10 + Math.random() * 20;
      g.rect(x, y, size, size);
      g.fill({ color: garbageColors[i % garbageColors.length] });
      this.panel.addChild(g);
    }

    // Lever track
    const leverTrack = new Graphics();
    leverTrack.rect(160, -80, 30, 200);
    leverTrack.fill({ color: 0x333333 });
    leverTrack.stroke({ color: 0x666666, width: 2 });
    this.panel.addChild(leverTrack);

    // Lever handle
    this.lever = new Graphics();
    this.lever.roundRect(-20, -15, 40, 30, 6);
    this.lever.fill({ color: 0xcc6633 });
    this.lever.stroke({ color: 0xffffff, width: 2 });
    this.lever.x = 175;
    this.lever.y = -60;
    this.lever.eventMode = 'static';
    this.lever.cursor = 'grab';
    this.panel.addChild(this.lever);

    // Progress bar background
    const progressBg = new Graphics();
    progressBg.rect(-100, 145, 200, 20);
    progressBg.fill({ color: 0x333333 });
    progressBg.stroke({ color: 0x666666, width: 1 });
    this.panel.addChild(progressBg);

    // Progress bar fill
    this.progressBar = new Graphics();
    this.panel.addChild(this.progressBar);

    // Interaction
    this.lever.on('pointerdown', () => {
      this.pulling = true;
      this.lever.cursor = 'grabbing';
    });

    this.overlay.on('pointermove', (e: { global: { x: number; y: number } }) => {
      if (!this.pulling) return;
      const local = this.panel.toLocal({ x: e.global.x, y: e.global.y });
      // Clamp lever Y position
      const minY = -60;
      const maxY = 100;
      this.lever.y = Math.max(minY, Math.min(maxY, local.y));
    });

    this.overlay.on('pointerup', () => {
      this.pulling = false;
      this.lever.cursor = 'grab';
    });
  }

  override update(dt: number): void {
    // Progress increases when lever is pulled down (y > 60)
    if (this.pulling && this.lever.y > 60) {
      this.progress = Math.min(1, this.progress + dt * 0.8);
    }

    // Update progress bar
    this.progressBar.clear();
    if (this.progress > 0) {
      this.progressBar.rect(-100, 145, 200 * this.progress, 20);
      this.progressBar.fill({ color: 0x33cc33 });
    }

    if (this.progress >= 1) {
      this.onComplete();
    }
  }
}
