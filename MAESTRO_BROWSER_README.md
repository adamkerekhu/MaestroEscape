# MaestroEscape — browser multiplayer prototype

Phaser 3 browser game + Cloudflare Worker and Durable Objects WebSocket rooms. Original Python/Pygame source preserved in the repository as reference.

## Local preview

```bash
npx wrangler dev
```

Open the printed localhost URL in two browser windows, join the same room, and start the round as host.

## Deploy (overwrites the existing named Cloudflare Worker)

```bash
npx wrangler login
npx wrangler deploy
```

The Worker name is intentionally `kulturalisdigitalispolgarikor` as requested. Deploying replaces that Worker's code and routes; make a backup if it contains anything important. Worker custom domains/routes already attached to that Worker are managed in Cloudflare settings.

The Worker serves the whole app and real-time multiplayer. No database, API keys, Render server or Socket.io server are needed. Phaser is fetched from a public CDN.

## Game rules (first prototype)

- Two or more participants in one room, one randomly chosen Escaper.
- Escaper must find jacket at cloakroom, then leave using car, taxi, or Bubi. Car requires keys; taxi takes 8 seconds; bike takes 4 seconds.
- Hunters can punch at close range (3 hits win), or sabotage car/taxi/bike for 15 seconds with a 22-second cooldown.
- Hunters also win after six minutes.
- E to interact, Space to punch, WASD to move.

## Limitations

Early playable prototype: NPCs are decorative; match state is memory-only, and page refresh creates a new player identity. Room codes are not private or authenticated. The art is placeholder geometry and no copied Among Us artwork is served.
