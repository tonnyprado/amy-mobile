import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../../theme';
import Avatar from './Avatar';

/**
 * Header component reutilizable
 * @param {string} title - Título del header
 * @param {string} subtitle - Subtítulo (opcional)
 * @param {function} onBack - Callback para botón de retroceso (opcional)
 * @param {React.ReactNode} rightActions - Acciones del lado derecho (opcional)
 * @param {boolean} showAvatar - Mostrar avatar (opcional)
 * @param {string} avatarName - Nombre para el avatar (opcional)
 * @param {object} style - Estilos adicionales
 */
export default function Header({
  title,
  subtitle,
  onBack,
  rightActions,
  showAvatar = false,
  avatarName,
  style,
}) {
  return (
    <View style={[styles.header, style]}>
      <View style={styles.leftSection}>
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
        )}

        {showAvatar && (
          <View style={styles.avatarContainer}>
            <Avatar name={avatarName || title} size={40} />
          </View>
        )}

        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>

      {rightActions && <View style={styles.rightSection}>{rightActions}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: theme.colors.background,
    paddingTop: 48,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: theme.spacing.md,
    padding: theme.spacing.sm,
  },
  avatarContainer: {
    marginRight: theme.spacing.md,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
  },
  subtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    marginTop: 2,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
});
