import type { ClientMessage, ServerMessage } from '@among-us/shared';

type MessageHandler<T extends ServerMessage> = (msg: T) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private messageHandlers = new Map<string, Set<Function>>();
  private _connected = false;

  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);
      } catch (err) {
        reject(err);
        return;
      }

      this.ws.onopen = () => {
        this._connected = true;
        resolve();
      };

      this.ws.onerror = (ev) => {
        if (!this._connected) {
          reject(new Error('WebSocket connection failed'));
        }
      };

      this.ws.onclose = () => {
        this._connected = false;
      };

      this.ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data as string) as ServerMessage;
          const handlers = this.messageHandlers.get(msg.type);
          if (handlers) {
            for (const handler of handlers) {
              handler(msg);
            }
          }
        } catch {
          // Ignore malformed messages
        }
      };
    });
  }

  send(message: ClientMessage): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(JSON.stringify(message));
  }

  on<T extends ServerMessage['type']>(
    type: T,
    handler: MessageHandler<Extract<ServerMessage, { type: T }>>,
  ): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, new Set());
    }
    this.messageHandlers.get(type)!.add(handler);
  }

  off<T extends ServerMessage['type']>(
    type: T,
    handler: MessageHandler<Extract<ServerMessage, { type: T }>>,
  ): void {
    this.messageHandlers.get(type)?.delete(handler);
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this._connected = false;
    this.messageHandlers.clear();
  }

  get isConnected(): boolean {
    return this._connected && this.ws?.readyState === WebSocket.OPEN;
  }
}
