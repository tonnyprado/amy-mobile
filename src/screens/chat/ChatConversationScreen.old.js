import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import ChatMessageBubble from '../../components/chat/ChatMessageBubble';
import ChatComposer from '../../components/chat/ChatComposer';
import AnnouncementFullScreenModal from '../../components/chat/AnnouncementFullScreenModal';
import LoadingScreen from '../../components/LoadingScreen';
import Header from '../../components/ui/Header';
import IconButton from '../../components/ui/IconButton';
import theme from '../../theme';
import { useChatConversation } from '../../hooks/chat/useChatConversation';

export default function ChatConversationScreen({ route, navigation }) {
  const {
    conversationId: initialConversationId,
    contactUserId,
    title,
  } = route.params || {};

  const [announcementModalVisible, setAnnouncementModalVisible] = useState(false);

  const {
    bannerMessage,
    draft,
    loading,
    messages,
    realtimeConnected,
    sending,
    sendMessage,
    setDraft,
  } = useChatConversation({
    initialConversationId,
    contactUserId,
    title,
    navigation,
    onError: (error) => {
      Alert.alert('Error', error.message || 'No se pudo abrir la conversación');
    },
  });

  // Mostrar modal cuando llega un anuncio
  React.useEffect(() => {
    if (bannerMessage && bannerMessage.tipo === 'ANNOUNCEMENT') {
      setAnnouncementModalVisible(true);
    }
  }, [bannerMessage]);

  if (loading) {
    return <LoadingScreen message="Abriendo conversación..." />;
  }

  const statusIcon = realtimeConnected ? (
    <Ionicons name="wifi" size={16} color={theme.colors.success} />
  ) : (
    <Ionicons name="wifi-outline" size={16} color={theme.colors.textMuted} />
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={0}
    >
      <StatusBar style="light" />

      <Header
        title={title || 'Conversación'}
        subtitle={
          <View style={styles.subtitleRow}>
            {statusIcon}
            <Text style={styles.subtitleText}>
              {realtimeConnected ? 'En línea' : 'Modo ahorro'}
            </Text>
          </View>
        }
        onBack={() => navigation.goBack()}
        showAvatar
        avatarName={title}
        rightActions={
          <IconButton size={40} backgroundColor={theme.colors.surfaceElevated}>
            <Ionicons name="ellipsis-vertical" size={20} color={theme.colors.textPrimary} />
          </IconButton>
        }
      />

      <FlatList
        data={messages}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <ChatMessageBubble message={item} />}
        contentContainerStyle={styles.messages}
      />

      <ChatComposer
        value={draft}
        onChangeText={setDraft}
        onSubmit={() => {
          sendMessage().catch((sendError) => {
            Alert.alert('Error', sendError.message || 'No se pudo enviar el mensaje');
          });
        }}
        loading={sending}
      />

      <AnnouncementFullScreenModal
        announcement={bannerMessage}
        visible={announcementModalVisible}
        onDismiss={() => setAnnouncementModalVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  subtitleText: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
  },
  messages: {
    padding: theme.spacing.lg,
  },
});
