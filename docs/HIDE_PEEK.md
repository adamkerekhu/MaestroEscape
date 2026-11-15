# MaestroEscape Hide & Peek implementation

## Player controls
- On foot, walk to an enabled hide point until **E · Hide** appears, then press **E** (desktop) or the existing **E** touch button (mobile).
- A 200 ms crouch/slide moves the character to a collision-reachable tuck position; a Phaser geometry mask reveals a tiny head/face sliver (default 7% vertical visibility).
- **E · Exit hiding** emerges and returns to the original walkable approach. Movement and driving are locked while entering, hidden, or exiting.
- Room transitions, death/respawn, Phaser scene shutdown, and disabling hiding reset the mask and hidden flags.

## Current known points
Enabled, preconfigured from existing pub furniture/collision coordinates:
- Window table (`pub_left`), central table (`pub_middle`), side table (`pub_right`), upper table (`pub_upper`).

Created but **disabled until manually positioned** (no reliable furniture/tree coordinates in existing game geometry):
- Pub bar (`pub_bar`).
- Three basement tables (`basement_table_1..3`).
- Three outdoor trees (`street_tree_1..3`).

The editor must be used to position those spots and check they're accessible. Do not claim these spots function out-of-the-box. Additional points can be defined in `HIDE_POINT_DEFS` in `src/hide-peek.js`, then registered with the settings schema.

## Settings / editing
Open **Settings → Hide & Peek · Draggable hiding points**:
1. Select Street, Pub, or Basement and the hide point.
2. Drag **Hide interaction** (gold marker) to the accessible side of the tree/table/bar.
3. Drag **Hidden position** (pink marker) to the intended tuck location. The character must be able to walk from the interaction spot to the tuck position without crossing solid geometry. Entry radius must cover the route.
4. Drag **Fallback exit** (blue marker) to an accessible location near the approach (only used if the original approach becomes blocked).
5. Adjust the peek side, enabled switch, interaction radius, and preview.
6. Click **Save hide positions**. Single-player settings use the same browser-local storage as other game settings.

General settings: enable hiding, default radius, percent revealed (3–15%; 7% default), entry/exit duration (100–500 ms; 200 default), prompt visibility.

## Safety and interaction
- Uses the existing Phaser E handler, NPC prompt, and movement update; no duplicate global E listener.
- Prioritizes leaving hiding above every other E action. Existing pickup/stair/NPC interactions retain their normal priority.
- Cannot enter a hide point in a vehicle, during consumable interaction, scratch ticket or pub ordering, while not spawned, or when the route is obstructed.
- Hiding is cosmetic occlusion and movement lock, not invulnerability or a new AI stealth system. Player remains in the same room and is exposed as `player.isHidden` and `player.visibilityFactor`.

## Files
- `src/hide-peek.js`: point definitions, state machine, Phaser geometry-mask rendering, collision path safety.
- `src/hide-editor.js`: editor HTML/CSS/JavaScript.
- `src/worker.js`: settings integration, existing E controls, prompts, per-frame update and cleanup.
- `tests/hide-peek.test.mjs`: state and integration checks.
- `package.json`: syntax validation.

## Manual acceptance steps
1. Choose a character, walk near an enabled pub table and press E; character slides in and only a small peek remains.
2. Try WASD and the mobile joystick while hidden: no movement. Press E to emerge.
3. Test a blocked route (an opposing table edge): hiding should be refused, never clip through the table.
4. Enter pub basement, position and enable a basement table in Settings, return and test E there.
5. Position and enable one outdoor tree and bar point; test their visibility and peek side.
6. Verify inventory, beer celebration/drunk mode, NPC, vehicles, stairs, scratching, and Stripe UI remain usable outside hiding.
7. Save Settings, reload, check persistence and mobile portrait-forced landscape E control.
