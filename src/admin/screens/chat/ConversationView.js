/**
 * ConversationView - Vista de conversación abierta
 * Muestra mensajes con un repartidor específico
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { ChevronLeft, Send, Megaphone, Phone } from 'lucide-react-native';
import { theme, FONTS, FONT_SIZES, SPACING, RADIUS } from '../../theme';
import MessageBubble from './MessageBubble';
import { Pill } from '../../components/primitives';
import useConversacion from '../../hooks/useConversacion';

export default function ConversationView({ repartidor, onBack, onSendAnnouncement }) {
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef(null);

  // Usar hook para manejar la conversación
  const {
    mensajes,
    cargando,
    enviando,
    error,
    enviarMensaje
  } = useConversacion(repartidor.userId);

  const handleSend = async () => {
    if (messageText.trim().length === 0) return;

    const exito = await enviarMensaje(messageText);

    if (exito) {
      setMessageText('');

      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleAnnouncement = () => {
    Alert.alert(
      'Enviar anuncio',
      `¿Enviar anuncio a ${repartidor.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: () => {
            if (onSendAnnouncement) {
              onSendAnnouncement(repartidor);
            }
          },
        },
      ]
    );
  };

  const handleCall = () => {
    if (!repartidor.phone || repartidor.phone.trim() === '') {
      Alert.alert(
        'Sin teléfono',
        'Este repartidor aún no tiene teléfono registrado',
        [{ text: 'OK' }]
      );
      return;
    }

    const phoneUrl = `tel:${repartidor.phone}`;
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(phoneUrl);
        } else {
          Alert.alert('Error', 'No se puede realizar la llamada en este dispositivo');
        }
      })
      .catch((err) => {
        console.error('Error abriendo marcador:', err);
        Alert.alert('Error', 'No se pudo abrir el marcador telefónico');
      });
  };

  const getStatusColor = (status) => {
    const colors = {
      enRuta: { fg: theme.infoFg, bg: theme.infoBg },
      libre: { fg: theme.muted, bg: theme.canvas },
      descanso: { fg: theme.successFg, bg: theme.successBg },
    };
    return colors[status] || colors.libre;
  };

  const getStatusLabel = (status) => {
    const labels = {
      enRuta: 'En ruta',
      libre: 'Libre',
      descanso: 'Descanso',
    };
    return labels[status] || status;
  };

  const statusConfig = getStatusColor(repartidor.status);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <ChevronLeft size={24} color={theme.ink} strokeWidth={2.5} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {repartidor.name}
          </Text>
          <Pill bg={statusConfig.bg} color={statusConfig.fg} style={styles.statusPill}>
            {getStatusLabel(repartidor.status)}
          </Pill>
        </View>

        <TouchableOpacity onPress={handleCall} style={styles.callButton}>
          <Phone size={20} color={theme.successFg} strokeWidth={2.2} />
        </TouchableOpacity>

        <TouchableOpacity onPress={handleAnnouncement} style={styles.announcementButton}>
          <Megaphone size={20} color={theme.accent} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* Messages list */}
      {cargando ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={styles.loadingText}>Cargando mensajes...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={mensajes}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }}
        />
      )}

      {/* Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Escribe un mensaje..."
          placeholderTextColor={theme.muted}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={500}
        />

        <TouchableOpacity
          style={[
            styles.sendButton,
            (messageText.trim().length === 0 || enviando) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={messageText.trim().length === 0 || enviando}
          activeOpacity={0.7}
        >
          {enviando ? (
            <ActivityIndicator size="small" color={theme.muted} />
          ) : (
            <Send
              size={20}
              color={messageText.trim().length > 0 ? theme.surface : theme.muted}
              strokeWidth={2.2}
            />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    paddingTop: 64, // Status bar height
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.surface,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: theme.canvas,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.lg,
    color: theme.ink,
    marginBottom: 4,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: `${theme.successFg}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  announcementButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: `${theme.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  messagesList: {
    paddingVertical: SPACING.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 34 : SPACING.md, // Home indicator
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.surface,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.base,
    color: theme.ink,
    backgroundColor: theme.canvas,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: theme.infoFg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.canvas,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.base,
    color: theme.muted,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.base,
    color: theme.dangerFg,
    textAlign: 'center',
  },
});
