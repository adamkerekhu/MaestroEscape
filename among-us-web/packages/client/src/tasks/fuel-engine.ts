import { Graphics, Text } from 'pixi.js';
import { TaskBase } from './task-base';

/**
 * Fuel Engine: Hold the fuel button to fill the tank.
 * A progress bar fills up while the button is held. Release stops filling.
 */
export class FuelEngineTask extends TaskBase {
  private fuelBar!: Graphics;
  private fuelLevel = 0;
  private filling = false;

  constructor() {
    super('fuel_engine');
  }

  protected setupTask(): void {
    const title = new Text({
      text: 'Fuel Engine',
      style: { fontSize: 22, fill: 0xffffff, fontFamily: 'Arial', fontWeight: 'bold' },
    });
    title.anchor.set(0.5, 0);
    title.y = -180;
    this.panel.addChild(title);

    // Fuel tank outline
    const tankX = -60;
    const tankY = -120;
    const tankW = 120;
    const tankH = 240;
    const tank = new Graphics();
    tank.roundRect(tankX, tankY, tankW, tankH, 8);
    tank.fill({ color: 0x1a1a2e });
    tank.stroke({ color: 0x888888, width: 3 });
    this.panel.addChild(tank);

    // Tank gauge markings
    for (let i = 0; i <= 4; i++) {
      const gy = tankY + tankH - (i / 4) * tankH;
      const mark = new Graphics();
      mark.moveTo(tankX - 10, gy);
      mark.lineTo(tankX, gy);
      mark.stroke({ color: 0xaaaaaa, width: 1 });
      this.panel.addChild(mark);

      const label = new Text({
        text: `${i * 25}%`,
        style: { fontSize: 10, fill: 0xaaaaaa, fontFamily: 'monospace' },
      });
      label.anchor.set(1, 0.5);
      label.x = tankX - 14;
      label.y = gy;
      this.panel.addChild(label);
    }

    // Fuel level fill
    this.fuelBar = new Graphics();
    this.panel.addChild(this.fuelBar);

    // Fuel nozzle icon
    const nozzle = new Graphics();
    nozzle.rect(tankX + 40, tankY + tankH, 40, 10);
    nozzle.fill({ color: 0x666666 });
    nozzle.rect(tankX + 50, tankY + tankH + 10, 20, 30);
    nozzle.fill({ color: 0x888888 });
    this.panel.addChild(nozzle);

    // Fuel button
    const btnY = 60;
    const btn = new Graphics();
    btn.circle(160, btnY, 40);
    btn.fill({ color: 0x33aa33 });
    btn.stroke({ color: 0xffffff, width: 3 });
    btn.eventMode = 'static';
    btn.cursor = 'pointer';
    this.panel.addChild(btn);

    const btnLabel = new Text({
      text: 'HOLD\nTO\nFUEL',
      style: { fontSize: 11, fill: 0xffffff, fontFamily: 'Arial', fontWeight: 'bold', align: 'center' },
    });
    btnLabel.anchor.set(0.5);
    btnLabel.x = 160;
    btnLabel.y = btnY;
    this.panel.addChild(btnLabel);

    btn.on('pointerdown', () => {
      this.filling = true;
    });
    btn.on('pointerup', () => {
      this.filling = false;
    });
    btn.on('pointerupoutside', () => {
      this.filling = false;
    });
    this.overlay.on('pointerup', () => {
      this.filling = false;
    });
  }

  override update(dt: number): void {
    if (this.filling) {
      this.fuelLevel = Math.min(1, this.fuelLevel + dt * 0.5);
    }

    // Draw fuel level
    const tankX = -60;
    const tankY = -120;
    const tankW = 120;
    const tankH = 240;

    this.fuelBar.clear();
    if (this.fuelLevel > 0) {
      const fillH = tankH * this.fuelLevel;
      const fillY = tankY + tankH - fillH;
      this.fuelBar.roundRect(tankX + 2, fillY, tankW - 4, fillH, 6);

      // Color transitions from red to yellow to green
      let color: number;
      if (this.fuelLevel < 0.5) {
        color = 0xff6633;
      } else if (this.fuelLevel < 0.8) {
        color = 0xffcc00;
      } else {
        color = 0x33cc33;
      }
      this.fuelBar.fill({ color });
    }

    if (this.fuelLevel >= 1) {
      this.onComplete();
    }
  }
}
