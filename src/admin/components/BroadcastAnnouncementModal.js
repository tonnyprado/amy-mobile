/**
 * BroadcastAnnouncementModal - Modal para enviar anuncios masivos
 * Se muestra cuando se presiona el botón de mensaje masivo
 */

import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { X, Megaphone, Send } from 'lucide-react-native';
import { theme, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../theme';

export default function BroadcastAnnouncementModal({ visible, onClose, onSend }) {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim().length === 0) {
      Alert.alert('Campo vacío', 'Por favor escribe un mensaje');
      return;
    }

    if (onSend) {
      onSend(message.trim());
    }

    setMessage('');
    onClose();
  };

  const handleClose = () => {
    setMessage('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={styles.backdrop}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleClose}
        />

        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconContainer}>
                <Megaphone size={20} color={theme.accent} strokeWidth={2.5} />
              </View>
              <Text style={styles.title}>Mensaje masivo</Text>
            </View>

            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <X size={20} color={theme.muted} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={styles.description}>
              Este mensaje se enviará a todos los repartidores como anuncio operativo
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Escribe el anuncio..."
              placeholderTextColor={theme.muted}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={6}
              maxLength={500}
              textAlignVertical="top"
            />

            <Text style={styles.charCount}>{message.length} / 500</Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.sendButton,
                message.trim().length === 0 && styles.sendButtonDisabled,
              ]}
              onPress={handleSend}
              disabled={message.trim().length === 0}
              activeOpacity={0.7}
            >
              <Send size={18} color={theme.surface} strokeWidth={2.5} />
              <Text style={styles.sendButtonText}>Enviar anuncio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: theme.surface,
    borderRadius: RADIUS.xl,
    ...SHADOWS.cardHeavy,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: theme.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.displayBlack,
    fontSize: FONT_SIZES.xl,
    color: theme.ink,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: theme.canvas,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.xl,
  },
  description: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: theme.muted,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  input: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.base,
    color: theme.ink,
    backgroundColor: theme.canvas,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    minHeight: 120,
    marginBottom: SPACING.xs,
  },
  charCount: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.xs,
    color: theme.muted,
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    padding: SPACING.xl,
    paddingTop: 0,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.canvas,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.base,
    color: theme.muted,
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.xs,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: theme.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: theme.border,
  },
  sendButtonText: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.base,
    color: theme.surface,
  },
});
