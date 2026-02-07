import { Graphics, Text } from 'pixi.js';
import { TaskBase } from './task-base';

/**
 * Reboot Wifi: Pull the lever down to reboot the wifi router.
 * The router shows a rebooting animation then completes.
 */
export class RebootWifiTask extends TaskBase {
  private lever!: Graphics;
  private statusText!: Text;
  private statusDots!: Text;
  private pulled = false;
  private rebootTimer = 0;
  private rebooting = false;
  private dotCount = 0;
  private dotTimer = 0;

  constructor() {
    super('reboot_wifi');
  }

  protected setupTask(): void {
    const title = new Text({
      text: 'Reboot Wifi',
      style: { fontSize: 22, fill: 0xffffff, fontFamily: 'Arial', fontWeight: 'bold' },
    });
    title.anchor.set(0.5, 0);
    title.y = -180;
    this.panel.addChild(title);

    // Router box
    const router = new Graphics();
    router.roundRect(-120, -100, 160, 100, 8);
    router.fill({ color: 0x222244 });
    router.stroke({ color: 0x4444aa, width: 2 });
    this.panel.addChild(router);

    // Antenna
    const antenna = new Graphics();
    antenna.moveTo(-80, -100);
    antenna.lineTo(-80, -140);
    antenna.stroke({ color: 0x888888, width: 3 });
    antenna.moveTo(-20, -100);
    antenna.lineTo(-20, -130);
    antenna.stroke({ color: 0x888888, width: 3 });
    this.panel.addChild(antenna);

    // LED indicators
    const leds = [0xff0000, 0xff0000, 0xff0000]; // Initially red (offline)
    for (let i = 0; i < 3; i++) {
      const led = new Graphics();
      led.circle(-90 + i * 30, -55, 6);
      led.fill({ color: leds[i] });
      this.panel.addChild(led);
    }

    // Status text
    this.statusText = new Text({
      text: 'OFFLINE',
      style: { fontSize: 16, fill: 0xff3333, fontFamily: 'monospace' },
    });
    this.statusText.anchor.set(0.5, 0);
    this.statusText.y = 20;
    this.panel.addChild(this.statusText);

    this.statusDots = new Text({
      text: '',
      style: { fontSize: 16, fill: 0xffcc00, fontFamily: 'monospace' },
    });
    this.statusDots.anchor.set(0, 0);
    this.statusDots.x = 50;
    this.statusDots.y = 20;
    this.panel.addChild(this.statusDots);

    // Lever track
    const leverTrack = new Graphics();
    leverTrack.rect(100, -100, 30, 200);
    leverTrack.fill({ color: 0x333333 });
    leverTrack.stroke({ color: 0x666666, width: 2 });
    this.panel.addChild(leverTrack);

    // Lever handle
    this.lever = new Graphics();
    this.lever.roundRect(-20, -15, 40, 30, 6);
    this.lever.fill({ color: 0x6699cc });
    this.lever.stroke({ color: 0xffffff, width: 2 });
    this.lever.x = 115;
    this.lever.y = -70;
    this.lever.eventMode = 'static';
    this.lever.cursor = 'pointer';
    this.panel.addChild(this.lever);

    // Arrow hint
    const arrow = new Text({
      text: 'v',
      style: { fontSize: 24, fill: 0xaaaaaa, fontFamily: 'Arial' },
    });
    arrow.anchor.set(0.5);
    arrow.x = 115;
    arrow.y = 130;
    this.panel.addChild(arrow);

    // Drag interaction
    let dragging = false;
    this.lever.on('pointerdown', () => {
      if (!this.pulled) dragging = true;
    });

    this.overlay.on('pointermove', (e: { global: { x: number; y: number } }) => {
      if (!dragging) return;
      const local = this.panel.toLocal({ x: e.global.x, y: e.global.y });
      this.lever.y = Math.max(-70, Math.min(80, local.y));
    });

    this.overlay.on('pointerup', () => {
      if (!dragging) return;
      dragging = false;
      if (this.lever.y > 60) {
        this.pulled = true;
        this.rebooting = true;
        this.lever.y = 80;
        this.lever.eventMode = 'none';
        this.statusText.text = 'REBOOTING';
        this.statusText.style.fill = 0xffcc00;
      } else {
        this.lever.y = -70;
      }
    });
  }

  override update(dt: number): void {
    if (!this.rebooting) return;

    this.rebootTimer += dt;
    this.dotTimer += dt;

    // Animate dots
    if (this.dotTimer > 0.4) {
      this.dotTimer = 0;
      this.dotCount = (this.dotCount + 1) % 4;
      this.statusDots.text = '.'.repeat(this.dotCount);
    }

    // After 2 seconds, complete
    if (this.rebootTimer > 2) {
      this.statusText.text = 'ONLINE';
      this.statusText.style.fill = 0x33cc33;
      this.statusDots.text = '';
      this.onComplete();
    }
  }
}
