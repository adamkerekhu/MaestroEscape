import { Graphics, Text } from 'pixi.js';
import { TaskBase } from './task-base';

/**
 * Align Engine: An arrow indicator needs to be aligned to a target position.
 * Click the up/down buttons to move the arrow to match the target line.
 */
export class AlignEngineTask extends TaskBase {
  private arrow!: Graphics;
  private arrowY = 0;
  private targetY = 0;

  constructor() {
    super('align_engine');
  }

  protected setupTask(): void {
    const title = new Text({
      text: 'Align Engine Output',
      style: { fontSize: 22, fill: 0xffffff, fontFamily: 'Arial', fontWeight: 'bold' },
    });
    title.anchor.set(0.5, 0);
    title.y = -180;
    this.panel.addChild(title);

    // Engine housing
    const housing = new Graphics();
    housing.roundRect(-180, -120, 200, 280, 8);
    housing.fill({ color: 0x333344 });
    housing.stroke({ color: 0x555577, width: 2 });
    this.panel.addChild(housing);

    // Target indicator area
    const targetArea = new Graphics();
    targetArea.roundRect(60, -120, 120, 280, 8);
    targetArea.fill({ color: 0x222233 });
    targetArea.stroke({ color: 0x555577, width: 2 });
    this.panel.addChild(targetArea);

    // Random target position
    this.targetY = -80 + Math.random() * 200;

    // Target line
    const targetLine = new Graphics();
    targetLine.moveTo(60, this.targetY);
    targetLine.lineTo(180, this.targetY);
    targetLine.stroke({ color: 0x33cc33, width: 3 });
    this.panel.addChild(targetLine);

    const targetLabel = new Text({
      text: 'TARGET',
      style: { fontSize: 10, fill: 0x33cc33, fontFamily: 'monospace' },
    });
    targetLabel.anchor.set(0.5);
    targetLabel.x = 120;
    targetLabel.y = this.targetY - 15;
    this.panel.addChild(targetLabel);

    // Arrow (movable)
    this.arrowY = 0;
    this.arrow = new Graphics();
    this.drawArrow();
    this.panel.addChild(this.arrow);

    // Up button
    const upBtn = this.createButton(-80, -140, '\u25B2', () => this.moveArrow(-10));
    this.panel.addChild(upBtn);

    // Down button
    const downBtn = this.createButton(-80, 168, '\u25BC', () => this.moveArrow(10));
    this.panel.addChild(downBtn);

    // Instruction
    const instruction = new Text({
      text: 'Align the arrow to the target',
      style: { fontSize: 14, fill: 0x888888, fontFamily: 'Arial' },
    });
    instruction.anchor.set(0.5);
    instruction.y = 168;
    this.panel.addChild(instruction);
  }

  private createButton(x: number, y: number, label: string, onClick: () => void): Graphics {
    const btn = new Graphics();
    btn.roundRect(-30, -15, 60, 30, 6);
    btn.fill({ color: 0x4466aa });
    btn.stroke({ color: 0xffffff, width: 1 });
    btn.x = x;
    btn.y = y;
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    btn.on('pointerdown', onClick);

    const text = new Text({
      text: label,
      style: { fontSize: 16, fill: 0xffffff, fontFamily: 'Arial' },
    });
    text.anchor.set(0.5);
    btn.addChild(text);

    return btn;
  }

  private moveArrow(delta: number): void {
    this.arrowY = Math.max(-100, Math.min(140, this.arrowY + delta));
    this.drawArrow();

    // Check if aligned (within tolerance)
    if (Math.abs(this.arrowY - this.targetY) < 12) {
      this.onComplete();
    }
  }

  private drawArrow(): void {
    this.arrow.clear();
    // Arrow shape pointing right
    const y = this.arrowY;
    this.arrow.moveTo(-140, y - 8);
    this.arrow.lineTo(-40, y - 8);
    this.arrow.lineTo(-40, y - 16);
    this.arrow.lineTo(-20, y);
    this.arrow.lineTo(-40, y + 16);
    this.arrow.lineTo(-40, y + 8);
    this.arrow.lineTo(-140, y + 8);
    this.arrow.closePath();
    this.arrow.fill({ color: 0xff6633 });
    this.arrow.stroke({ color: 0xffffff, width: 1 });
  }
}
