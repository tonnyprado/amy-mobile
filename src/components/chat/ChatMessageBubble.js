import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';

function formatTime(value) {
  if (!value) return '';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getReceiptIcon(message) {
  if (!message?.mine) {
    return null;
  }

  return message.readByAllRecipients ? (
    <Ionicons name="checkmark-done" size={14} color={theme.colors.textSecondary} />
  ) : (
    <Ionicons name="checkmark" size={14} color={theme.colors.textSecondary} />
  );
}

export default function ChatMessageBubble({ message }) {
  const mine = Boolean(message.mine);
  const isAnnouncement = message.tipo === 'ANNOUNCEMENT';

  return (
    <View style={[styles.wrapper, mine && styles.wrapperMine]}>
      <View
        style={[
          styles.bubble,
          mine && styles.bubbleMine,
          isAnnouncement && styles.bubbleAnnouncement,
        ]}
      >
        {!mine && (
          <Text style={styles.author}>{message.senderNombre}</Text>
        )}
        <Text style={[styles.body, mine && styles.bodyMine]}>
          {message.body}
        </Text>
        <View style={styles.metaRow}>
          <Text style={[styles.time, mine && styles.timeMine]}>
            {formatTime(message.createdAt)}
          </Text>
          {getReceiptIcon(message)}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  wrapperMine: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '80%',
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.borderRadius.lg,
    borderBottomLeftRadius: 4,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  bubbleMine: {
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: theme.borderRadius.lg,
    borderBottomRightRadius: 4,
    borderColor: theme.colors.primary,
  },
  bubbleAnnouncement: {
    backgroundColor: theme.colors.warning,
    borderColor: theme.colors.warning,
  },
  author: {
    fontSize: theme.typography.sizes.xs,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  body: {
    fontSize: theme.typography.sizes.base,
    lineHeight: theme.typography.sizes.base * theme.typography.lineHeights.normal,
    color: theme.colors.textPrimary,
  },
  bodyMine: {
    color: theme.colors.textPrimary,
  },
  time: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
  timeMine: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  metaRow: {
    marginTop: theme.spacing.sm,
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
});
