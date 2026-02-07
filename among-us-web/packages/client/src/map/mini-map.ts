import { Container, Graphics, TextStyle, Text } from 'pixi.js';
import { GAME_CONFIG } from '@among-us/shared';
import type { PlayerColor } from '@among-us/shared';
import { inputManager } from '../core/input-manager';

const COLOR_MAP: Record<PlayerColor, number> = {
  red: 0xc51111,
  blue: 0x132ed1,
  green: 0x117f2d,
  orange: 0xed7a09,
  yellow: 0xf5f557,
  black: 0x3f474e,
  brown: 0x71491e,
  pink: 0xd6b1ff,
  purple: 0x6b2fbb,
  white: 0xd5e0ef,
};

const MINIMAP_WIDTH = 200;
const MINIMAP_HEIGHT = 110;
const MINIMAP_MARGIN = 12;
const DOT_RADIUS = 4;

export class MiniMap {
  private mapContainer = new Container();
  private bg: Graphics;
  private dot: Graphics;
  private visible = false;
  private scaleX: number;
  private scaleY: number;
  private label: Text;

  constructor() {
    this.scaleX = MINIMAP_WIDTH / GAME_CONFIG.MAP_WIDTH;
    this.scaleY = MINIMAP_HEIGHT / GAME_CONFIG.MAP_HEIGHT;

    // Background
    this.bg = new Graphics();
    this.bg.roundRect(0, 0, MINIMAP_WIDTH, MINIMAP_HEIGHT, 6);
    this.bg.fill({ color: 0x111122, alpha: 0.65 });
    this.bg.stroke({ color: 0x444466, width: 1 });
    this.mapContainer.addChild(this.bg);

    // Player dot
    this.dot = new Graphics();
    this.dot.circle(0, 0, DOT_RADIUS);
    this.dot.fill(0x44ff44);
    this.mapContainer.addChild(this.dot);

    // Label
    this.label = new Text({
      text: 'MAP [Tab]',
      style: new TextStyle({
        fontFamily: 'monospace',
        fontSize: 10,
        fill: 0x999999,
      }),
    });
    this.label.x = 4;
    this.label.y = 2;
    this.mapContainer.addChild(this.label);

    this.mapContainer.visible = false;

    // Tab key toggles
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Tab') {
        e.preventDefault();
        this.visible = !this.visible;
        this.mapContainer.visible = this.visible;
      }
    });
  }

  getContainer(): Container {
    return this.mapContainer;
  }

  /** Call each frame to position the minimap and update dot */
  update(playerX: number, playerY: number, color: PlayerColor): void {
    // Position in top-right corner
    const screenW = window.innerWidth;
    this.mapContainer.x = screenW - MINIMAP_WIDTH - MINIMAP_MARGIN;
    this.mapContainer.y = MINIMAP_MARGIN + 35; // below task bar

    // Redraw dot with player color
    this.dot.clear();
    this.dot.circle(0, 0, DOT_RADIUS);
    this.dot.fill(COLOR_MAP[color] ?? 0x44ff44);

    // Map player world coords to minimap coords
    this.dot.x = playerX * this.scaleX;
    this.dot.y = playerY * this.scaleY;
  }
}
