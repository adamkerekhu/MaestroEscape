export { GameRoom } from './game-room';
export { LobbyManager } from './lobby';

interface Env {
  GAME_ROOM: DurableObjectNamespace;
  LOBBY: DurableObjectNamespace;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // GET /api/rooms - list rooms
    if (path === '/api/rooms' && request.method === 'GET') {
      const id = env.LOBBY.idFromName('lobby');
      const lobby = env.LOBBY.get(id);
      return lobby.fetch(request);
    }

    // POST /api/rooms - create room
    if (path === '/api/rooms' && request.method === 'POST') {
      const id = env.LOBBY.idFromName('lobby');
      const lobby = env.LOBBY.get(id);
      return lobby.fetch(request);
    }

    // GET /api/rooms/:roomId/ws - WebSocket connection to game room
    const wsMatch = path.match(/^\/api\/rooms\/([^/]+)\/ws$/);
    if (wsMatch && request.method === 'GET') {
      const roomId = wsMatch[1];
      const id = env.GAME_ROOM.idFromName(roomId);
      const room = env.GAME_ROOM.get(id);
      const wsUrl = new URL('/ws', request.url);
      return room.fetch(new Request(wsUrl.toString(), request));
    }

    // Fallback - let assets handler deal with it (or 404)
    return new Response('Not found', { status: 404 });
  },
};
