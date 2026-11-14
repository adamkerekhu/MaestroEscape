# MaestroEscape shared multiplayer vehicles

**Implemented:** Shared vehicle world state per multiplayer room, with exclusive driver and passenger seats.

## Gameplay

- Cars: Skoda Superb 2.0TDI and Octavia Checkengine, **1 driver + 3 passengers each**.
- Bubi bikes: 3 independent bikes, **1 rider only**.
- Approach a vehicle and press **E** (or mobile **E**); choose Driver or a vacant Passenger seat.
- Only the player occupying seat 0 may control movement; passengers move with the same vehicle and their camera follows it.
- All connected players in the same room see the shared position, heading, speed and occupied-seat count.
- A remote bike with a rider uses the rider+bike sprite.
- Press E again to exit. Exit requires a stopped vehicle and a safe nearby destination according to the current street collision map. Vehicle movement remains blocked by the existing Phaser collision geometry for the driver.
- Seats are released after disconnected players have been inactive for 5 seconds; cars stay where the last driver left them.
- Changing characters releases the existing seat.

## Architecture

`src/consumables.js` stores vehicle state in the existing `ConsumableRoom` Durable Object (one instance per `?room=<room_id>`), including coordinates, heading, speed, seat IDs and revision. It serializes `boardVehicle`, `leaveVehicle` and `driveVehicle` operations. The server rejects occupied seats, passengers attempting to drive, out-of-range boarding, implausible movement jumps and exiting a moving vehicle.

`src/consumables-client.js` sends driver updates roughly every 100 ms alongside existing multiplayer snapshots. `src/worker.js` renders the synchronized cars/bikes and interpolates remote movement with a frame-rate-independent blend. Driver physics and collision remain in Phaser, but passenger coordinates are derived from the room's shared vehicle. Players seated inside vehicles do not appear as separate walking sprites.

Fresh rooms load initial vehicle spawn positions and rotation from the existing shared `SETTINGS_STORE` Durable Object. Previously created rooms missing a vehicle state are migrated using the same settings. After room creation, vehicle positions come from the shared room state rather than the settings-page refresh.

## Validated

The automated `npm run check` suite covers: shared vehicle visibility, seat contention, multiple occupants in one car, passenger driving rejection, bikes with one seat, driver disconnect cleanup, saved settings migration, stop-before-exit, and safe dismount coordinates.

## Limitations

- **Live multiplayer and mobile browser testing is still necessary.** Automated tests exercise room state and syntax; they do not certify full real-time on-device driving.
- Vehicle movement is checked for ownership, speed bounds and implausible jumps on the server, but the server does not independently reproduce the city collision polygons or simulate physics. As in the existing prototype, the controlling browser computes physics. This is not yet cheat-resistant competitive multiplayer.
- Passengers currently ride inside the car without separately drawn heads. The car's occupancy label shows how many seats are taken.
- The current vehicle movement refresh is polling-based. If lower latency is required for more players, a WebSocket-based synchronization transport would be the next improvement.

Backup branches were not modified.
