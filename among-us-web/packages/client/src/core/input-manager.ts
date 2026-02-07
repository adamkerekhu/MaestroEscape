const DIAGONAL_FACTOR = 0.7071;

class InputManager {
  private keys = new Set<string>();

  constructor() {
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
    });
    window.addEventListener('keyup', (e) => {
      this.keys.delete(e.code);
    });
    window.addEventListener('blur', () => {
      this.keys.clear();
    });
  }

  isDown(code: string): boolean {
    return this.keys.has(code);
  }

  getMovementVector(): { x: number; y: number } {
    let x = 0;
    let y = 0;

    if (this.isDown('KeyA') || this.isDown('ArrowLeft')) x -= 1;
    if (this.isDown('KeyD') || this.isDown('ArrowRight')) x += 1;
    if (this.isDown('KeyW') || this.isDown('ArrowUp')) y -= 1;
    if (this.isDown('KeyS') || this.isDown('ArrowDown')) y += 1;

    if (x !== 0 && y !== 0) {
      x *= DIAGONAL_FACTOR;
      y *= DIAGONAL_FACTOR;
    }

    return { x, y };
  }
}

export const inputManager = new InputManager();
