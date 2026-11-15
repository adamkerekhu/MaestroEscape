# Underground Casino · MaestroEscape

The underground casino is a separate playable Phaser 3 room entered through a configurable street manhole. The uploaded map ZIP is the source of truth: its `gameplay_geometry.json` contains collision rectangles, 8 hotspots, the ladder exit and player spawn.

## Game behavior
- On Mester utca, use **E** or mobile E at the enabled street manhole.
- Scene switches to the casino (`1696 × 960`) and places the player at the configurable spawn near the ladder (default **808, 301**).
- Walk to the upper ladder and press **E** to return to the original street position. Default ladder trigger is at **818, 275**.
- Collision uses the authored 16 wall/furniture rectangles.
- The casino contains eight non-wagering interaction prompts: a bar, blackjack, roulette and five slot machines. These are placeholders, not playable minigames and do not handle payments or real gambling.
- Cars and street NPCs do not spawn inside the casino. Player inventory can track the `casino` scene.

## Place the entrance
1. Open **Settings → Doors and stairs · E interaction points**.
2. Select the **Mester utca** scene, then **Enter Casino · Manhole**.
3. Drag its point onto the intended street location. Adjust activation radius if necessary.
4. Check **Enable street manhole**, then save.
5. Choose **Underground Casino** and drag the **Casino ladder · Return to Street** interaction point to align with the illustrated ladder.
6. Open **Settings → Map transitions · Drag player arrival points**, select **Street → Underground Casino**, position the player spawn and save.

`building.casino.zoom` and `building.casino.scale` also exist in Settings.

**Important:** The manhole starts disabled until its street position is chosen to avoid placing it arbitrarily into an unrelated building or road. As in the rest of the current single-player game, these settings are browser-local.

## Files
- `Assets/Maps/maestro_casino.webp` · published optimized map artwork.
- `src/casino-map.js` · scene dimensions, authored collisions and interaction hotspots.
- `src/worker.js` · game scene, E interactions, street manhole hatch, camera, transitions and the image proxy.
- `src/interaction-editor.js` · manhole enable/position and casino exit marker.
- `src/transition-editor.js` · casino entry spawn editor.
- `src/consumables.js` and `src/local-room-source.js` · single-player room position support.
- `tests/casino-map.test.mjs` · geometry, interaction, scene registration and committed image assertions.

## Asset quality
The game currently ships an intentionally compact **480 × 270 WebP** rendition of the supplied original **1672 × 941** map, displayed at the scene's authored 1696 × 960 coordinate dimensions. The original detail is preserved in the user's ZIP. Replacing `Assets/Maps/maestro_casino.webp` with a higher resolution WebP improves visual quality without changing coordinates or gameplay code. This is only a resolution tradeoff, not a change to the map layout.

## Manual acceptance checklist
- Deploy latest `main` to Cloudflare; verify `/assets/casino.webp` returns image/webp.
- Enable and drag the street manhole; confirm it appears and E opens the casino.
- Verify the player appears on the walkable floor at the configured arrival point.
- Walk around blackjack, roulette, bar and slot machines; check furniture collisions.
- Drag the upper ladder marker and verify E returns to exactly the original street position.
- Confirm pub stairs, basement, SPAR, inventory, drunk mode, mobile E and vehicle interactions are unaffected.

This documentation does not claim that Cloudflare has been deployed or that in-browser gameplay was manually verified.
