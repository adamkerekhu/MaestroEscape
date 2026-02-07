import { Container, Sprite, Texture, Assets, Rectangle } from 'pixi.js';
import { parseMapObjects, type MapObjects } from './map-objects';

export interface TilesetInfo {
  firstgid: number;
  tilecount: number;
  columns: number;
  tileWidth: number;
  tileHeight: number;
  imagePath: string;
  texture: Texture;
}

export interface TiledMapData {
  container: Container;
  widthPx: number;
  heightPx: number;
  tileWidth: number;
  tileHeight: number;
  cols: number;
  rows: number;
  objects: MapObjects;
}

function resolveImagePath(basePath: string, source: string): string {
  // If the source contains path traversal (e.g. "../../../Desktop/..."),
  // just use the filename portion since the tileset image is co-located
  // with the TMX file in the deployed assets.
  const filename = source.split('/').pop()!;
  return basePath + filename;
}

function findTilesetForGid(
  tilesets: TilesetInfo[],
  gid: number,
): TilesetInfo | undefined {
  // tilesets are sorted by firstgid descending
  for (const ts of tilesets) {
    if (ts.firstgid <= gid) return ts;
  }
  return undefined;
}

export async function loadTMX(tmxPath: string): Promise<TiledMapData> {
  const response = await fetch(tmxPath);
  const text = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');

  const mapEl = doc.querySelector('map');
  if (!mapEl) throw new Error('Invalid TMX: no <map> element');

  const mapWidth = parseInt(mapEl.getAttribute('width')!);
  const mapHeight = parseInt(mapEl.getAttribute('height')!);
  const tileWidth = parseInt(mapEl.getAttribute('tilewidth')!);
  const tileHeight = parseInt(mapEl.getAttribute('tileheight')!);

  const basePath = tmxPath.substring(0, tmxPath.lastIndexOf('/') + 1);

  // Parse tilesets
  const tilesetEls = mapEl.querySelectorAll('tileset');
  const tilesets: TilesetInfo[] = [];

  for (const tsEl of tilesetEls) {
    const firstgid = parseInt(tsEl.getAttribute('firstgid')!);
    const tilecount = parseInt(tsEl.getAttribute('tilecount') ?? '0');
    const columns = parseInt(tsEl.getAttribute('columns') ?? '1');
    const tsWidth = parseInt(
      tsEl.getAttribute('tilewidth') ?? String(tileWidth),
    );
    const tsHeight = parseInt(
      tsEl.getAttribute('tileheight') ?? String(tileHeight),
    );

    const imageEl = tsEl.querySelector('image');
    if (!imageEl) continue;

    const rawSource = imageEl.getAttribute('source')!;
    const imagePath = resolveImagePath(basePath, rawSource);

    const texture = await Assets.load(imagePath);

    tilesets.push({
      firstgid,
      tilecount,
      columns,
      tileWidth: tsWidth,
      tileHeight: tsHeight,
      imagePath,
      texture,
    });
  }

  // Sort by firstgid descending for efficient lookup
  tilesets.sort((a, b) => b.firstgid - a.firstgid);

  const mapContainer = new Container();

  // Parse and render tile layers
  const layerEls = mapEl.querySelectorAll('layer');

  for (const layerEl of layerEls) {
    const dataEl = layerEl.querySelector('data');
    if (!dataEl) continue;

    const encoding = dataEl.getAttribute('encoding');
    if (encoding !== 'csv') {
      throw new Error(`Unsupported tile data encoding: ${encoding}`);
    }

    const csvText = dataEl.textContent!.trim();
    const gids = csvText.split(',').map((s) => parseInt(s.trim(), 10));
    const layerWidth = parseInt(layerEl.getAttribute('width')!);

    const layerContainer = new Container();

    for (let i = 0; i < gids.length; i++) {
      const gid = gids[i];
      if (gid === 0) continue;

      const tileset = findTilesetForGid(tilesets, gid);
      if (!tileset) continue;

      const localId = gid - tileset.firstgid;
      const sx = (localId % tileset.columns) * tileset.tileWidth;
      const sy = Math.floor(localId / tileset.columns) * tileset.tileHeight;

      const frame = new Rectangle(sx, sy, tileset.tileWidth, tileset.tileHeight);
      const tileTexture = new Texture({
        source: tileset.texture.source,
        frame,
      });

      const sprite = new Sprite(tileTexture);
      const col = i % layerWidth;
      const row = Math.floor(i / layerWidth);
      sprite.x = col * tileWidth;
      sprite.y = row * tileHeight;

      layerContainer.addChild(sprite);
    }

    mapContainer.addChild(layerContainer);
  }

  // Parse object layers
  const objects = parseMapObjects(doc);

  return {
    container: mapContainer,
    widthPx: mapWidth * tileWidth,
    heightPx: mapHeight * tileHeight,
    tileWidth,
    tileHeight,
    cols: mapWidth,
    rows: mapHeight,
    objects,
  };
}
