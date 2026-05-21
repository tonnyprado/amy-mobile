import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';
import theme from '../../theme';

export default function ChatContactCard({ contact, onPress }) {
  const isAdmin = contact.rol === 'ADMIN';

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(contact)} activeOpacity={0.7}>
      <Avatar name={contact.nombre} size={48} />

      <View style={styles.content}>
        <Text style={styles.name}>{contact.nombre}</Text>
        <Badge
          label={isAdmin ? 'Admin' : `Rep. ${contact.repartidorId || ''}`}
          variant={isAdmin ? 'primary' : 'neutral'}
          size="sm"
        />
      </View>

      <Ionicons name="chevron-forward" size={20} color={theme.colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  content: {
    flex: 1,
    marginLeft: theme.spacing.md,
    gap: theme.spacing.xs,
  },
  name: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
});
