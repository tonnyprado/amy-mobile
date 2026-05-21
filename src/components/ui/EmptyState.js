import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../theme';

/**
 * EmptyState component - estado vacío reutilizable
 * @param {string} icon - Emoji o icono como texto
 * @param {string} title - Título del estado vacío
 * @param {string} message - Mensaje descriptivo
 * @param {React.ReactNode} action - Acción opcional (botón, etc.)
 * @param {object} style - Estilos adicionales
 */
export default function EmptyState({ icon, title, message, action, style }) {
  return (
    <View style={[styles.container, style]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      {title && <Text style={styles.title}>{title}</Text>}
      {message && <Text style={styles.message}>{message}</Text>}
      {action && <View style={styles.actionContainer}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xxxl,
  },
  icon: {
    fontSize: 64,
    marginBottom: theme.spacing.lg,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.base,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  actionContainer: {
    marginTop: theme.spacing.md,
  },
});
