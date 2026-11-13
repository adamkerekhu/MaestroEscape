# NPC Step 5 — Integration QA and stabilization

Date: 2026-11-13
Project: MaestroEscape (Phaser 3.90.0, Cloudflare Worker)

## Scope and architecture

The live browser prototype uses one Phaser scene named `Explore`; the four interior identifiers are `pub`, `spar`, `dohanybolt` and `gyros`. The nine NPC sprite sheets reside in `Assets/NPCs/<stable_id>.webp`, each 192x240 px with 4 directions x 4 frames of 48x60 px. Scene-local render objects are created once and shown/hidden on scene transitions. Deterministic movement uses hand-authored waypoint coordinates and existing interior collision rectangles. There is **no multiplayer state authority** in this browser prototype.

The settings editor at `/settings` uses the existing `/api/settings` endpoint and the `GameSettings` Cloudflare Durable Object, under storage key `settings`, with a `revision` version. NPC fields are `npc.<id>.<field>`; saved placements are consumed by the game via `npcRefreshSettings()`. No new database or game networking stack was added.

## Stabilization fixes

1. Reduced NPC floor-footprint collision radius from 9 to 7 px. This permits the SPAR cashier to stand in the gap next to the cashier station without clipping a static obstacle.
2. Added counter-side service interaction positions for bartender, SPAR cashier, tobacco cashier and gyros employee. The bartender was previously too far behind the bar to reach with the original 108 px E radius.
3. Added NPC/player-foot collision detection for interiors while allowing an already-overlapping player to move away. Civilian patrols already check walls, the player and other NPCs.
4. Stopped hidden NPC animations when leaving interiors, kept the mobile E touch control above open dialogue menus, and close a stale dialogue if shared NPC placement settings are updated remotely.
5. Avoided resetting all NPC patrol positions when unrelated vehicle or camera settings change.

## Checks executed

- PASS: All nine stable NPC IDs, counts by interior (4/3/1/1), correct worker/civilian totals (4/5), and no-duplicate guard.
- PASS: All nine sprite assets present; inspected source assets are 192x240 px.
- PASS: All nine default feet positions and all 4 waypoint line segments per NPC pass the existing collision rectangles with NPC footprint radius 7 px.
- PASS: All four counter service points are on accessible customer-side floors, based on the current collision rectangles.
- PASS: All 153 NPC configuration fields have valid defaults and per-field bounds.
- PASS: Worker JavaScript, Phaser inline script and Settings inline script parse.
- PASS: Simulated `GameSettings` Durable Object GET/PUT, readback from another instance, revision conflict 409, invalid update 400, and protection of persisted coordinates after rejected writes.
- PASS: Static controls and interaction wiring for keyboard E, mobile E, Escape/Close, disabled unimplemented actions and scene show/hide.

These checks were performed by source inspection and JavaScript harness/mocked Durable Object. They are **not a substitute for live Cloudflare/mobile interaction testing**.

## Automated regression suite

Run `npm run check` to perform `node --check` and the eight Node built-in tests in `tests/npc-regression.test.mjs`. A GitHub Actions workflow, `.github/workflows/npc-regression.yml`, runs the same command on pushes and pull requests to `main`. Confirmed GitHub Actions run 43476292369 for commit 02042071: all eight regression tests passed, zero failed. Logs: https://github.com/adamkerekhu/MaestroEscape/actions/runs/43476292369

## Manual acceptance tests still required

- Desktop: enter/exit Maestro Pub, SPAR, Dohánybolt and Mester Gyros repeatedly; confirm 4/3/1/1 NPCs, no duplicates, and no NPCs visible outdoors.
- Walk around all staff counters, seats, aisles and doorway edges; confirm visual depth, collisions and no soft-locks with configured NPC coordinates.
- Wait at least one patrol cycle in the pub and SPAR; verify all paths are visually acceptable and not blocked by decorative elements absent from collision geometry.
- Test talk and Close/E/Escape next to every NPC, including bartender from customer side and near a building exit.
- Rotate a real touch device to landscape; verify joystick, E to open/close, menu buttons, and safe-area clipping.
- On desktop, change NPC placement/scale/visibility/facing/waypoints; save, reload the Settings page and the game, then verify identical values on another desktop and mobile.
- Verify shared storage behavior on production Cloudflare with concurrent editors and a revision conflict.
- Test existing cars, three bikes, rider pedalling, tram, collision, entrances, and camera settings after deployment.

## Explicitly out of scope / missing prerequisites

- Beer, cigarette, shop and kebab actions are **disabled stubs** until inventory, ordering, stock, payment and consumable logic exists. No item is granted and no task is marked completed by talking.
- Multiplayer concurrency, room authority, stock serialization, and cross-player NPC state synchronization **cannot be validated** because this Phaser browser prototype currently operates in single-player mode.
- The current global Settings page and `/api/settings` endpoint **do not have admin authentication**. Restrict these before exposing editing to untrusted users.
- In-browser pixel-perfect rendering, Cloudflare deployment state, live phones and live cross-device storage have **not** been independently verified in this pass.

## Rollback

Previous unaffected backup branch: `backup/pre-major-changes-2026-11-13`. The backup predates the NPC work and is preserved.
