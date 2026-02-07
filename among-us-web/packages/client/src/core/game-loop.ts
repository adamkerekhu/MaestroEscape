import { Ticker } from 'pixi.js';

const FIXED_DT = 1 / 60;

type UpdateCallback = (dt: number) => void;
type RenderCallback = (alpha: number) => void;

let fixedUpdateFn: UpdateCallback = () => {};
let renderFn: RenderCallback = () => {};
let accumulator = 0;

const ticker = new Ticker();

ticker.add(() => {
  const frameDt = ticker.deltaMS / 1000;
  accumulator += frameDt;

  while (accumulator >= FIXED_DT) {
    fixedUpdateFn(FIXED_DT);
    accumulator -= FIXED_DT;
  }

  const alpha = accumulator / FIXED_DT;
  renderFn(alpha);
});

export function setFixedUpdate(fn: UpdateCallback): void {
  fixedUpdateFn = fn;
}

export function setRender(fn: RenderCallback): void {
  renderFn = fn;
}

export function startGameLoop(): void {
  accumulator = 0;
  ticker.start();
}

export function stopGameLoop(): void {
  ticker.stop();
}
