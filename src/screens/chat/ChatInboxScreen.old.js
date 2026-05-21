import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { useChatInbox } from '../../hooks/useChatInbox';
import {
  crearORecuperarConversacionDirecta,
  enviarAnuncioChat,
} from '../../services/chatApi';
import ChatContactCard from '../../components/chat/ChatContactCard';
import ChatConversationCard from '../../components/chat/ChatConversationCard';
import AnnouncementComposerModal from '../../components/chat/AnnouncementComposerModal';
import LoadingScreen from '../../components/LoadingScreen';
import Header from '../../components/ui/Header';
import IconButton from '../../components/ui/IconButton';
import EmptyState from '../../components/ui/EmptyState';
import theme from '../../theme';

export default function ChatInboxScreen({ navigation }) {
  const { user } = useAuth();
  const { contacts, conversations, loading, refreshing, realtimeConnected, error, reloadInbox } = useChatInbox();
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [sendingAnnouncement, setSendingAnnouncement] = useState(false);

  const isAdmin = user?.rol === 'ADMIN';

  useFocusEffect(
    React.useCallback(() => {
      reloadInbox();
    }, [reloadInbox])
  );

  const headerSubtitle = useMemo(() => {
    if (isAdmin) {
      return 'Mensajes con administradores y repartidores';
    }
    return 'Solo verás administradores disponibles para operación';
  }, [isAdmin]);

  const openConversationWithContact = async (contact) => {
    try {
      const conversation = await crearORecuperarConversacionDirecta(contact.id);
      navigation.navigate('ChatConversation', {
        conversationId: conversation.id,
        title: conversation.displayName || contact.nombre,
      });
    } catch (conversationError) {
      Alert.alert('Error', conversationError.message || 'No se pudo abrir la conversación');
    }
  };

  const openConversation = (conversation) => {
    navigation.navigate('ChatConversation', {
      conversationId: conversation.id,
      title: conversation.displayName,
    });
  };

  const handleSubmitAnnouncement = async (payload) => {
    try {
      setSendingAnnouncement(true);
      await enviarAnuncioChat(payload);
      setAnnouncementOpen(false);
      Alert.alert('Anuncio enviado', 'El anuncio ya quedó guardado dentro del chat de los destinatarios.');
      await reloadInbox();
    } catch (announcementError) {
      Alert.alert('Error', announcementError.message || 'No se pudo enviar el anuncio');
    } finally {
      setSendingAnnouncement(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Cargando chat..." />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Header
        title="Chat Operativo"
        subtitle={headerSubtitle}
        onBack={() => navigation.goBack()}
        rightActions={
          <>
            <View style={styles.statusContainer}>
              <Ionicons
                name={realtimeConnected ? 'wifi' : 'wifi-outline'}
                size={18}
                color={realtimeConnected ? theme.colors.success : theme.colors.textMuted}
              />
            </View>
            {isAdmin && (
              <IconButton
                size={40}
                backgroundColor={theme.colors.primary}
                onPress={() => setAnnouncementOpen(true)}
              >
                <Ionicons name="megaphone" size={20} color={theme.colors.textPrimary} />
              </IconButton>
            )}
          </>
        }
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => reloadInbox({ refreshing: true })}
            tintColor="#2563eb"
          />
        }
      >
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conversaciones</Text>
          {conversations.length === 0 ? (
            <EmptyState
              icon="💬"
              title="No hay conversaciones"
              message="Abre una desde la lista de contactos"
              style={styles.emptyState}
            />
          ) : (
            conversations.map((conversation) => (
              <ChatConversationCard
                key={conversation.id}
                conversation={conversation}
                onPress={openConversation}
              />
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contactos</Text>
          {contacts.map((contact) => (
            <ChatContactCard
              key={contact.id}
              contact={contact}
              onPress={openConversationWithContact}
            />
          ))}
        </View>
      </ScrollView>

      <AnnouncementComposerModal
        visible={announcementOpen}
        onClose={() => setAnnouncementOpen(false)}
        contacts={contacts}
        loading={sendingAnnouncement}
        onSubmit={handleSubmitAnnouncement}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  statusContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  emptyState: {
    paddingVertical: theme.spacing.xxxl,
  },
  error: {
    marginBottom: theme.spacing.md,
    color: theme.colors.error,
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.error,
    padding: theme.spacing.md,
  },
});
