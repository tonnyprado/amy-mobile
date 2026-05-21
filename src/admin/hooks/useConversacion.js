/**
 * useConversacion - Hook para manejar una conversación de chat
 * Conecta con API y WebSocket para mensajes en tiempo real
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  crearORecuperarConversacionDirecta,
  obtenerMensajesConversacion,
  enviarMensajeChat,
  marcarConversacionLeida
} from '../../services/chatApi';
import chatRealtimeService from '../../services/chatRealtimeService';
import { ADMIN_MESSAGES } from '../data'; // Fallback data

export default function useConversacion(repartidorUserId) {
  const [conversacionId, setConversacionId] = useState(null);
  const [mensajes, setMensajes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState(null);
  const subscriptionIdRef = useRef(null);

  // Cargar o crear conversación
  useEffect(() => {
    const inicializarConversacion = async () => {
      try {
        setCargando(true);
        setError(null);

        console.log('🔄 Creando/recuperando conversación con usuario:', repartidorUserId);

        // Crear o recuperar conversación
        const conversacion = await crearORecuperarConversacionDirecta(repartidorUserId);
        setConversacionId(conversacion.id);

        console.log('✅ Conversación obtenida:', conversacion.id);

        // Cargar mensajes
        const mensajesData = await obtenerMensajesConversacion(conversacion.id);

        // Transformar mensajes al formato usado por MessageBubble
        const mensajesTransformados = transformarMensajes(mensajesData);
        setMensajes(mensajesTransformados);

        // Marcar como leída
        await marcarConversacionLeida(conversacion.id).catch(err => {
          console.warn('⚠️ No se pudo marcar como leída:', err);
        });

        console.log(`✅ ${mensajesData.length} mensajes cargados desde API`);
      } catch (err) {
        console.warn('⚠️ Error inicializando conversación desde API, usando datos demo:', err.message);

        // Usar datos demo como fallback
        const repartidorId = `r${repartidorUserId}`;
        const mensajesDemo = (ADMIN_MESSAGES[repartidorId] || [
          { kind: 'system', text: 'Chat iniciado', time: '08:00' }
        ]).map((msg, index) => ({
          ...msg,
          id: msg.id || `demo-msg-${index}`
        }));
        setMensajes(mensajesDemo);
        setConversacionId(`demo-${repartidorUserId}`);

        console.log(`✅ ${mensajesDemo.length} mensajes demo cargados`);
      } finally {
        setCargando(false);
      }
    };

    if (repartidorUserId) {
      inicializarConversacion();
    }
  }, [repartidorUserId]);

  // Suscribirse a mensajes en tiempo real
  useEffect(() => {
    if (!conversacionId || String(conversacionId).startsWith('demo-')) return;

    const suscribirse = async () => {
      try {
        console.log('🔌 Suscribiéndose a mensajes de conversación:', conversacionId);

        const subId = await chatRealtimeService.subscribe(
          `/user/queue/messages`,
          (mensaje) => {
            console.log('📨 Nuevo mensaje recibido en conversación:', mensaje);

            // Solo agregar si es de esta conversación
            if (mensaje.conversationId === conversacionId) {
              const mensajeTransformado = transformarMensaje(mensaje);
              setMensajes(prev => [...prev, mensajeTransformado]);

              // Marcar como leída
              marcarConversacionLeida(conversacionId).catch(err => {
                console.warn('⚠️ Error marcando conversación como leída:', err);
              });
            }
          }
        );

        subscriptionIdRef.current = subId;
        console.log('✅ Suscrito a mensajes en tiempo real');
      } catch (err) {
        console.warn('⚠️ No se pudo suscribir a WebSocket, mensajes en tiempo real deshabilitados:', err.message);
        // No bloquear, continuar sin tiempo real
      }
    };

    suscribirse();

    return () => {
      if (subscriptionIdRef.current) {
        try {
          chatRealtimeService.unsubscribe(subscriptionIdRef.current);
          subscriptionIdRef.current = null;
        } catch (err) {
          console.warn('⚠️ Error desuscribiendo:', err);
        }
      }
    };
  }, [conversacionId]);

  // Enviar mensaje
  const enviarMensaje = useCallback(async (texto) => {
    if (!conversacionId || !texto.trim()) return;

    try {
      setEnviando(true);
      setError(null);

      console.log('📤 Enviando mensaje...', texto);

      // Si es conversación demo, simular envío
      if (String(conversacionId).startsWith('demo-')) {
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const mensajeDemo = {
          id: `msg-${Date.now()}`,
          kind: 'me',
          text: texto.trim(),
          time: timeStr,
          read: false
        };

        setMensajes(prev => [...prev, mensajeDemo]);
        console.log('✅ Mensaje demo agregado');
        return true;
      }

      // Enviar mensaje real a la API
      const mensajeEnviado = await enviarMensajeChat(conversacionId, texto.trim());

      // Agregar mensaje a la lista
      const mensajeTransformado = transformarMensaje(mensajeEnviado);
      setMensajes(prev => [...prev, mensajeTransformado]);

      console.log('✅ Mensaje enviado a API');

      return true;
    } catch (err) {
      console.warn('⚠️ Error enviando mensaje:', err.message);

      // Si falla la API, agregar mensaje localmente
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

      const mensajeLocal = {
        id: `msg-${Date.now()}`,
        kind: 'me',
        text: texto.trim(),
        time: timeStr,
        read: false
      };

      setMensajes(prev => [...prev, mensajeLocal]);
      console.log('✅ Mensaje agregado localmente (API no disponible)');

      return true;
    } finally {
      setEnviando(false);
    }
  }, [conversacionId]);

  return {
    mensajes,
    cargando,
    enviando,
    error,
    enviarMensaje
  };
}

// Transformar mensajes de la API al formato usado por MessageBubble
function transformarMensajes(mensajesApi) {
  return mensajesApi.map(transformarMensaje);
}

function transformarMensaje(mensajeApi) {
  // Determinar el tipo de mensaje
  let kind = 'them'; // Por defecto es del otro usuario

  if (mensajeApi.isAnnouncement) {
    kind = 'announcement';
  } else if (mensajeApi.isSystem) {
    kind = 'system';
  } else if (mensajeApi.isMine || mensajeApi.senderId === mensajeApi.currentUserId) {
    kind = 'me';
  }

  // Formatear hora
  const fecha = new Date(mensajeApi.createdAt || mensajeApi.timestamp);
  const horas = fecha.getHours().toString().padStart(2, '0');
  const minutos = fecha.getMinutes().toString().padStart(2, '0');
  const time = `${horas}:${minutos}`;

  return {
    id: mensajeApi.id || `msg-${Date.now()}`,
    kind,
    text: mensajeApi.body || mensajeApi.text || '',
    time,
    read: mensajeApi.read || false
  };
}
