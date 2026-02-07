import { Assets, Spritesheet } from 'pixi.js';

let playerSheet: Spritesheet | null = null;

export async function loadPlayerSpritesheet(color: string): Promise<Spritesheet> {
  const sheet: Spritesheet = await Assets.load(`/assets/spritesheets/player_${color}.json`);
  playerSheet = sheet;
  return sheet;
}

export function getPlayerSpritesheet(): Spritesheet {
  if (!playerSheet) {
    throw new Error('Player spritesheet not loaded. Call loadPlayerSpritesheet() first.');
  }
  return playerSheet;
}
