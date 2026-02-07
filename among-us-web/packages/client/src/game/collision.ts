export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Collidable {
  x: number;
  y: number;
  width: number;
  height: number;
}

function rectsOverlap(a: AABB, b: AABB): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export class CollisionSystem {
  private walls: AABB[] = [];

  setWalls(walls: AABB[]): void {
    this.walls = walls;
  }

  moveAndCollide(
    entity: Collidable,
    dx: number,
    dy: number,
  ): { x: number; y: number } {
    let newX = entity.x + dx;
    let newY = entity.y + dy;

    // Move X first, check collisions
    const hBox: AABB = {
      x: newX,
      y: entity.y,
      width: entity.width,
      height: entity.height,
    };

    for (const wall of this.walls) {
      if (rectsOverlap(hBox, wall)) {
        if (dx > 0) {
          newX = wall.x - entity.width;
        } else if (dx < 0) {
          newX = wall.x + wall.width;
        }
        hBox.x = newX;
      }
    }

    // Move Y, check collisions
    const vBox: AABB = {
      x: newX,
      y: newY,
      width: entity.width,
      height: entity.height,
    };

    for (const wall of this.walls) {
      if (rectsOverlap(vBox, wall)) {
        if (dy > 0) {
          newY = wall.y - entity.height;
        } else if (dy < 0) {
          newY = wall.y + wall.height;
        }
        vBox.y = newY;
      }
    }

    return { x: newX, y: newY };
  }
}
