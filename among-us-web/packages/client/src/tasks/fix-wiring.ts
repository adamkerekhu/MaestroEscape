import { Graphics, Container, Text } from 'pixi.js';
import { TaskBase } from './task-base';

const WIRE_COLORS = [0xff0000, 0x00cc00, 0x3399ff, 0xffcc00];
const WIRE_NAMES = ['Red', 'Green', 'Blue', 'Yellow'];

/**
 * Fix Wiring: 4 colored wires on left, 4 matching ports on right.
 * Drag a wire from the left port to the matching right port.
 */
export class FixWiringTask extends TaskBase {
  private dragging: number | null = null;
  private dragLine: Graphics | null = null;
  private connections: (number | null)[] = [null, null, null, null];
  private rightOrder: number[] = [];
  private leftPorts: Container[] = [];
  private rightPorts: Container[] = [];

  constructor() {
    super('fix_wiring');
  }

  protected setupTask(): void {
    const title = new Text({
      text: 'Fix Wiring',
      style: { fontSize: 22, fill: 0xffffff, fontFamily: 'Arial', fontWeight: 'bold' },
    });
    title.anchor.set(0.5, 0);
    title.y = -180;
    this.panel.addChild(title);

    // Shuffle right side order
    this.rightOrder = [0, 1, 2, 3].sort(() => Math.random() - 0.5);

    const startY = -100;
    const spacing = 70;
    const leftX = -200;
    const rightX = 200;

    // Create left ports (source wires)
    for (let i = 0; i < 4; i++) {
      const port = this.createPort(leftX, startY + i * spacing, WIRE_COLORS[i], WIRE_NAMES[i]);
      port.eventMode = 'static';
      port.cursor = 'pointer';
      const idx = i;
      port.on('pointerdown', (e: { global: { x: number; y: number } }) => this.startDrag(idx, e));
      this.leftPorts.push(port);
      this.panel.addChild(port);
    }

    // Create right ports (targets) in shuffled order
    for (let i = 0; i < 4; i++) {
      const colorIdx = this.rightOrder[i];
      const port = this.createPort(rightX, startY + i * spacing, WIRE_COLORS[colorIdx], '');
      this.rightPorts.push(port);
      this.panel.addChild(port);
    }

    // Drag line graphics
    this.dragLine = new Graphics();
    this.panel.addChild(this.dragLine);

    // Connection lines graphics
    this.panel.addChild(new Graphics());

    // Listen for pointer events on overlay
    this.overlay.on('pointermove', (e: { global: { x: number; y: number } }) => this.onDrag(e));
    this.overlay.on('pointerup', (e: { global: { x: number; y: number } }) => this.endDrag(e));
  }

  private createPort(x: number, y: number, color: number, label: string): Container {
    const c = new Container();
    c.x = x;
    c.y = y;

    const g = new Graphics();
    g.circle(0, 0, 18);
    g.fill({ color });
    g.stroke({ color: 0xffffff, width: 2 });
    c.addChild(g);

    if (label) {
      const t = new Text({
        text: label,
        style: { fontSize: 12, fill: 0xffffff, fontFamily: 'Arial' },
      });
      t.anchor.set(0.5);
      t.y = -28;
      c.addChild(t);
    }
    return c;
  }

  private startDrag(idx: number, e: { global: { x: number; y: number } }): void {
    if (this.connections[idx] !== null) return;
    this.dragging = idx;
    this.onDrag(e);
  }

  private onDrag(e: { global: { x: number; y: number } }): void {
    if (this.dragging === null || !this.dragLine) return;

    const port = this.leftPorts[this.dragging];
    const startX = port.x;
    const startY = port.y;

    // Convert global to panel-local coords
    const local = this.panel.toLocal({ x: e.global.x, y: e.global.y });

    this.dragLine.clear();
    this.dragLine.moveTo(startX, startY);
    this.dragLine.lineTo(local.x, local.y);
    this.dragLine.stroke({ color: WIRE_COLORS[this.dragging], width: 4 });
  }

  private endDrag(e: { global: { x: number; y: number } }): void {
    if (this.dragging === null) return;

    const local = this.panel.toLocal({ x: e.global.x, y: e.global.y });

    // Check if dropped on a right port
    for (let i = 0; i < 4; i++) {
      const rp = this.rightPorts[i];
      const dx = local.x - rp.x;
      const dy = local.y - rp.y;
      if (dx * dx + dy * dy < 30 * 30) {
        // Check if this is the matching color
        if (this.rightOrder[i] === this.dragging) {
          this.connections[this.dragging] = i;
          this.drawConnection(this.dragging, i);
        }
        break;
      }
    }

    this.dragging = null;
    if (this.dragLine) this.dragLine.clear();

    // Check completion
    if (this.connections.every((c) => c !== null)) {
      this.onComplete();
    }
  }

  private drawConnection(leftIdx: number, rightIdx: number): void {
    const lp = this.leftPorts[leftIdx];
    const rp = this.rightPorts[rightIdx];
    const g = new Graphics();
    g.moveTo(lp.x, lp.y);
    g.lineTo(rp.x, rp.y);
    g.stroke({ color: WIRE_COLORS[leftIdx], width: 4 });
    this.panel.addChild(g);
  }
}
