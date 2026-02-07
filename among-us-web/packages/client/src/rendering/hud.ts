import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { PlayerRole } from '@among-us/shared';

export interface HUDState {
  role: PlayerRole;
  alive: boolean;
  killCooldown: number;
  killCooldownMax: number;
  canKill: boolean;
  canReport: boolean;
  canUse: boolean;
  canSabotage: boolean;
  taskProgress: number; // 0..1
  inMeeting: boolean;
}

const BTN_SIZE = 64;
const BTN_GAP = 12;
const BTN_RADIUS = 12;

export class HUD {
  private hudContainer = new Container();
  private killBtn: Graphics | null = null;
  private killLabel: Text | null = null;
  private killCooldownText: Text | null = null;
  private sabotageBtn: Graphics | null = null;
  private sabotageLabel: Text | null = null;
  private reportBtn: Graphics | null = null;
  private reportLabel: Text | null = null;
  private useBtn: Graphics | null = null;
  private useLabel: Text | null = null;
  private taskBar: Graphics | null = null;
  private taskBarFill: Graphics | null = null;
  private taskText: Text | null = null;

  private onKill: (() => void) | null = null;
  private onSabotage: (() => void) | null = null;
  private onReport: (() => void) | null = null;
  private onUse: (() => void) | null = null;

  constructor() {
    this.build();
  }

  getContainer(): Container {
    return this.hudContainer;
  }

  setCallbacks(callbacks: {
    onKill?: () => void;
    onSabotage?: () => void;
    onReport?: () => void;
    onUse?: () => void;
  }): void {
    this.onKill = callbacks.onKill ?? null;
    this.onSabotage = callbacks.onSabotage ?? null;
    this.onReport = callbacks.onReport ?? null;
    this.onUse = callbacks.onUse ?? null;
  }

