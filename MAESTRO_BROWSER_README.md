# MaestroEscape — browser multiplayer prototype

Phaser 3 browser game + Cloudflare Worker with Durable Objects WebSocket rooms. Original Python/Pygame source retained as reference.

## Local preview

```bash
npx wrangler dev
```

Open the localhost URL in two browser windows, join the same room and start as host.

## Deploy to the dedicated Cloudflare Worker

```bash
npx wrangler login
npx wrangler deploy
```

The Worker is named `maestroescape`. Deployment updates that Worker, not `kulturalisdigitalispolgarikor`. You can also connect the `adamkerekhu/MaestroEscape` repository in the Cloudflare Worker dashboard using the build command `npx wrangler deploy` if supported by its Git integration.

Cloudflare Durable Objects are required for multiplayer. The Worker serves both game HTML and WebSockets; no external multiplayer server or database is needed. Phaser loads from a CDN.

## Game rules

- Two or more players in one room, one secretly selected Escaper.
- Escaper gets a jacket and leaves via car, taxi, or Bubi; car requires keys.
- Taxi has an 8-second wait; Bubi unlocks in roughly 4 seconds.
- Hunters punch in close range (3 hits win), or sabotage car/taxi/bike for 15 seconds with a cooldown.
- Hunters win after 6 minutes.
- WASD movement, E interaction, Space punch.

## Prototype limitations

NPCs are decorative; game state is in memory and refresh creates a new player. Basic collision shapes, placeholder graphics, no copied Among Us artwork. This is an initial prototype and requires live multiplayer testing.
