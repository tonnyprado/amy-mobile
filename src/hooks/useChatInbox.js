import { AppState } from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  obtenerContactosChat,
  obtenerConversacionesChat,
} from '../services/chatApi';
import { useAuth } from '../contexts/AuthContext';
import chatRealtimeService from '../services/chatRealtimeService';

export function useChatInbox() {
  const { user } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const loadInbox = useCallback(async ({
    refreshing: isRefreshing = false,
    includeContacts = true,
    silent = false,
  } = {}) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else if (!silent) {
        setLoading(true);
      }

      const requests = [
        includeContacts ? obtenerContactosChat() : Promise.resolve(null),
        obtenerConversacionesChat(),
      ];

      const [loadedContacts, loadedConversations] = await Promise.all(requests);

      if (loadedContacts) {
        setContacts(loadedContacts);
      }
      setConversations(loadedConversations || []);
      setError('');
    } catch (loadError) {
      setError(loadError.message || 'No se pudo cargar el chat');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    let subscriptionId = null;
    let active = true;

    chatRealtimeService
      .subscribe(`/topic/chat/user/${user.id}`, (conversation) => {
        if (!active) return;

        setConversations((currentConversations) => {
          const withoutCurrent = currentConversations.filter(
            (currentConversation) => currentConversation.id !== conversation.id
          );

          return [conversation, ...withoutCurrent].sort((firstConversation, secondConversation) => {
            const firstTime = firstConversation.lastMessageAt
              ? new Date(firstConversation.lastMessageAt).getTime()
              : 0;
            const secondTime = secondConversation.lastMessageAt
              ? new Date(secondConversation.lastMessageAt).getTime()
              : 0;
            return secondTime - firstTime;
          });
        });
      })
      .then((id) => {
        subscriptionId = id;
      })
      .catch((error) => {
        console.warn('⚠️ No se pudo conectar inbox realtime:', error.message);
      });

    const removeConnectionListener = chatRealtimeService.addConnectionListener(setRealtimeConnected);

    return () => {
      active = false;
      removeConnectionListener();
      if (subscriptionId) {
        chatRealtimeService.unsubscribe(subscriptionId);
      }
    };
  }, [user?.id]);

  useEffect(() => {
    if (realtimeConnected) {
      return undefined;
    }

    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        loadInbox({ includeContacts: false, silent: true }).catch(() => null);
      }
    });

    const intervalId = setInterval(() => {
      if (AppState.currentState === 'active') {
        loadInbox({ includeContacts: false, silent: true }).catch(() => null);
      }
    }, 60000);

    return () => {
      clearInterval(intervalId);
      appStateSubscription.remove();
    };
  }, [loadInbox, realtimeConnected]);

  return {
    contacts,
    conversations,
    loading,
    refreshing,
    realtimeConnected,
    error,
    reloadInbox: loadInbox,
  };
}
