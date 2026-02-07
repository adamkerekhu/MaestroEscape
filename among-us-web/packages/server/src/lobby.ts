import { DurableObject } from 'cloudflare:workers';
import type { GamePhase } from '@among-us/shared';
import { GAME_CONFIG } from '@among-us/shared';

interface RoomInfo {
  id: string;
  name: string;
  playerCount: number;
  maxPlayers: number;
  phase: GamePhase;
  createdAt: number;
}

export interface Env {
  GAME_ROOM: DurableObjectNamespace;
  LOBBY: DurableObjectNamespace;
}

export class LobbyManager extends DurableObject<Env> {
  private rooms: Map<string, RoomInfo> = new Map();

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'GET' && url.pathname === '/api/rooms') {
      this.cleanupEmptyRooms();
      const roomList = Array.from(this.rooms.values());
      return new Response(JSON.stringify(roomList), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (request.method === 'POST' && url.pathname === '/api/rooms') {
      let body: { name?: string; maxPlayers?: number };
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const roomId = crypto.randomUUID();
      const room: RoomInfo = {
        id: roomId,
        name: body.name || `Room ${this.rooms.size + 1}`,
        playerCount: 0,
        maxPlayers: body.maxPlayers || GAME_CONFIG.MAX_PLAYERS,
        phase: 'lobby',
        createdAt: Date.now(),
      };

      this.rooms.set(roomId, room);

      return new Response(JSON.stringify({ roomId, room }), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Internal: update room info (called by GameRoom)
    if (request.method === 'PUT' && url.pathname === '/api/rooms/update') {
      let body: { roomId: string; playerCount: number; phase: GamePhase };
      try {
        body = await request.json();
      } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const room = this.rooms.get(body.roomId);
      if (room) {
        room.playerCount = body.playerCount;
        room.phase = body.phase;
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Internal: delete room
    if (request.method === 'DELETE') {
      const match = url.pathname.match(/^\/api\/rooms\/([^/]+)$/);
      if (match) {
        this.rooms.delete(match[1]);
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    return new Response('Method not allowed', { status: 405 });
  }

  private cleanupEmptyRooms(): void {
    const now = Date.now();
    const staleThreshold = 5 * 60 * 1000; // 5 minutes
    for (const [id, room] of this.rooms) {
      if (
        room.playerCount === 0 &&
        now - room.createdAt > staleThreshold
      ) {
        this.rooms.delete(id);
      }
    }
  }
}