  private build(): void {
    const labelStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 12,
      fill: 0xffffff,
      fontWeight: 'bold',
    });

    // Kill button
    this.killBtn = new Graphics();
    this.killBtn.roundRect(0, 0, BTN_SIZE, BTN_SIZE, BTN_RADIUS);
    this.killBtn.fill(0xcc2222);
    this.killBtn.eventMode = 'static';
    this.killBtn.cursor = 'pointer';
    this.killBtn.on('pointerdown', () => this.onKill?.());
    this.hudContainer.addChild(this.killBtn);

    this.killLabel = new Text({ text: 'KILL', style: labelStyle });
    this.killLabel.anchor.set(0.5, 0.5);
    this.hudContainer.addChild(this.killLabel);

    this.killCooldownText = new Text({
      text: '',
      style: new TextStyle({
        fontFamily: 'monospace',
        fontSize: 20,
        fill: 0xffffff,
        fontWeight: 'bold',
      }),
    });
    this.killCooldownText.anchor.set(0.5, 0.5);
    this.hudContainer.addChild(this.killCooldownText);

    // Sabotage button
    this.sabotageBtn = new Graphics();
    this.sabotageBtn.roundRect(0, 0, BTN_SIZE, BTN_SIZE, BTN_RADIUS);
    this.sabotageBtn.fill(0x884400);
    this.sabotageBtn.eventMode = 'static';
    this.sabotageBtn.cursor = 'pointer';
    this.sabotageBtn.on('pointerdown', () => this.onSabotage?.());
    this.hudContainer.addChild(this.sabotageBtn);

    this.sabotageLabel = new Text({ text: 'SABO', style: labelStyle });
    this.sabotageLabel.anchor.set(0.5, 0.5);
    this.hudContainer.addChild(this.sabotageLabel);

    // Report button
    this.reportBtn = new Graphics();
    this.reportBtn.roundRect(0, 0, BTN_SIZE, BTN_SIZE, BTN_RADIUS);
    this.reportBtn.fill(0xccaa00);
    this.reportBtn.eventMode = 'static';
    this.reportBtn.cursor = 'pointer';
    this.reportBtn.on('pointerdown', () => this.onReport?.());
    this.hudContainer.addChild(this.reportBtn);

    this.reportLabel = new Text({ text: 'REPORT', style: labelStyle });
    this.reportLabel.anchor.set(0.5, 0.5);
    this.hudContainer.addChild(this.reportLabel);

    // Use button
    this.useBtn = new Graphics();
    this.useBtn.roundRect(0, 0, BTN_SIZE, BTN_SIZE, BTN_RADIUS);
    this.useBtn.fill(0x2266aa);
    this.useBtn.eventMode = 'static';
    this.useBtn.cursor = 'pointer';
    this.useBtn.on('pointerdown', () => this.onUse?.());
    this.hudContainer.addChild(this.useBtn);

    this.useLabel = new Text({ text: 'USE', style: labelStyle });
    this.useLabel.anchor.set(0.5, 0.5);
    this.hudContainer.addChild(this.useLabel);

    // Task progress bar (top of screen)
    this.taskBar = new Graphics();
    this.hudContainer.addChild(this.taskBar);

    this.taskBarFill = new Graphics();
    this.hudContainer.addChild(this.taskBarFill);

    this.taskText = new Text({
      text: 'Tasks',
      style: new TextStyle({
        fontFamily: 'monospace',
        fontSize: 14,
        fill: 0xffffff,
      }),
    });
    this.taskText.anchor.set(0.5, 0.5);
    this.hudContainer.addChild(this.taskText);
  }

  update(state: HUDState): void {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Hide everything during meetings
    this.hudContainer.visible = !state.inMeeting;
    if (state.inMeeting) return;

    const isImpostor = state.role === 'impostor';

    // --- Position bottom-right buttons ---
    const baseX = w - BTN_SIZE - 20;
    const baseY = h - BTN_SIZE - 20;

    // Kill button (impostor only)
    this.killBtn!.visible = isImpostor && state.alive;
    this.killLabel!.visible = isImpostor && state.alive;
    this.killCooldownText!.visible = isImpostor && state.alive;

    if (isImpostor && state.alive) {
      this.killBtn!.x = baseX;
      this.killBtn!.y = baseY;
      this.killBtn!.alpha = state.canKill ? 1.0 : 0.4;
      this.killLabel!.x = baseX + BTN_SIZE / 2;
      this.killLabel!.y = baseY + BTN_SIZE / 2;

      if (state.killCooldown > 0) {
        this.killCooldownText!.text = `${Math.ceil(state.killCooldown)}`;
        this.killCooldownText!.x = baseX + BTN_SIZE / 2;
        this.killCooldownText!.y = baseY + BTN_SIZE / 2 - 1;
        this.killLabel!.visible = false;
      } else {
        this.killCooldownText!.text = '';
      }
    }

    // Sabotage button (impostor only, next to kill)
    this.sabotageBtn!.visible = isImpostor && state.alive;
    this.sabotageLabel!.visible = isImpostor && state.alive;

    if (isImpostor && state.alive) {
      this.sabotageBtn!.x = baseX - BTN_SIZE - BTN_GAP;
      this.sabotageBtn!.y = baseY;
      this.sabotageBtn!.alpha = state.canSabotage ? 1.0 : 0.4;
      this.sabotageLabel!.x = baseX - BTN_SIZE - BTN_GAP + BTN_SIZE / 2;
      this.sabotageLabel!.y = baseY + BTN_SIZE / 2;
    }

    // Report button (visible when near a dead body)
    this.reportBtn!.visible = state.canReport && state.alive;
    this.reportLabel!.visible = state.canReport && state.alive;

    if (state.canReport && state.alive) {
      const reportX = isImpostor
        ? baseX - 2 * (BTN_SIZE + BTN_GAP)
        : baseX;
      this.reportBtn!.x = reportX;
      this.reportBtn!.y = baseY;
      this.reportLabel!.x = reportX + BTN_SIZE / 2;
      this.reportLabel!.y = baseY + BTN_SIZE / 2;
    }

    // Use button (visible when near a task or emergency button)
    this.useBtn!.visible = state.canUse && state.alive;
    this.useLabel!.visible = state.canUse && state.alive;

    if (state.canUse && state.alive) {
      const useX = isImpostor
        ? baseX - 3 * (BTN_SIZE + BTN_GAP)
        : baseX - (state.canReport ? BTN_SIZE + BTN_GAP : 0);
      this.useBtn!.x = useX;
      this.useBtn!.y = baseY;
      this.useLabel!.x = useX + BTN_SIZE / 2;
      this.useLabel!.y = baseY + BTN_SIZE / 2;
    }

    // --- Task progress bar ---
    const barW = 200;
    const barH = 18;
    const barX = (w - barW) / 2;
    const barY = 12;

    this.taskBar!.clear();
    this.taskBar!.roundRect(barX, barY, barW, barH, 4);
    this.taskBar!.fill({ color: 0x333333, alpha: 0.8 });
    this.taskBar!.stroke({ color: 0x666666, width: 1 });

    const fillW = Math.max(0, Math.min(1, state.taskProgress)) * (barW - 4);
    this.taskBarFill!.clear();
    if (fillW > 0) {
      this.taskBarFill!.roundRect(barX + 2, barY + 2, fillW, barH - 4, 3);
      this.taskBarFill!.fill(0x44cc44);
    }

    this.taskText!.x = w / 2;
    this.taskText!.y = barY + barH / 2;
  }
}
