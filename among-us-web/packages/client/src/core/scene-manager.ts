import { Container } from 'pixi.js';
import { getApp } from './app';

export interface Scene {
  container: Container;
  isOverlay: boolean;
  onEnter(): Promise<void>;
  onExit(): Promise<void>;
  update(dt: number): void;
}

class SceneManager {
  private stack: Scene[] = [];

  get current(): Scene | undefined {
    return this.stack[this.stack.length - 1];
  }

  async push(scene: Scene): Promise<void> {
    const app = getApp();
    app.stage.addChild(scene.container);
    this.stack.push(scene);
    await scene.onEnter();
  }

  async pop(): Promise<Scene | undefined> {
    const scene = this.stack.pop();
    if (!scene) return undefined;

    await scene.onExit();
    const app = getApp();
    app.stage.removeChild(scene.container);
    return scene;
  }

  async replace(scene: Scene): Promise<void> {
    await this.pop();
    await this.push(scene);
  }

  update(dt: number): void {
    for (const scene of this.stack) {
      scene.update(dt);
    }
  }
}

export const sceneManager = new SceneManager();
