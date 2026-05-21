// src/screens/chat/ChatConversationScreen.js
// Vista de conversación individual con burbujas de chat

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from '../../components/repartidor/Icon';
import { getTheme, DEFAULT_PALETTE, FONTS } from '../../theme/repartidorTheme';
import { useRepartidorFonts } from '../../hooks/useRepartidorFonts';
import { useChatConversation } from '../../hooks/chat/useChatConversation';
import LoadingScreen from '../../components/LoadingScreen';

export default function ChatConversationScreen({ route, navigation }) {
  const {
    conversationId: initialConversationId,
    contactUserId,
    title,
    contactColor,
  } = route.params || {};

  const { fontsLoaded } = useRepartidorFonts();
  const theme = getTheme(DEFAULT_PALETTE);
  const flatListRef = useRef(null);

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

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!draft.trim() || sending) return;
    sendMessage().catch((error) => {
      Alert.alert('Error', error.message || 'No se pudo enviar el mensaje');
    });
  };

  if (loading || !fontsLoaded) {
    return <LoadingScreen message="Abriendo conversación..." />;
  }

  const initials = title?.substring(0, 2).toUpperCase() || 'XX';
  const color = contactColor || theme.accent;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.canvas }]} edges={['top']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={18} color={theme.ink} strokeWidth={2.2} />
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: color }]}>
            <Text style={[styles.avatarText, { color: '#0F0F0F' }]}>
              {initials}
            </Text>
          </View>
          {realtimeConnected && (
            <View
              style={[
                styles.onlineBadge,
                {
                  backgroundColor: theme.successFg,
                  borderColor: theme.canvas,
                },
              ]}
            />
          )}
        </View>

        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: theme.ink }]}>
            {title || 'Conversación'}
          </Text>
          <View style={styles.headerStatus}>
            {realtimeConnected && (
              <>
                <View style={[styles.statusDot, { backgroundColor: theme.successFg }]} />
                <Text style={[styles.headerSubtitle, { color: theme.muted }]}>
                  EN LÍNEA
                </Text>
              </>
            )}
            {!realtimeConnected && (
              <Text style={[styles.headerSubtitle, { color: theme.muted }]}>
                Desconectado
              </Text>
            )}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Icon name="phone" size={16} color={theme.ink} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Icon name="more-vertical" size={17} color={theme.ink} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.messagesContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => (
            <>
              {index === 0 && <DayDivider theme={theme} label="HOY" />}
              {item.tipo === 'SYSTEM' && index === 1 && (
                <SystemMessage theme={theme} message={item} />
              )}
              <MessageBubble message={item} theme={theme} color={color} />
            </>
          )}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

        {/* Input Bar */}
        <View style={[styles.inputBar, { borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Icon name="paperclip" size={16} color={theme.muted} />
          </TouchableOpacity>

          <View style={[styles.inputContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, { color: theme.ink }]}
              value={draft}
              onChangeText={setDraft}
              placeholder="Escribe un mensaje…"
              placeholderTextColor={theme.muted}
              multiline
              maxLength={500}
            />
            <TouchableOpacity>
              <Icon name="smile" size={17} color={theme.muted} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.sendButton, { backgroundColor: theme.accent }]}
            onPress={handleSend}
            disabled={sending || !draft.trim()}
          >
            <Icon name="send" size={16} color={theme.ink} strokeWidth={2.4} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function DayDivider({ theme, label }) {
  return (
    <View style={styles.dayDivider}>
      <View style={[styles.dayDividerBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.dayDividerText, { color: theme.muted }]}>
          {label}
        </Text>
      </View>
    </View>
  );
}

function SystemMessage({ theme, message }) {
  return (
    <View style={styles.systemMessage}>
      <View style={[styles.systemBadge, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.systemText, { color: theme.muted }]}>
          {message.contenido} · {new Date(message.createdAt).toLocaleTimeString()}
        </Text>
      </View>
    </View>
  );
}

function MessageBubble({ message, theme, color }) {
  const isMe = message.mine || false;
  const isAnnouncement = message.tipo === 'ANNOUNCEMENT';
  const isSystem = message.tipo === 'SYSTEM';

  if (isSystem) return null; // Already handled above

  if (isAnnouncement) {
    return (
      <View style={[styles.announcementBubble, { backgroundColor: theme.warnBg, borderColor: theme.warnBorder }]}>
        <View style={[styles.announcementIcon, { backgroundColor: theme.ink }]}>
          <Icon name="megaphone" size={13} color={theme.warnBg} />
        </View>
        <View style={styles.announcementContent}>
          <Text style={[styles.announcementKicker, { color: theme.ink }]}>
            ANUNCIO · {message.senderNombre?.toUpperCase() || 'SISTEMA'} · {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          <Text style={[styles.announcementMessage, { color: theme.ink }]}>
            {message.contenido || message.body}
          </Text>
        </View>
      </View>
    );
  }

  const messageContent = message.contenido || message.body || '';

  return (
    <View style={[styles.messageBubbleContainer, isMe && styles.messageBubbleContainerMe]}>
      <View
        style={[
          styles.messageBubble,
          {
            backgroundColor: isMe ? theme.ink : theme.surface,
            borderColor: theme.border,
            borderWidth: isMe ? 0 : 1,
            borderBottomRightRadius: isMe ? 6 : 18,
            borderBottomLeftRadius: isMe ? 18 : 6,
          },
        ]}
      >
        <Text
          style={[
            styles.messageText,
            { color: isMe ? theme.canvas : theme.ink },
          ]}
        >
          {messageContent}
        </Text>
        <View style={styles.messageFooter}>
          <Text
            style={[
              styles.messageTime,
              { color: isMe ? theme.canvas : theme.muted },
            ]}
          >
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {isMe && (
            <Icon
              name={message.readByAllRecipients ? 'check-check' : 'check'}
              size={11}
              color={theme.canvas}
              strokeWidth={2.4}
            />
          )}
        </View>
      </View>
    </View>
  );
}

function TypingIndicator({ theme }) {
  return (
    <View style={[styles.typingContainer, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.typingDot, { backgroundColor: theme.muted }]} />
      <View style={[styles.typingDot, { backgroundColor: theme.muted }]} />
      <View style={[styles.typingDot, { backgroundColor: theme.muted }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 12,
    gap: 10,
    borderBottomWidth: 1,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.3,
    fontFamily: FONTS.bodyBold,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2.5,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
    fontFamily: FONTS.bodyBold,
  },
  headerStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 1,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  headerSubtitle: {
    fontSize: 10.5,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  dayDivider: {
    alignItems: 'center',
    marginBottom: 4,
  },
  dayDividerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  dayDividerText: {
    fontSize: 10.5,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  systemMessage: {
    alignItems: 'center',
  },
  systemBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  systemText: {
    fontSize: 11,
  },
  messageBubbleContainer: {
    alignItems: 'flex-start',
    maxWidth: '78%',
  },
  messageBubbleContainerMe: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  messageBubble: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
    elevation: 3,
  },
  messageText: {
    fontSize: 13.5,
    lineHeight: 18,
    letterSpacing: -0.1,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  messageTime: {
    fontSize: 10,
    fontFamily: FONTS.bodyRegular,
    opacity: 0.55,
  },
  typingContainer: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  input: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: FONTS.bodyRegular,
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
  },
  announcementBubble: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  announcementIcon: {
    width: 28,
    height: 28,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  announcementContent: {
    flex: 1,
  },
  announcementKicker: {
    fontSize: 9.5,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.65,
  },
  announcementMessage: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 17,
  },
});
