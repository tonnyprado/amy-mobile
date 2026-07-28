import { API_BASE_URL } from '../config/api';
import { getToken } from '../utils/secureStorage';

function buildWebSocketUrl() {
  if (!API_BASE_URL) {
    return null;
  }

  if (API_BASE_URL.startsWith('https://')) {
    return `${API_BASE_URL.replace('https://', 'wss://')}/ws`;
  }

  if (API_BASE_URL.startsWith('http://')) {
    return `${API_BASE_URL.replace('http://', 'ws://')}/ws`;
  }

  return null;
}

async function buildAuthenticatedWebSocketUrl() {
  const baseUrl = buildWebSocketUrl();
  if (!baseUrl) {
    return null;
  }

  try {
    const token = await getToken();
    return {
      wsUrl: baseUrl,
      authorizationHeader: token ? `Bearer ${token}` : null,
    };
  } catch (error) {
    if (__DEV__) {
      console.warn('No se pudo preparar token para WebSocket realtime:', error);
    }
    return { wsUrl: baseUrl, authorizationHeader: null };
  }
}

function createFrame(command, headers = {}, body = '') {
  const headerLines = Object.entries(headers).map(([key, value]) => `${key}:${value}`);
  return `${command}\n${headerLines.join('\n')}\n\n${body}\u0000`;
}

function parseFrame(rawFrame) {
  const normalizedFrame = rawFrame.replace(/\r/g, '');
  const separatorIndex = normalizedFrame.indexOf('\n\n');

  if (separatorIndex === -1) {
    return null;
  }

  const headerPart = normalizedFrame.slice(0, separatorIndex);
  const bodyPart = normalizedFrame.slice(separatorIndex + 2).replace(/\u0000$/, '');
  const lines = headerPart.split('\n');
  const command = lines.shift();
  const headers = {};

  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex <= 0) continue;
    const key = line.slice(0, colonIndex);
    const value = line.slice(colonIndex + 1);
    headers[key] = value;
  }

  return {
    command,
    headers,
    body: bodyPart,
  };
}

class ChatRealtimeService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.connectingPromise = null;
    this.subscriptions = new Map();
    this.reconnectTimer = null;
    this.shouldReconnect = true;
    this.connectionListeners = new Set();
  }

  async ensureConnected() {
    if (this.connected && this.socket) {
      return;
    }

    if (this.connectingPromise) {
      return this.connectingPromise;
    }

    const connectionConfig = await buildAuthenticatedWebSocketUrl();
    if (!connectionConfig?.wsUrl) {
      throw new Error('No se pudo determinar la URL del WebSocket');
    }

    this.connectingPromise = new Promise((resolve, reject) => {
      try {
        const socket = new WebSocket(connectionConfig.wsUrl);
        this.socket = socket;

        socket.onopen = () => {
          const headers = {
            'accept-version': '1.2,1.1,1.0',
            'heart-beat': '0,0',
          };

          if (connectionConfig.authorizationHeader) {
            headers.Authorization = connectionConfig.authorizationHeader;
          }

          socket.send(createFrame('CONNECT', headers));
        };

        socket.onmessage = (event) => {
          this.handleRawMessage(event.data, resolve);
        };

        socket.onerror = () => {
          if (!this.connected) {
            reject(new Error('No se pudo conectar al canal de tiempo real'));
          }
        };

        socket.onclose = () => {
          this.connected = false;
          this.connectingPromise = null;
          this.notifyConnectionListeners(false);
          if (this.shouldReconnect && this.subscriptions.size > 0) {
            this.scheduleReconnect();
          }
        };
      } catch (error) {
        this.connectingPromise = null;
        reject(error);
      }
    });

    return this.connectingPromise;
  }

  handleRawMessage(rawData, resolveConnect) {
    const frames = String(rawData)
      .split('\u0000')
      .map((frame) => frame.trim())
      .filter(Boolean);

    for (const rawFrame of frames) {
      const frame = parseFrame(rawFrame + '\u0000');
      if (!frame) {
        continue;
      }

      if (frame.command === 'CONNECTED') {
        this.connected = true;
        this.connectingPromise = null;
        this.notifyConnectionListeners(true);
        this.resubscribeAll();
        if (resolveConnect) {
          resolveConnect();
        }
        continue;
      }

      if (frame.command === 'MESSAGE') {
        const subscriptionId = frame.headers.subscription;
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) {
          continue;
        }

        try {
          const payload = JSON.parse(frame.body);
          subscription.callback(payload);
        } catch (error) {
          if (__DEV__) {
            console.error('Error parseando mensaje realtime:', error);
          }
        }
      }

      if (frame.command === 'ERROR' && __DEV__) {
        console.error('WebSocket ERROR:', frame.headers.message || frame.body);
      }
    }
  }

  async subscribe(destination, callback) {
    await this.ensureConnected();

    const subscriptionId = `sub-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.subscriptions.set(subscriptionId, { destination, callback });

    if (this.connected && this.socket) {
      this.socket.send(createFrame('SUBSCRIBE', {
        id: subscriptionId,
        destination,
      }));
    }

    return subscriptionId;
  }

  unsubscribe(subscriptionId) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return;
    }

    if (this.connected && this.socket) {
      this.socket.send(createFrame('UNSUBSCRIBE', { id: subscriptionId }));
    }

    this.subscriptions.delete(subscriptionId);

    // NO desconectar automáticamente - mantener la conexión viva para otras suscripciones
    // if (this.subscriptions.size === 0) {
    //   this.disconnect();
    // }
  }

  resubscribeAll() {
    if (!this.connected || !this.socket) {
      return;
    }

    for (const [subscriptionId, subscription] of this.subscriptions.entries()) {
      this.socket.send(createFrame('SUBSCRIBE', {
        id: subscriptionId,
        destination: subscription.destination,
      }));
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) {
      return;
    }

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.ensureConnected().catch(() => {});
    }, 2500);
  }

  disconnect() {
    this.shouldReconnect = false;

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.socket) {
      try {
        this.socket.close();
      } catch {
        // Ignore close errors
      }
    }

    this.socket = null;
    this.connected = false;
    this.connectingPromise = null;
    this.notifyConnectionListeners(false);
    this.shouldReconnect = true;
  }

  isConnected() {
    return this.connected;
  }

  addConnectionListener(listener) {
    this.connectionListeners.add(listener);
    listener(this.connected);

    return () => {
      this.connectionListeners.delete(listener);
    };
  }

  notifyConnectionListeners(isConnected) {
    for (const listener of this.connectionListeners) {
      try {
        listener(isConnected);
      } catch {
        // Ignore listener errors
      }
    }
  }
}

const chatRealtimeService = new ChatRealtimeService();

export default chatRealtimeService;
