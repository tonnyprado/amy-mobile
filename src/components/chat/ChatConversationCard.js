import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
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

export default function ChatConversationCard({ conversation, onPress }) {
  const hasUnread = conversation.unreadCount > 0;

  return (
    <TouchableOpacity
      style={[styles.card, hasUnread && styles.cardUnread]}
      onPress={() => onPress(conversation)}
      activeOpacity={0.7}
    >
      <Avatar name={conversation.displayName} size={48} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, hasUnread && styles.titleUnread]}>
            {conversation.displayName}
          </Text>
          <Text style={styles.time}>{formatTime(conversation.lastMessageAt)}</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.preview} numberOfLines={1}>
            {conversation.lastMessagePreview || 'Sin mensajes'}
          </Text>
          {hasUnread && (
            <Badge
              label={conversation.unreadCount.toString()}
              variant="primary"
              size="sm"
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardUnread: {
    borderColor: theme.colors.primary,
    borderWidth: 1.5,
  },
  content: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  title: {
    flex: 1,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  titleUnread: {
    fontWeight: theme.typography.weights.bold,
  },
  time: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  preview: {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
  },
});
