// src/screens/repartidor/RepartidorMainScreenWrapper.js
// Wrapper que carga datos y pasa a RepartidorMainScreen

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useGeolocation } from '../../hooks/useGeolocation';
import { useChatInbox } from '../../hooks/useChatInbox';
import { obtenerPedidosHoy, convertirPedidoBackend, comenzarRuta } from '../../services/repartidorApi';
import RepartidorMainScreen from './RepartidorMainScreen';
import LoadingScreen from '../../components/LoadingScreen';

export default function RepartidorMainScreenWrapper({ navigation }) {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toastNotification, setToastNotification] = useState(null);

  // Chat inbox hook para obtener mensajes no leídos
  const { conversations, loading: loadingChat } = useChatInbox();

  const enRuta = pedidos.some(p => p.estado === 'EN_RUTA');

  const {
    ubicacion,
    error: errorGPS,
    tracking,
    solicitarPermisos,
    obtenerUbicacionUnaVez,
  } = useGeolocation({
    repartidorId: user?.repartidor?.idRepartidor,
    enabled: true, // Siempre habilitado para obtener ubicación
    estadoActividad: enRuta ? 'EN_RUTA' : 'EN_ALMACEN',
    intervalo: 60000,
  });

  // Solicitar permisos y obtener ubicación al montar
  useEffect(() => {
    const inicializarUbicacion = async () => {
      try {
        await solicitarPermisos();
        await obtenerUbicacionUnaVez();
      } catch (error) {
        console.error('Error al inicializar ubicación:', error);
      }
    };
    inicializarUbicacion();
  }, []);

  useEffect(() => {
    cargarPedidos();
  }, [user]);

  const cargarPedidos = async () => {
    const repartidorId = user?.repartidor?.idRepartidor;
    if (!repartidorId) {
      console.warn('No se encontró idRepartidor');
      setLoading(false);
      return;
    }

    try {
      const pedidosBackend = await obtenerPedidosHoy(repartidorId);
      const pedidosConvertidos = pedidosBackend.map(convertirPedidoBackend);
      setPedidos(pedidosConvertidos);
    } catch (error) {
      console.error('Error al cargar paquetes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleComenzarRuta = async () => {
    const repartidorId = user?.repartidor?.idRepartidor;
    if (!repartidorId) return;

    try {
      await comenzarRuta(repartidorId);
      // Recargar pedidos para reflejar el cambio de estado
      await cargarPedidos();
    } catch (error) {
      console.error('Error al comenzar ruta:', error);
      throw error; // Re-throw para que el componente pueda mostrar el error
    }
  };

  // Calcular total de mensajes no leídos
  const unreadCount = conversations.reduce((total, conv) => {
    return total + (conv.unreadCount || 0);
  }, 0);

  // Simular llegada de notificación (esto debería venir del WebSocket real)
  useEffect(() => {
    if (conversations.length > 0 && unreadCount > 0) {
      const latestConv = conversations[0];
      if (latestConv.unreadCount > 0) {
        setToastNotification({
          name: latestConv.displayName || 'Nuevo mensaje',
          tag: latestConv.displayName?.substring(0, 2).toUpperCase() || 'XX',
          color: latestConv.color || '#FF7849',
          message: latestConv.lastMessage?.contenido || 'Tienes un mensaje nuevo',
          shown: true,
          conversationId: latestConv.id,
        });

        // Auto-hide toast after 5 seconds
        const timeout = setTimeout(() => {
          setToastNotification(null);
        }, 5000);

        return () => clearTimeout(timeout);
      }
    }
  }, [conversations, unreadCount]);

  if (loading || loadingChat) {
    return <LoadingScreen message="Cargando pedidos..." />;
  }

  const ubicacionActual = ubicacion ? {
    lat: ubicacion.latitud,
    lng: ubicacion.longitud,
  } : null;

  return (
    <RepartidorMainScreen
      navigation={navigation}
      pedidos={pedidos}
      ubicacion={ubicacionActual}
      errorGPS={errorGPS}
      tracking={tracking}
      unreadCount={unreadCount}
      toastNotification={toastNotification}
      onComenzarRuta={handleComenzarRuta}
      onToastPress={() => {
        if (toastNotification?.conversationId) {
          navigation.navigate('ChatConversation', {
            conversationId: toastNotification.conversationId,
            title: toastNotification.name,
          });
        }
        setToastNotification(null);
      }}
    />
  );
}
