import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';
import chatRealtimeService from '../services/chatRealtimeService';
import chatSoundService from '../services/chatSoundService';
import AnnouncementFullScreenModal from '../components/chat/AnnouncementFullScreenModal';
import WebSocketStatusIndicator from '../components/WebSocketStatusIndicator';

const AnnouncementContext = createContext(null);

const VIEWED_ANNOUNCEMENTS_KEY = '@amy_viewed_announcements';

export function AnnouncementProvider({ children }) {
  console.log('🚀🚀🚀 AnnouncementProvider INICIADO 🚀🚀🚀');

  const { user } = useAuth();
  const [currentAnnouncement, setCurrentAnnouncement] = useState(null);
  const [viewedAnnouncementIds, setViewedAnnouncementIds] = useState(new Set());
  const [isConnected, setIsConnected] = useState(false);

  console.log('👤 Usuario actual:', user?.id, user?.nombre);

  // Inicializar servicio de sonido
  useEffect(() => {
    console.log('🔊 Inicializando servicio de sonido...');
    chatSoundService.initialize();
    return () => {
      chatSoundService.cleanup();
    };
  }, []);

  // Cargar anuncios ya vistos desde AsyncStorage
  useEffect(() => {
    const loadViewedAnnouncements = async () => {
      try {
        const stored = await AsyncStorage.getItem(VIEWED_ANNOUNCEMENTS_KEY);
        if (stored) {
          const ids = JSON.parse(stored);
          setViewedAnnouncementIds(new Set(ids));
        }
      } catch (error) {
        console.error('Error al cargar anuncios vistos:', error);
      }
    };

    loadViewedAnnouncements();
  }, []);

  // Guardar un anuncio como visto
  const markAnnouncementAsViewed = useCallback(async (announcementId) => {
    try {
      const newViewedIds = new Set(viewedAnnouncementIds);
      newViewedIds.add(announcementId);

      setViewedAnnouncementIds(newViewedIds);
      await AsyncStorage.setItem(
        VIEWED_ANNOUNCEMENTS_KEY,
        JSON.stringify([...newViewedIds])
      );
    } catch (error) {
      console.error('Error al guardar anuncio visto:', error);
    }
  }, [viewedAnnouncementIds]);

  // Manejar nuevo anuncio
  const handleNewAnnouncement = useCallback((message) => {
    // Solo procesar anuncios
    if (message.tipo !== 'ANNOUNCEMENT') {
      return;
    }

    // Verificar si ya fue visto
    if (viewedAnnouncementIds.has(message.id)) {
      console.log('📢 Anuncio ya visto, no mostrar:', message.id);
      return;
    }

    console.log('📢 Nuevo anuncio recibido:', message);

    // Parsear metadata para obtener el título
    let metadata = null;
    try {
      if (message.metadataJson) {
        metadata = JSON.parse(message.metadataJson);
      }
    } catch (error) {
      console.error('Error al parsear metadata del anuncio:', error);
    }

    // Limpiar el prefijo "Anuncio: " del body
    const cleanBody = message.body.startsWith('Anuncio: ')
      ? message.body.substring(9)
      : message.body;

    // Crear objeto announcement para el modal
    const announcement = {
      id: message.id,
      titulo: metadata?.titulo || 'Anuncio Operativo',
      body: cleanBody,
      senderName: message.senderNombre,
      createdAt: message.createdAt,
      tipo: message.tipo,
    };

    // Reproducir sonido y vibración de anuncio
    chatSoundService.playAnnouncementSound();

    setCurrentAnnouncement(announcement);
  }, [viewedAnnouncementIds]);

  // Suscribirse a anuncios cuando el usuario está autenticado
  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    console.log('📢 Iniciando sistema de anuncios globales para usuario:', user.id);

    let subscriptionId = null;
    let mounted = true;

    // Listener de conexión para monitorear estado
    const removeConnectionListener = chatRealtimeService.addConnectionListener((connected) => {
      if (mounted) {
        setIsConnected(connected);
        console.log(`📡 WebSocket estado de conexión: ${connected ? 'CONECTADO ✅' : 'DESCONECTADO ❌'}`);
      }
    });

    // Función para suscribirse con reintentos
    const subscribeToAnnouncements = async () => {
      // No intentar conectar si no hay usuario
      if (!user?.id) {
        console.log('⏸️  No hay usuario autenticado, saltando suscripción a anuncios');
        return;
      }

      try {
        console.log('📢 Conectando al WebSocket para anuncios...');
        console.log(`📢 Topic de suscripción: /topic/chat/user/${user.id}`);

        const id = await chatRealtimeService.subscribe(
          `/topic/chat/user/${user.id}`,
          (conversation) => {
            if (!mounted) return;

            console.log('📨 Mensaje recibido en WebSocket:', {
              conversationId: conversation.id,
              hasLastMessage: !!conversation.lastMessage,
              lastMessageType: conversation.lastMessage?.tipo,
            });

            // El WebSocket envía conversaciones actualizadas con el lastMessage completo
            // Verificar si el último mensaje es un anuncio
            if (conversation.lastMessage && conversation.lastMessage.tipo === 'ANNOUNCEMENT') {
              console.log('📢 ¡ANUNCIO DETECTADO!', conversation.lastMessage);
              handleNewAnnouncement(conversation.lastMessage);
            } else {
              console.log('📨 Mensaje no es anuncio, ignorando');
            }
          }
        );

        if (mounted) {
          subscriptionId = id;
          console.log('✅ Suscrito a anuncios globales con ID:', id);
          console.log('✅ El sistema de anuncios está ACTIVO y escuchando');
        }
      } catch (error) {
        // Usar warn en lugar de error para que no sea tan intrusivo
        console.warn('⚠️  No se pudo conectar a anuncios en tiempo real:', error.message);

        // No reintentar - el sistema se reconectará automáticamente cuando el WebSocket esté disponible
        // if (mounted) {
        //   console.log('🔄 Reintentando suscripción en 3 segundos...');
        //   setTimeout(() => {
        //     if (mounted) {
        //       subscribeToAnnouncements();
        //     }
        //   }, 3000);
        // }
      }
    };

    // Iniciar suscripción
    subscribeToAnnouncements();

    return () => {
      mounted = false;
      removeConnectionListener();
      if (subscriptionId) {
        chatRealtimeService.unsubscribe(subscriptionId);
        console.log('🔌 Desuscrito de anuncios globales');
      }
    };
  }, [user?.id, handleNewAnnouncement]);

  // Manejar cierre del modal
  const handleDismissAnnouncement = useCallback(() => {
    if (currentAnnouncement) {
      markAnnouncementAsViewed(currentAnnouncement.id);
    }
    setCurrentAnnouncement(null);
  }, [currentAnnouncement, markAnnouncementAsViewed]);

  return (
    <AnnouncementContext.Provider value={{ currentAnnouncement }}>
      {children}
      {/* WebSocket status indicator - deshabilitado en producción */}
      {/* {user && <WebSocketStatusIndicator />} */}
      <AnnouncementFullScreenModal
        announcement={currentAnnouncement}
        visible={!!currentAnnouncement}
        onDismiss={handleDismissAnnouncement}
      />
    </AnnouncementContext.Provider>
  );
}

export function useAnnouncements() {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error('useAnnouncements debe usarse dentro de AnnouncementProvider');
  }
  return context;
}
