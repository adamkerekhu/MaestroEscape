# MaestroEscape — Cloudflare single-player explorer

This is the first **browser** version that uses assets from the user's existing Pygame game, not the previous placeholder circles/rectangles prototype.

## What runs now

- Original Tiled `Assets/Maps/map.tmx` collision rectangles are read at runtime.
- Original `Assets/Maps/map2.png` is displayed as a scrolling map.
- Original blue character walking animation frames from `Assets/Images/Player/Blue/...` are rendered through Phaser 3.
- WASD / arrows move; Shift sprints; E interacts; R respawns.
- Camera follows player. Spawn seeks a walkable point.
- Exploration waypoints: Jacket, Car keys, Own car, Taxi, Bubi, Kebab shop, Trafik.
- Interactions display messages and require jacket/keys before specific escapes.

**No multiplayer, server, lobby, rooms, database, or Durable Objects.**

## Deploy

This Cloudflare Worker is named `maestroescape` and is connected to the repository's `main` branch.

Build command: `npm run build`  
Deploy command: `npx wrangler deploy`

Alternatively use `npx wrangler deploy` locally with Wrangler authentication.

## Important limitations

- The original TMX map remains the original spaceship, **not a newly designed pub**.
- The original map and walking sprite images are loaded from the project's public GitHub repository through jsDelivr at runtime; the game needs network access to those assets.
- The game uses the original map's collision objects and player sprites, but the original Python gameplay code itself cannot execute in the browser.
- This browser version has not been manually verified against a live Cloudflare deployment.
- Original game sprites may have third-party rights; for any public/commercial release they should be replaced with original or properly licensed artwork.
