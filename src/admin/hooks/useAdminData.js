/**
 * useAdminData - Hook para manejar datos reales del panel admin
 * Conecta con APIs y WebSocket para datos en tiempo real
 */

import { useState, useEffect, useCallback } from 'react';
import { obtenerRepartidores, obtenerEstadisticasDia } from '../../services/adminApi';
import { obtenerConversacionesChat } from '../../services/chatApi';
import chatRealtimeService from '../../services/chatRealtimeService';
import { REPARTIDORES, STATS } from '../data'; // Fallback data

export default function useAdminData() {
  const [repartidores, setRepartidores] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [conversaciones, setConversaciones] = useState([]);
  const [unreadByConv, setUnreadByConv] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wsConnected, setWsConnected] = useState(false);

  // Cargar repartidores
  const cargarRepartidores = useCallback(async () => {
    try {
      console.log('📥 Cargando repartidores desde API...');
      const data = await obtenerRepartidores();

      // Transformar datos de API al formato usado en el admin
      const repartidoresTransformados = data.map(rep => ({
        id: `r${rep.id}`,
        userId: rep.id,
        name: rep.nombre || 'Sin nombre',
        tag: obtenerIniciales(rep.nombre),
        phone: rep.telefono || null,
        color: asignarColor(rep.id),
        routes: [], // Se obtendrá de los pedidos asignados
        status: 'libre', // Se actualizará con rastreo
        online: false, // Se actualizará con rastreo
        progress: { total: 0, done: 0, route: 0, pct: 0 }
      }));

      setRepartidores(repartidoresTransformados);
      console.log(`✅ ${repartidoresTransformados.length} repartidores cargados desde API`);
    } catch (err) {
      console.warn('⚠️ Error cargando repartidores desde API, usando datos locales:', err);
      // Usar datos hardcodeados como fallback
      setRepartidores(REPARTIDORES);
      console.log(`✅ ${REPARTIDORES.length} repartidores cargados (datos locales)`);
    }
  }, []);

  // Cargar estadísticas
  const cargarEstadisticas = useCallback(async () => {
    try {
      console.log('📊 Cargando estadísticas desde API...');
      const data = await obtenerEstadisticasDia();

      // Transformar al formato usado por StatsScreen
      const estadisticasTransformadas = {
        successRate: data.tasaExito || 0,
        delivered: data.entregados || 0,
        assigned: data.totalPedidos || 0,
        activeDrivers: data.repartidoresActivos || 0,
        totalDrivers: data.totalRepartidores || 0,
        inRoute: data.enRuta || 0,
        pending: data.pendientes || 0,
        expectedPct: data.porcentajeEsperado || 0,
        alerts: {
          high: data.alertas?.alta || 0,
          mid: data.alertas?.media || 0
        },
        incidencias: transformarIncidencias(data.incidenciasPorMotivo),
        intentos: {
          uno: data.intentosPorNumero?.primero || 0,
          dos: data.intentosPorNumero?.segundo || 0,
          tres: data.intentosPorNumero?.tercero || 0
        },
        avisos: data.avisos || 0
      };

      setEstadisticas(estadisticasTransformadas);
      console.log('✅ Estadísticas cargadas desde API');
    } catch (err) {
      console.warn('⚠️ Error cargando estadísticas desde API, usando datos locales:', err);
      // Usar datos hardcodeados como fallback
      setEstadisticas(STATS);
      console.log('✅ Estadísticas cargadas (datos locales)');
    }
  }, []);

  // Cargar conversaciones de chat
  const cargarConversaciones = useCallback(async () => {
    try {
      console.log('💬 Cargando conversaciones desde API...');
      const data = await obtenerConversacionesChat();
      setConversaciones(data);

      // Calcular mensajes no leídos por conversación
      const unread = {};
      data.forEach(conv => {
        if (conv.unreadCount > 0) {
          // Buscar el repartidor correspondiente
          const rep = repartidores.find(r => r.userId === conv.otherUserId);
          if (rep) {
            unread[rep.id] = conv.unreadCount;
          }
        }
      });

      setUnreadByConv(unread);
      console.log('✅ Conversaciones cargadas desde API');
    } catch (err) {
      console.warn('⚠️ Error cargando conversaciones, usando datos demo:', err);
      // Usar datos demo como fallback
      setUnreadByConv({
        r1: 3,
        r5: 1
      });
      console.log('✅ Conversaciones demo cargadas');
    }
  }, [repartidores]);

  // Suscribirse a actualizaciones en tiempo real del chat
  useEffect(() => {
    let subscriptionId = null;
    let removeListener = null;

    const suscribirseChat = async () => {
      try {
        console.log('🔌 Intentando conectar a WebSocket de chat...');

        // Escuchar estado de conexión
        removeListener = chatRealtimeService.addConnectionListener((connected) => {
          setWsConnected(connected);
          console.log(`📡 WebSocket ${connected ? 'conectado ✅' : 'desconectado ❌'}`);
        });

        // Suscribirse a mensajes de conversaciones del usuario
        subscriptionId = await chatRealtimeService.subscribe(
          '/user/queue/messages',
          (message) => {
            console.log('📨 Nuevo mensaje recibido:', message);

            // Actualizar contador de no leídos
            const rep = repartidores.find(r => r.userId === message.senderId);
            if (rep && message.senderId !== message.currentUserId) {
              setUnreadByConv(prev => ({
                ...prev,
                [rep.id]: (prev[rep.id] || 0) + 1
              }));
            }

            // Recargar conversaciones para actualizar último mensaje
            cargarConversaciones();
          }
        );

        console.log('✅ Suscrito a chat en tiempo real');
      } catch (err) {
        console.warn('⚠️ No se pudo conectar al WebSocket, continuando sin tiempo real:', err.message);
        // No lanzar error, solo log - la app funciona sin WebSocket
      }
    };

    if (repartidores.length > 0) {
      suscribirseChat();
    }

    return () => {
      if (subscriptionId) {
        try {
          chatRealtimeService.unsubscribe(subscriptionId);
        } catch (err) {
          console.warn('⚠️ Error desuscribiendo WebSocket:', err);
        }
      }
      if (removeListener) {
        try {
          removeListener();
        } catch (err) {
          console.warn('⚠️ Error removiendo listener:', err);
        }
      }
    };
  }, [repartidores, cargarConversaciones]);

  // Cargar datos iniciales
  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      setError(null);

      try {
        // Cargar en paralelo pero no fallar si alguno falla (usan fallback)
        await Promise.allSettled([
          cargarRepartidores(),
          cargarEstadisticas()
        ]);

        console.log('✅ Datos iniciales cargados');
      } catch (err) {
        console.warn('⚠️ Error cargando datos iniciales:', err);
        // No setear error crítico, ya que tenemos fallback
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, [cargarRepartidores, cargarEstadisticas]);

  // Cargar conversaciones cuando los repartidores estén listos
  useEffect(() => {
    if (repartidores.length > 0) {
      cargarConversaciones();
    }
  }, [repartidores, cargarConversaciones]);

  // Refrescar datos
  const refrescar = useCallback(async () => {
    await Promise.all([
      cargarRepartidores(),
      cargarEstadisticas(),
      cargarConversaciones()
    ]);
  }, [cargarRepartidores, cargarEstadisticas, cargarConversaciones]);

  // Limpiar mensajes no leídos de una conversación
  const limpiarNoLeidos = useCallback((repartidorId) => {
    setUnreadByConv(prev => {
      const newUnread = { ...prev };
      delete newUnread[repartidorId];
      return newUnread;
    });
  }, []);

  return {
    repartidores,
    estadisticas,
    conversaciones,
    unreadByConv,
    loading,
    error,
    wsConnected,
    refrescar,
    limpiarNoLeidos
  };
}

