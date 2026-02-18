type SubscriptionHandlers<TMessage> = {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onMessage: (payload: TMessage) => void;
};

type CableEnvelope<TMessage> = {
  type?: string;
  message?: TMessage;
  identifier?: string;
};

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api/v1';

function cableUrl(token: string): string {
  const origin = API_BASE_URL.replace(/\/api\/v1\/?$/, '');
  const wsOrigin = origin.replace(/^http/, 'ws');
  return `${wsOrigin}/cable?token=${encodeURIComponent(token)}`;
}

export class ActionCableSubscription<TMessage> {
  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private shouldReconnect = true;
  private readonly identifier: string;

  constructor(
    private readonly token: string,
    identifierObject: Record<string, unknown>,
    private readonly handlers: SubscriptionHandlers<TMessage>
  ) {
    this.identifier = JSON.stringify(identifierObject);
  }

  connect() {
    this.socket = new WebSocket(cableUrl(this.token));

    this.socket.onmessage = (event) => {
      const payload = JSON.parse(event.data) as CableEnvelope<TMessage>;
      if (payload.type === 'welcome') {
        this.send({
          command: 'subscribe',
          identifier: this.identifier
        });
        return;
      }

      if (payload.type === 'confirm_subscription') {
        this.handlers.onConnected?.();
        return;
      }

      if (payload.type === 'ping') {
        return;
      }

      if (payload.message) {
        this.handlers.onMessage(payload.message);
      }
    };

    this.socket.onclose = () => {
      this.handlers.onDisconnected?.();
      if (!this.shouldReconnect) return;

      this.reconnectTimer = window.setTimeout(() => {
        this.connect();
      }, 1000);
    };
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      window.clearTimeout(this.reconnectTimer);
    }
    this.socket?.close();
    this.socket = null;
  }

  private send(payload: Record<string, unknown>) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(payload));
    }
  }
}
