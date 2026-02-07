import { Graphics, Text } from 'pixi.js';
import { TaskBase } from './task-base';

/**
 * Divert Power: Drag the slider from the left side to the right side
 * to divert power to the target room.
 */
export class DivertPowerTask extends TaskBase {
  private slider!: Graphics;
  private fillBar!: Graphics;
  private dragging = false;

  constructor() {
    super('divert_power');
  }

  protected setupTask(): void {
    const title = new Text({
      text: 'Divert Power',
      style: { fontSize: 22, fill: 0xffffff, fontFamily: 'Arial', fontWeight: 'bold' },
    });
    title.anchor.set(0.5, 0);
    title.y = -180;
    this.panel.addChild(title);

    // Power panel background
    const panelBg = new Graphics();
    panelBg.roundRect(-200, -120, 400, 160, 8);
    panelBg.fill({ color: 0x1a1a2e });
    panelBg.stroke({ color: 0x444466, width: 2 });
    this.panel.addChild(panelBg);

    // Labels
    const fromLabel = new Text({
      text: 'Reactor',
      style: { fontSize: 14, fill: 0xaaaaaa, fontFamily: 'Arial' },
    });
    fromLabel.anchor.set(0.5);
    fromLabel.x = -150;
    fromLabel.y = -135;
    this.panel.addChild(fromLabel);

    const toLabel = new Text({
      text: 'Navigation',
      style: { fontSize: 14, fill: 0xaaaaaa, fontFamily: 'Arial' },
    });
    toLabel.anchor.set(0.5);
    toLabel.x = 150;
    toLabel.y = -135;
    this.panel.addChild(toLabel);

    // Slider track
    const trackY = -40;
    const trackLeft = -170;
    const trackWidth = 340;
    const track = new Graphics();
    track.roundRect(trackLeft, trackY - 10, trackWidth, 20, 10);
    track.fill({ color: 0x333344 });
    track.stroke({ color: 0x555577, width: 1 });
    this.panel.addChild(track);

    // Fill bar
    this.fillBar = new Graphics();
    this.panel.addChild(this.fillBar);

    // Slider handle
    this.slider = new Graphics();
    this.slider.circle(0, 0, 20);
    this.slider.fill({ color: 0xffcc00 });
    this.slider.stroke({ color: 0xffffff, width: 2 });
    this.slider.x = trackLeft + 20;
    this.slider.y = trackY;
    this.slider.eventMode = 'static';
    this.slider.cursor = 'pointer';
    this.panel.addChild(this.slider);

    // Power meter indicators
    for (let i = 0; i < 10; i++) {
      const indicator = new Graphics();
      const ix = trackLeft + 20 + i * (trackWidth - 40) / 9;
      indicator.rect(ix - 1, trackY + 20, 2, 8);
      indicator.fill({ color: 0x555577 });
      this.panel.addChild(indicator);
    }

    // Instruction
    const instruction = new Text({
      text: 'Drag slider to the right',
      style: { fontSize: 14, fill: 0x888888, fontFamily: 'Arial' },
    });
    instruction.anchor.set(0.5);
    instruction.y = 80;
    this.panel.addChild(instruction);

    // Interaction
    this.slider.on('pointerdown', () => {
      this.dragging = true;
    });

    this.overlay.on('pointermove', (e: { global: { x: number; y: number } }) => {
      if (!this.dragging) return;
      const local = this.panel.toLocal({ x: e.global.x, y: e.global.y });
      const minX = trackLeft + 20;
      const maxX = trackLeft + trackWidth - 20;
      this.slider.x = Math.max(minX, Math.min(maxX, local.x));

      // Update fill bar
      const progress = (this.slider.x - minX) / (maxX - minX);
      this.fillBar.clear();
      this.fillBar.roundRect(trackLeft, trackY - 10, (trackWidth) * progress, 20, 10);
      this.fillBar.fill({ color: 0xffcc00, alpha: 0.4 });

      // Check completion
      if (progress >= 0.95) {
        this.slider.x = maxX;
        this.dragging = false;
        this.onComplete();
      }
    });

    this.overlay.on('pointerup', () => {
      this.dragging = false;
    });
  }
}