// Funciones auxiliares

function obtenerIniciales(nombre) {
  if (!nombre) return '??';
  const palabras = nombre.trim().split(' ');
  if (palabras.length >= 2) {
    return (palabras[0][0] + palabras[1][0]).toUpperCase();
  }
  return nombre.substring(0, 2).toUpperCase();
}

function asignarColor(id) {
  const colores = [
    '#C5B4FF', // Morado
    '#FFCE3B', // Amarillo
    '#5BE0A2', // Verde
    '#FF7849', // Naranja
    '#3D6BFF', // Azul
    '#FF5A7E', // Rosa
    '#00D4AA', // Turquesa
    '#FF9F43', // Naranja claro
  ];
  return colores[id % colores.length];
}

function transformarIncidencias(incidenciasPorMotivo) {
  if (!incidenciasPorMotivo) return [];

  const mapeo = {
    CLIENTE_NO_ESTABA: { key: 'cliente', label: 'Cliente no estaba', icon: 'door-closed' },
    DATOS_INCORRECTOS: { key: 'datos', label: 'Datos incorrectos', icon: 'map-pin-off' },
    ALTO_RIESGO: { key: 'riesgo', label: 'Alto riesgo', icon: 'alert-octagon' },
    CAMBIO_DOMICILIO: { key: 'cambio', label: 'Cambio de domicilio', icon: 'repeat-2' },
    RECHAZO: { key: 'rechazo', label: 'Rechazo del cliente', icon: 'circle-x' },
    OTRA_RAZON: { key: 'otros', label: 'Otros motivos', icon: 'circle-help' }
  };

  return Object.entries(incidenciasPorMotivo)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      ...mapeo[key],
      value
    }));
}
