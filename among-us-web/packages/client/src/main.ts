import { initApp } from './core/app';
import { sceneManager } from './core/scene-manager';
import { setFixedUpdate, startGameLoop } from './core/game-loop';
import './core/input-manager'; // ensure singleton is initialized
import { getAudioManager } from './core/audio-manager';
import { MenuScene } from './scenes/menu-scene';

async function main() {
  const gameContainer = document.getElementById('game-container');
  if (!gameContainer) {
    throw new Error('#game-container element not found');
  }

  await initApp(gameContainer);

  // Show loading text
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'loading-screen';
  loadingDiv.style.cssText =
    'position:fixed;top:0;left:0;width:100%;height:100%;display:flex;' +
    'align-items:center;justify-content:center;background:#1a1a2e;color:#fff;' +
    'font-family:monospace;font-size:24px;z-index:1000;';
  loadingDiv.textContent = 'Loading...';
  document.body.appendChild(loadingDiv);

  // Initialize audio system (sounds load lazily via Howler)
  const audio = getAudioManager();
  audio.loadSounds();

  // Create and push the menu scene
  const menuScene = new MenuScene();
  await sceneManager.push(menuScene);

  // Remove loading screen
  loadingDiv.remove();

  setFixedUpdate((dt) => {
    sceneManager.update(dt);
  });

  startGameLoop();
}

main();
