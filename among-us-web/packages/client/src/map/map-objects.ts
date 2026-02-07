export interface AABB {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface NamedPoint {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MapObjects {
  collisions: AABB[];
  namedPoints: NamedPoint[];
}

const COLLISION_NAMES = new Set([
  'walls',
  'tables',
  'props',
  'generator',
  'medbay_comp',
  'engines',
  'reactor',
  'security_room_comp',
  'admin_btn1',
  'admin_btn2',
]);

export function parseMapObjects(doc: Document): MapObjects {
  const collisions: AABB[] = [];
  const namedPoints: NamedPoint[] = [];

  const objectGroups = doc.querySelectorAll('objectgroup');

  for (const group of objectGroups) {
    const objects = group.querySelectorAll('object');

    for (const obj of objects) {
      const name = obj.getAttribute('name') ?? '';
      const x = parseFloat(obj.getAttribute('x') ?? '0');
      const y = parseFloat(obj.getAttribute('y') ?? '0');
      const width = parseFloat(obj.getAttribute('width') ?? '0');
      const height = parseFloat(obj.getAttribute('height') ?? '0');

      if (COLLISION_NAMES.has(name)) {
        collisions.push({ x, y, width, height });
      } else if (name) {
        namedPoints.push({ name, x, y, width, height });
      }
    }
  }

  return { collisions, namedPoints };
}
