import { API_BASE_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@amy_user';

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
    const userData = await AsyncStorage.getItem(STORAGE_KEY);
    if (!userData) {
      return { wsUrl: baseUrl, authorizationHeader: null };
    }

    const user = JSON.parse(userData);
    const token = user?.accessToken;
    return {
      wsUrl: baseUrl,
      authorizationHeader: token ? `Bearer ${token}` : null,
    };
  } catch (error) {
    console.warn('⚠️ No se pudo preparar token para WebSocket realtime:', error);
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
      console.log('✅ WebSocket ya está conectado');
      return;
    }

    if (this.connectingPromise) {
      console.log('⏳ Conexión WebSocket ya en progreso...');
      return this.connectingPromise;
    }

    const connectionConfig = await buildAuthenticatedWebSocketUrl();
    if (!connectionConfig?.wsUrl) {
      const error = 'No se pudo determinar la URL del WebSocket';
      console.error('❌', error);
      throw new Error(error);
    }

    console.log('🔌 Intentando conectar WebSocket...');
    console.log('📍 URL:', connectionConfig.wsUrl);
    console.log('🔐 Con autenticación:', !!connectionConfig.authorizationHeader);

    this.connectingPromise = new Promise((resolve, reject) => {
      try {
        const socket = new WebSocket(connectionConfig.wsUrl);
        this.socket = socket;
        console.log('🔄 Socket creado, esperando conexión...');

        socket.onopen = () => {
          console.log('🎉 Socket ONOPEN - Conexión establecida!');
          const headers = {
            'accept-version': '1.2,1.1,1.0',
            'heart-beat': '0,0',
          };

          if (connectionConfig.authorizationHeader) {
            headers.Authorization = connectionConfig.authorizationHeader;
            console.log('🔐 Enviando CONNECT con autorización');
          } else {
            console.log('📤 Enviando CONNECT sin autorización');
          }

          socket.send(createFrame('CONNECT', headers));
          console.log('✅ Frame CONNECT enviado');
        };

        socket.onmessage = (event) => {
          console.log('📨 Mensaje recibido del WebSocket');
          this.handleRawMessage(event.data, resolve);
        };

        socket.onerror = (error) => {
          console.error('❌ Socket ONERROR:', error);
          if (!this.connected) {
            console.error('❌ Error durante conexión inicial');
            reject(new Error('No se pudo conectar al canal de tiempo real'));
          }
        };

        socket.onclose = (event) => {
          console.log('🔌 Socket ONCLOSE');
          console.log('   Code:', event.code);
          console.log('   Reason:', event.reason);
          console.log('   Was clean:', event.wasClean);
          this.connected = false;
          this.connectingPromise = null;
          this.notifyConnectionListeners(false);
          if (this.shouldReconnect && this.subscriptions.size > 0) {
            console.log('🔄 Programando reconexión...');
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
    console.log('📦 Raw data recibido, parseando frames...');
    const frames = String(rawData)
      .split('\u0000')
      .map((frame) => frame.trim())
      .filter(Boolean);

    console.log(`📦 Encontrados ${frames.length} frames`);

    for (const rawFrame of frames) {
      const frame = parseFrame(rawFrame + '\u0000');
      if (!frame) {
        console.warn('⚠️ Frame no pudo ser parseado');
        continue;
      }

      console.log('📋 Frame parseado:', frame.command);

      if (frame.command === 'CONNECTED') {
        console.log('🎊 Recibido CONNECTED del servidor!');
        this.connected = true;
        this.connectingPromise = null;
        this.notifyConnectionListeners(true);
        console.log('📡 Estado: CONECTADO ✅');
        this.resubscribeAll();
        if (resolveConnect) {
          resolveConnect();
          console.log('✅ Promise de conexión resuelta');
        }
        continue;
      }

      if (frame.command === 'MESSAGE') {
        console.log('💬 Recibido MESSAGE');
        const subscriptionId = frame.headers.subscription;
        console.log('   Subscription ID:', subscriptionId);
        const subscription = this.subscriptions.get(subscriptionId);
        if (!subscription) {
          console.warn('⚠️ No se encontró suscripción para ID:', subscriptionId);
          continue;
        }

        try {
          const payload = JSON.parse(frame.body);
          console.log('📨 Payload parseado, llamando callback...');
          subscription.callback(payload);
        } catch (error) {
          console.error('❌ Error parseando mensaje realtime de chat:', error);
        }
      }

      if (frame.command === 'ERROR') {
        console.error('❌ Recibido ERROR del servidor:', frame.headers.message || frame.body);
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
      this.ensureConnected().catch((error) => {
        console.warn('⚠️ Reintento realtime chat falló:', error.message);
      });
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
      } catch (error) {
        console.warn('⚠️ Error cerrando WebSocket chat realtime:', error);
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
      } catch (error) {
        console.warn('⚠️ Error notificando estado de conexión realtime:', error);
      }
    }
  }
}

const chatRealtimeService = new ChatRealtimeService();

export default chatRealtimeService;
