# MaestroEscape — single-player Cloudflare map

The Cloudflare Worker code has been updated to roam around the **Mester utca × Viola utca Maestro Pub map** uploaded as `maestro_pub_v2(1).zip`.

- Map dimensions: **1600 × 992 pixels**.
- Player spawn: **(859, 577)**, near Maestro Pub.
- Building collisions: twelve approximate polygons from `gameplay_geometry.json` bundled into the browser code.
- WASD/arrows to move, Shift to sprint, R to respawn, E to interact with Maestro Pub.
- Animated blue character sprites are loaded from the original Python game's GitHub assets.
- No multiplayer, lobby, database, or Durable Objects.

## Asset that must exist in GitHub

The new Worker loads the **original image** from:

`Assets/Maps/maestro_map.png`

The GitHub connector used here can update text source but cannot upload the binary image from the conversation's ZIP. **Until this PNG is uploaded, the Worker intentionally displays a missing-image message instead of a fake background.**

Upload the supplied file `maestro_map.png` into `Assets/Maps/` on the `main` branch through GitHub. Once committed, Cloudflare's GitHub integration should automatically deploy; refresh the game.

`maestro_pub.tmx` and `maestro_art.tsx` are included in the user-provided ZIP for editing in Tiled, but are not required at runtime because the image and collisions are handled directly in the browser code.

## Deployment configuration

Cloudflare Worker: `maestroescape`
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`

The original Python files remain unchanged.
