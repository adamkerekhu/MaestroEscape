import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import type { Scene } from '../core/scene-manager';
import { sceneManager } from '../core/scene-manager';
import { MenuScene } from './menu-scene';
import type { PlayerRole, WinReason } from '@among-us/shared';

const WIN_REASON_TEXT: Record<WinReason, string> = {
  tasks_completed: 'All tasks have been completed.',
  all_impostors_ejected: 'All Impostors have been ejected.',
  all_crewmates_killed: 'Impostors eliminated all Crewmates.',
  sabotage_meltdown: 'Reactor meltdown!',
  disconnect: 'Players disconnected.',
};

export class GameOverScene implements Scene {
  container = new Container();
  isOverlay = true;

  private winningRole: PlayerRole;
  private localRole: PlayerRole;
  private winReason: WinReason;
  private impostorNames: string[];
  private ready = false;

  private onKeyDown = (): void => {
    this.returnToMenu();
  };

  private onPointerDown = (): void => {
    this.returnToMenu();
  };

  constructor(
    winningRole: PlayerRole,
    localRole: PlayerRole,
    winReason: WinReason,
    impostorNames: string[],
  ) {
    this.winningRole = winningRole;
    this.localRole = localRole;
    this.winReason = winReason;
    this.impostorNames = impostorNames;
  }

  async onEnter(): Promise<void> {
    const w = window.innerWidth;
    const h = window.innerHeight;

    // Overlay background
    const overlay = new Graphics();
    overlay.rect(0, 0, w, h);
    overlay.fill({ color: 0x000000, alpha: 0.85 });
    overlay.eventMode = 'static';
    overlay.on('pointerdown', this.onPointerDown);
    this.container.addChild(overlay);

    const isVictory = this.winningRole === this.localRole;
    const headColor = isVictory ? 0x44cc44 : 0xcc4444;
    const headText = isVictory ? 'VICTORY' : 'DEFEAT';

    // Main heading
    const headStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 72,
      fill: headColor,
      fontWeight: 'bold',
      dropShadow: {
        color: 0x000000,
        distance: 4,
        blur: 8,
      },
    });
    const heading = new Text({ text: headText, style: headStyle });
    heading.anchor.set(0.5, 0.5);
    heading.x = w / 2;
    heading.y = h / 2 - 80;
    this.container.addChild(heading);

    // Win reason
    const reasonStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 24,
      fill: 0xdddddd,
      align: 'center',
    });
    const reasonText = new Text({
      text: WIN_REASON_TEXT[this.winReason] ?? '',
      style: reasonStyle,
    });
    reasonText.anchor.set(0.5, 0.5);
    reasonText.x = w / 2;
    reasonText.y = h / 2;
    this.container.addChild(reasonText);

    // Impostor reveal
    const revealStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 20,
      fill: 0xff6666,
      align: 'center',
    });
    const impostorText =
      this.impostorNames.length === 1
        ? `The Impostor was: ${this.impostorNames[0]}`
        : `The Impostors were: ${this.impostorNames.join(', ')}`;
    const reveal = new Text({ text: impostorText, style: revealStyle });
    reveal.anchor.set(0.5, 0.5);
    reveal.x = w / 2;
    reveal.y = h / 2 + 50;
    this.container.addChild(reveal);

    // Return to lobby hint
    const hintStyle = new TextStyle({
      fontFamily: 'monospace',
      fontSize: 16,
      fill: 0x999999,
    });
    const hint = new Text({
      text: 'Click or press any key to return to menu...',
      style: hintStyle,
    });
    hint.anchor.set(0.5, 0.5);
    hint.x = w / 2;
    hint.y = h / 2 + 120;
    this.container.addChild(hint);

    // Delay enabling input briefly to avoid accidental immediate dismissal
    setTimeout(() => {
      this.ready = true;
      window.addEventListener('keydown', this.onKeyDown, { once: true });
    }, 500);
  }

  update(_dt: number): void {
    // No per-frame updates needed
  }

  async onExit(): Promise<void> {
    window.removeEventListener('keydown', this.onKeyDown);
    this.container.removeChildren();
  }

  private async returnToMenu(): Promise<void> {
    if (!this.ready) return;
    this.ready = false;
    window.removeEventListener('keydown', this.onKeyDown);

    // Pop GameOverScene (this overlay), then pop GameScene underneath
    await sceneManager.pop();
    await sceneManager.pop();

    // Push fresh MenuScene
    const menu = new MenuScene();
    await sceneManager.push(menu);
  }
}
