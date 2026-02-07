import { Container } from 'pixi.js';
import type { Direction, PlayerColor } from '@among-us/shared';
import { loadPlayerSpritesheet } from '../core/asset-loader';
import { RemotePlayer } from '../game/remote-player';

export class StateSync {
  private remotePlayers = new Map<string, RemotePlayer>();
  private container = new Container();

  getContainer(): Container {
    return this.container;
  }

  getRemotePlayers(): Map<string, RemotePlayer> {
    return this.remotePlayers;
  }

  async addPlayer(
    id: string,
    name: string,
    color: PlayerColor,
    x: number,
    y: number,
  ): Promise<RemotePlayer> {
    // Remove existing if present
    this.removePlayer(id);

    const sheet = await loadPlayerSpritesheet(color);
    const remote = new RemotePlayer(id, name, sheet, color, x, y);
    this.remotePlayers.set(id, remote);
    this.container.addChild(remote.getContainer());
    return remote;
  }

  removePlayer(id: string): void {
    const existing = this.remotePlayers.get(id);
    if (existing) {
      this.container.removeChild(existing.getContainer());
      this.remotePlayers.delete(id);
    }
  }

  handlePlayerMoved(
    playerId: string,
    x: number,
    y: number,
    direction: Direction,
  ): void {
    const remote = this.remotePlayers.get(playerId);
    if (remote) {
      remote.setTargetPosition(x, y, direction);
    }
  }

  handlePlayerStopped(playerId: string, x: number, y: number): void {
    const remote = this.remotePlayers.get(playerId);
    if (remote) {
      remote.stop(x, y);
    }
  }

  handlePlayerKilled(playerId: string): void {
    const remote = this.remotePlayers.get(playerId);
    if (remote) {
      remote.kill();
    }
  }

  update(dt: number): void {
    for (const [, remote] of this.remotePlayers) {
      remote.update(dt);
    }
  }

  clear(): void {
    for (const [, remote] of this.remotePlayers) {
      this.container.removeChild(remote.getContainer());
    }
    this.remotePlayers.clear();
  }
}
