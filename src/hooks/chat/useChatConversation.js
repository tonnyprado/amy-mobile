import { AppState } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import chatRealtimeService from '../../services/chatRealtimeService';
import chatSoundService from '../../services/chatSoundService';
import {
  crearORecuperarConversacionDirecta,
  enviarMensajeChat,
  marcarConversacionLeida,
  obtenerMensajesConversacion,
} from '../../services/chatApi';

export function useChatConversation({
  initialConversationId,
  contactUserId,
  title,
  navigation,
  onError,
}) {
  const [conversationId, setConversationId] = useState(initialConversationId || null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState('');
  const [bannerMessage, setBannerMessage] = useState(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);
  const lastAnnouncementIdRef = useRef(null);

  const buildMessageSignature = useCallback((messageList) =>
    messageList
      .map((message) => `${message.id}:${message.readByAllRecipients}:${message.readByUserIds?.length || 0}`)
      .join(','), []);

  const syncMessages = useCallback(async (conversationIdToLoad) => {
    if (!conversationIdToLoad) {
      return;
    }

    const loadedMessages = await obtenerMensajesConversacion(conversationIdToLoad);
    const normalizedMessages = loadedMessages || [];

    setMessages((currentMessages) => {
      if (currentMessages.length === normalizedMessages.length) {
        const currentSignature = buildMessageSignature(currentMessages);
        const nextSignature = buildMessageSignature(normalizedMessages);
        if (currentSignature === nextSignature) {
          return currentMessages;
        }
      }
      return normalizedMessages;
    });

    await marcarConversacionLeida(conversationIdToLoad);

    const lastAnnouncement = [...normalizedMessages]
      .reverse()
      .find((message) => message.tipo === 'ANNOUNCEMENT');

    if (lastAnnouncement && lastAnnouncement.id !== lastAnnouncementIdRef.current) {
      lastAnnouncementIdRef.current = lastAnnouncement.id;
      setBannerMessage(lastAnnouncement);
    }
  }, [buildMessageSignature]);

  useEffect(() => {
    let mounted = true;

    const ensureConversation = async () => {
      try {
        if (conversationId) {
          await syncMessages(conversationId);
          return;
        }

        if (!contactUserId) {
          setLoading(false);
          return;
        }

        const conversation = await crearORecuperarConversacionDirecta(contactUserId);
        if (!mounted) return;

        setConversationId(conversation.id);
        navigation.setParams({
          conversationId: conversation.id,
          title: conversation.displayName || title,
        });
        await syncMessages(conversation.id);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    ensureConversation().catch((error) => {
      if (mounted) {
        setLoading(false);
        if (onError) {
          onError(error);
        } else {
          console.error('Error al asegurar conversación:', error);
        }
      }
    });

    return () => {
      mounted = false;
    };
  }, [contactUserId, conversationId, navigation, onError, syncMessages, title]);

  useEffect(() => {
    if (!conversationId) {
      return undefined;
    }

    let subscriptionId = null;
    let active = true;

    chatRealtimeService
      .subscribe(`/topic/chat/conversation/${conversationId}`, (incomingMessage) => {
        if (!active) return;

        setMessages((currentMessages) => {
          const existingIndex = currentMessages.findIndex((message) => message.id === incomingMessage.id);
          if (existingIndex >= 0) {
            const nextMessages = [...currentMessages];
            nextMessages[existingIndex] = incomingMessage;
            return nextMessages;
          }

          // Nuevo mensaje - reproducir sonido
          if (!incomingMessage.mine) {
            if (incomingMessage.tipo === 'ANNOUNCEMENT') {
              chatSoundService.playAnnouncementSound();
            } else {
              chatSoundService.playMessageSound();
            }
          }

          return [...currentMessages, incomingMessage];
        });

        if (incomingMessage.tipo === 'ANNOUNCEMENT'
            && incomingMessage.id !== lastAnnouncementIdRef.current) {
          lastAnnouncementIdRef.current = incomingMessage.id;
          setBannerMessage(incomingMessage);
        }
      })
      .then((id) => {
        subscriptionId = id;
      })
      .catch((error) => {
        console.warn('⚠️ No se pudo conectar conversación realtime:', error.message);
      });

    const removeConnectionListener = chatRealtimeService.addConnectionListener(setRealtimeConnected);

    return () => {
      active = false;
      removeConnectionListener();
      if (subscriptionId) {
        chatRealtimeService.unsubscribe(subscriptionId);
      }
    };
  }, [conversationId]);

  useFocusEffect(
    useCallback(() => {
      if (conversationId) {
        syncMessages(conversationId).catch(() => null);
      }
    }, [conversationId, syncMessages])
  );

  useEffect(() => {
    if (!conversationId) return undefined;

    if (realtimeConnected) {
      return undefined;
    }

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        syncMessages(conversationId).catch(() => null);
      }
    });

    const intervalId = setInterval(() => {
      if (AppState.currentState === 'active') {
        syncMessages(conversationId).catch(() => null);
      }
    }, 45000);

    return () => {
      clearInterval(intervalId);
      appStateSubscription.remove();
    };
  }, [conversationId, realtimeConnected, syncMessages]);

  const sendMessage = useCallback(async () => {
    const body = draft.trim();
    if (!body || !conversationId || sending) {
      return;
    }

    setSending(true);
    try {
      const sentMessage = await enviarMensajeChat(conversationId, body);
      setMessages((currentMessages) => {
        if (currentMessages.some((message) => message.id === sentMessage.id)) {
          return currentMessages;
        }
        return [...currentMessages, sentMessage];
      });
      setDraft('');
    } finally {
      setSending(false);
    }
  }, [conversationId, draft, sending]);

  return useMemo(() => ({
    bannerMessage,
    conversationId,
    draft,
    loading,
    messages,
    realtimeConnected,
    sending,
    sendMessage,
    setDraft,
  }), [bannerMessage, conversationId, draft, loading, messages, realtimeConnected, sending, sendMessage]);
}
