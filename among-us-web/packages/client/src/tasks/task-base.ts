import { Container, Graphics, Text } from 'pixi.js';
import type { Scene } from '../core/scene-manager';
import { sceneManager } from '../core/scene-manager';
import { getApp } from '../core/app';
import type { TaskType } from '@among-us/shared';

export abstract class TaskBase implements Scene {
  container = new Container();
  isOverlay = true;

  protected overlay!: Graphics;
  protected panel!: Container;
  protected readonly taskType: TaskType;

  private completed = false;

  constructor(taskType: TaskType) {
    this.taskType = taskType;
  }

  async onEnter(): Promise<void> {
    const app = getApp();
    const w = app.renderer.width;
    const h = app.renderer.height;

    // Dimmed background overlay
    this.overlay = new Graphics();
    this.overlay.rect(0, 0, w, h);
    this.overlay.fill({ color: 0x000000, alpha: 0.6 });
    this.overlay.eventMode = 'static';
    this.container.addChild(this.overlay);

    // Task panel centered on screen
    this.panel = new Container();
    this.panel.x = w / 2;
    this.panel.y = h / 2;
    this.container.addChild(this.panel);

    // Panel background
    const panelBg = new Graphics();
    panelBg.roundRect(-250, -200, 500, 400, 12);
    panelBg.fill({ color: 0x2c2c3e });
    panelBg.stroke({ color: 0x555577, width: 2 });
    this.panel.addChild(panelBg);

    // Close button
    const closeBtn = new Container();
    closeBtn.x = 225;
    closeBtn.y = -175;
    closeBtn.eventMode = 'static';
    closeBtn.cursor = 'pointer';
    closeBtn.on('pointerdown', () => this.close());

    const closeBg = new Graphics();
    closeBg.circle(0, 0, 16);
    closeBg.fill({ color: 0xcc3333 });
    closeBtn.addChild(closeBg);

    const closeX = new Text({ text: 'X', style: { fontSize: 16, fill: 0xffffff, fontFamily: 'Arial' } });
    closeX.anchor.set(0.5);
    closeBtn.addChild(closeX);

    this.panel.addChild(closeBtn);

    this.setupTask();
  }

  async onExit(): Promise<void> {
    this.container.removeChildren();
  }

  update(_dt: number): void {
    // Subclasses can override
  }

  protected abstract setupTask(): void;

  protected onComplete(): void {
    if (this.completed) return;
    this.completed = true;
    // Dispatch a DOM custom event so other systems can listen
    window.dispatchEvent(
      new CustomEvent('task_complete', { detail: { type: this.taskType } }),
    );
    this.close();
  }

  private close(): void {
    sceneManager.pop();
  }
}
