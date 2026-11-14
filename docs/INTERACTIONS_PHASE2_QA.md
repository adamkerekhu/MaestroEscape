# Interaction Completion v2 — implementation and acceptance

**Date:** 2026-11-14
**Scope:** MaestroEscape browser/Phaser prototype
**Specification:** `MaestroEscape_Interaction_Completion_Instructions_v2(1).md`

## Root cause

The source of the disabled ordering UI was `src/worker.js`, specifically `NPC_ACTION_UNAVAILABLE` and the `npcOpenDialogue` / `npcChooseAction` handlers. Before this change, there was no item model, inventory, ordering queue, or server-side item state; the existing Worker had only a shared settings Durable Object. The playable Phaser game is a **single-player prototype**. Its movement and scene portals were and remain local browser logic.

## Changed files

- `src/consumables.js`: `ConsumableRoom` Durable Object; typed items, unique IDs, location ownership, capacities, vendor slots, server-validated clocks for ordering and portions, item transfers, table slots, NPC cigarette stock, borrow requests, completion events, player-specific counters, serialized storage transactions and command idempotency.
- `src/consumables-client.js`: Phaser item/remote-player markers, held icons, inventory panel, action buttons, consumption and order progress, mobile E behavior, room-link sharing, polling and command protocol.
- `src/worker.js`: routes `/assets/consumables.js` and `/api/consumables`; import/exports, NPC action enablement and callbacks, nearest-item pickup, table menu, street/scene integrations and round reset.
- `wrangler.toml`: `ITEM_ROOMS` Durable Object binding and SQLite migration `maestro-consumables-v4`.
- `tests/consumables.test.mjs`: actual room state tests (simulated clocks, command calls and mock persistent transaction store).
- `tests/npc-regression.test.mjs`: replace outdated disabled-menu checks with real action plumbing.
- `package.json`: build checks all three JavaScript source modules.

## Gameplay parameters

One central `CONSUMABLE_CONFIG` object defines beer 5 × 1.5s, kebab 4 × 2s, cigarette 4 × 1.5s, pack of 5, beer order 3s, refill 2s, kebab order 5s, pickup radii, carrying slots, bartenders' and vendors' pickup coordinates, deterministic NPC cigarette stock, and four existing pub tables with six slots each.

## Automated acceptance results (PASS / FAIL / BLOCKED)

| Item from spec | Status | Evidence or limitation |
| --- | --- | --- |
| Beer order (3s), actual vendor item | PASS | Mocked Durable Object flow/test clock; early collection item absent |
| Pickup transfers item to inventory | PASS | Test verifies unique item and inventory slot |
| Beer five timed sips → empty glass | PASS | Early completion rejected; five validated timers |
| Refill empty glass and avoid cloning | PASS | Preserves item ID and increments consumption generation; second completion counted |
| Refill requires an empty glass | PASS | Empty and partially full conditions tested |
| Order at least three beers, store on a pub table | PASS | Three orders tested, six table placements supported |
| Kebab five-second order, four two-second bites | PASS | Tested actual world item and completion removal |
| Cigarette pack of five, extracting one | PASS | Tested decrement and actual loose cigarette creation |
| Cigarette lighting, four validated puffs | PASS | Tested unlit rejection, four decrements and disposal |
| NPC cigarette sharing | PASS | Stock and refusal rules tested |
| Two-player cigarette request / accept / refuse / timeout | PASS | Mocked shared room requests with atomic transfer/decline/expiration tests |
| Six table slots, full-slot rejection | PASS | Tested all six and rejection of a seventh placement |
| No item cloning during simultaneous pickup | PASS | Two mock players contest same item, one succeeds |
| Items persist across map changes | PASS | Mock room state preserves player inventory across scene changes |
| Interruption of sip on movement | PASS | Early movement invalidates server-side action, no decrement |
| Combat interruption | BLOCKED | No multiplayer combat authority implemented in this Phaser browser build |
| Per-player completion progress | PASS | Server increments separate beer/kebab/cigarette counters on completed item |
| Existing non-escaper/escaper win/loss roles | BLOCKED | This playable Worker has no game-room roles or win/loss controller |
| Item snapshots on concurrent clients | PASS (mock) | Same state read by multiple session tokens within one Durable Object, no duplicates |
| Full authoritative player movement + disconnect handling | BLOCKED | Player movement remains client-originated. Do not treat as secure multiplayer |
| Browser visuals in four interiors / real mobile screen | BLOCKED (manual) | Phaser integration compiled, but no live browser or physical touch test was run |
| All in-scope NPC actions functional, no disabled placeholder copy | PASS (code) | All specified actions now call server; SPAR's undefined general checkout option removed |
| `npm run build`, unit/regression tests | PASS | GitHub Actions workflow runs Node syntax checks and state-machine tests |

## Shared room model and protocol

The browser generates a private room ID and puts it in `?room=<id>`. Another client using that URL joins the same item room. Each browser tab holds a random session token. The Cloudflare Worker routes requests to `ITEM_ROOMS.idFromName("maestroescape:"+room)`. Commands are serialized in `ctx.storage.transaction`, with idempotent `commandId`, server clock and item revision checks. Clients GET snapshots about every 1.4 seconds; they see the same room items and can exchange cigarettes by explicit Accept/Refuse.

Commands implemented: `syncPosition`, `orderBeer`, `refillBeer`, `orderKebab`, `buyPack`, `collectItem`, `equip`, `drop`, `placeOnTable`, `extractCigarette`, `light`, `startConsumeUnit`, `cancelConsume`, `completeConsumeUnit`, `npcBorrow`, `borrowRequest`, `borrowResponse`, `resetRound`.

## Real limitations and dependencies

1. **Not a secure fully authoritative multiplayer match.** Item mutations, inventory and timers are server-owned. Player position and scene changes are still reports from the existing single-player browser movement engine; the new endpoint checks reported proximity but cannot independently verify walks or fights. This limitation must be resolved when genuine shared movement/roles are introduced.
2. **No role-specific match win/loss integration** was possible without inventing a new game mode: the existing Worker had none. Completion events and per-player counters are now available for the eventual controller.
3. **No purchases priced in currency.** Beer, gyros, cigarettes and refills are free, as requested when no economy exists. SPAR's undefined checkout action was removed rather than inventing a shop economy.
4. **Admin/API access security:** Item room IDs and possession of player session token are bearer identifiers; production matchmaking/authentication and abuse controls are not implemented.
5. **Live release verification:** Actual production Worker availability, real mobile gestures, and concurrent remote clients require testing in browser. Static compilation and mocked Durable Object tests do not demonstrate deployment.
6. Existing NPC asset work, vehicle mechanics, map assets, movement, collision geometry and prior backup branch are retained.

## Manual browser checks after deploy

Open Maestro Pub, press E near bartender → Order beer → wait 3s → press E over beer → Inventory → Drink five times → return empty glass for refill. In pub, place three different beers on table; check six slots fill and seventh rejects. Go to Gyros and Tobacco shops for food/pack mechanics. Open the same `?room=` URL on a second browser and test nearby-player request/approval. Confirm live map transitions, mobile joystick and E, item visual layering and Cloudflare `ITEM_ROOMS` binding availability.
