# MaestroEscape development: reuse the original game

The first Phaser/Cloudflare prototype in `src/worker.js` was created separately and did **not** reuse the original engine. It must not be confused with a port of the uploaded game.

## Original game reuse

`maestro_native.py` adds an experimental MaestroEscape rules mode built on the **original** `Game`, `Player`, `Bot`, `TiledMap`, `Camera`, map artwork, animated player sprites, sound loading, and physical collisions.

Launch on a Python desktop environment with the original project requirements installed:

```bash
python maestro_native.py
```

This currently uses the original ship map as a temporary environment and adds escape-specific waypoints at original map coordinates. It is a **single-player rules prototype**, not a networked version and **not available in the browser**. The original LAN server, original game code, and graphics are unchanged.

## Game rules implemented in native prototype

- Collect jacket.
- Optional car keys for car escape.
- Escape via car, taxi (8-second wait), or Bubi (4-second wait).
- Encountering NPCs adds drinks; five drinks loses the round.
- Six-minute timeout.
- Escape waypoints and HUD over the original graphics.

## Still required for requested browser multiplayer

The original Pygame engine cannot be deployed as a Cloudflare Worker. Converting it properly requires porting its Pygame rendering/assets/collisions/map to browser technology, **not** replacing all sprites with circles. The existing `src/worker.js` is an unrelated proof of concept and is not represented as the finished conversion. A real multiplayer port also needs networked roles, sabotage, and combat.

There is no claim that the native prototype has been playtested.
