# Maestro Pub browser map

The map image in `Assets/Maps/maestro_map.webp` is the optimized copy of the uploaded `maestro_pub_v2(1).zip` map. The Worker loads this image with the original Among Us character walking sprites.

The browser uses 1600×992 dimensions, initial spawn (859,577), and twelve preliminary building-block collision polygons. No multiplayer or lobby.

Cloudflare build/deploy commands: `npm run build` and `npx wrangler deploy`.

Note: the visual map is committed to this repo. The new map is a static background; collisions are approximated and may need refinement after gameplay testing.
