import { Assets, Container, Spritesheet } from 'pixi.js';
import { Bot } from './bot';
import { CollisionSystem } from './collision';
import { BOT_POSITIONS } from '@among-us/shared';
import type { PlayerColor } from '@among-us/shared';

// Bot colors: skip 'red' (player default), use the remaining 9
const BOT_COLORS: PlayerColor[] = [
  'blue',
  'green',
  'orange',
  'yellow',
  'black',
  'brown',
  'pink',
  'purple',
  'white',
];

export class BotManager {
  private bots: Bot[] = [];
  private collisionSystem: CollisionSystem | null = null;

  async spawnBots(
    count: number,
    collisionSystem: CollisionSystem,
  ): Promise<void> {
    this.collisionSystem = collisionSystem;
    const spawnCount = Math.min(count, BOT_COLORS.length, BOT_POSITIONS.length);

    for (let i = 0; i < spawnCount; i++) {
      const color = BOT_COLORS[i];
      const pos = BOT_POSITIONS[i % BOT_POSITIONS.length];
      const sheet: Spritesheet = await Assets.load(
        `/assets/spritesheets/player_${color}.json`,
      );

      const bot = new Bot(
        `bot-${i}`,
        `Bot ${color.charAt(0).toUpperCase() + color.slice(1)}`,
        color,
        pos.x,
        pos.y,
        sheet,
      );
      this.bots.push(bot);
    }
  }

  update(dt: number): void {
    if (!this.collisionSystem) return;
    for (const bot of this.bots) {
      if (bot.alive) {
        bot.update(dt, this.collisionSystem);
      }
    }
  }

  getAliveBots(): Bot[] {
    return this.bots.filter((b) => b.alive);
  }

  getBotAt(x: number, y: number, range: number): Bot | null {
    let closest: Bot | null = null;
    let closestDist = range;

    for (const bot of this.bots) {
      if (!bot.alive) continue;
      const dx = bot.x - x;
      const dy = bot.y - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < closestDist) {
        closestDist = dist;
        closest = bot;
      }
    }

    return closest;
  }

  getAllContainers(): Container[] {
    return this.bots.map((b) => b.getContainer());
  }
}
