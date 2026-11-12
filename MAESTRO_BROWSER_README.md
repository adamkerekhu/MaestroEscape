# MaestroEscape: browser-only map exploration

The browser Worker now uses the custom **Maestro Pub map** from the uploaded `maestro_pub_v2(1).zip`. It is not the original spaceship map.

## Current feature set

- **Map:** `Assets/Maps/maestro_map.webp` (optimized 1600×992 version of the uploaded `maestro_map.png`)
- **Character:** original animated blue walking sprite from the Python clone
- **Spawn:** (859, 577)
- **Controls:** WASD/arrows to move; Shift to sprint; R to respawn; E for pub marker interaction
- **Camera:** follows the player
- **Buildings:** 12 approximate collision polygons from map geometry
- No lobby, multiplayer or Durable Objects

## Deployment

Worker name: `maestroescape`. Cloudflare connected to GitHub's `main` branch should build/deploy when a commit is pushed.

Build: `npm run build`
Deploy: `npx wrangler deploy`

The map image is committed in GitHub as a WebP and is delivered to the client from the public repository through jsDelivr. The original uploaded ZIP and Pygame files are not required for the browser to run.

## Known issues / next steps

- Building collisions are approximations; refine after checking the live player path.
- The map is displayed as a flattened image; editing the Tiled layers will require exporting another image.
- There is currently one basic interaction marker.
- Actual live Cloudflare deployment and browser playtesting have not been verified from this conversation.
