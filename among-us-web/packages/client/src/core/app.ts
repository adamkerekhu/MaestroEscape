import { Application } from 'pixi.js';

let app: Application | null = null;

export async function initApp(container: HTMLElement): Promise<Application> {
  app = new Application();
  await app.init({
    background: '#1a1a2e',
    resizeTo: window,
  });

  container.appendChild(app.canvas);

  const onResize = () => {
    if (app) {
      app.renderer.resize(window.innerWidth, window.innerHeight);
    }
  };
  window.addEventListener('resize', onResize);

  return app;
}

export function getApp(): Application {
  if (!app) {
    throw new Error('Application not initialized. Call initApp() first.');
  }
  return app;
}
