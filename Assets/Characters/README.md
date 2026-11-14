# MaestroEscape playable character sprites

The multiplayer lobby offers exactly four distinct slots:
- `maestro`: existing `maestro_walk.webp`
- `casual`: `casual_walk.webp`
- `suit`: `suit_walk.webp`
- `muscular`: `muscular_walk.webp`

**Sprite format**: Each file is a WebP spritesheet, **640 × 480 px**, with **8 columns × 4 rows** of **80 × 120 px** frames. Rows, from top to bottom: **walk down (front), walk up (back), walk right, walk left**. Keep backgrounds transparent. The asset names and frame format are consumed by Phaser in `src/worker.js` and by the character lobby in `src/consumables-client.js`. All players see the sprite selected by a player; no per-player tint replacements are necessary.

To activate uploaded custom characters, put the three WebP files directly in this folder with exactly the filenames above. The Cloudflare Worker proxies `/assets/characters/<id>_walk.webp` to this repository. The menu intentionally disables a character while its sprite has not been uploaded so it never misrepresents an unavailable image as ready.

Changing only the artwork (keeping sheet format and stable filenames) will not require a gameplay or backend code change.

**Current status**: The three prepared image files were generated outside GitHub. Their repository upload must be completed before these slots can be selected in the deployed game.
