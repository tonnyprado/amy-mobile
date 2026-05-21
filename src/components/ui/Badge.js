import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import theme from '../../theme';

/**
 * Badge component - muestra etiquetas de estado con colores vibrantes
 * @param {string} label - Texto del badge
 * @param {string} variant - 'primary' | 'success' | 'warning' | 'error' | 'info' | 'neutral'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {object} style - Estilos adicionales
 */
export default function Badge({ label, variant = 'primary', size = 'md', style }) {
  const variantStyles = {
    primary: {
      backgroundColor: theme.colors.surfacePurple,
      borderColor: theme.colors.primary,
      color: theme.colors.primary,
    },
    success: {
      backgroundColor: '#ECFDF5',
      borderColor: theme.colors.success,
      color: theme.colors.success,
    },
    warning: {
      backgroundColor: theme.colors.surfaceOrange,
      borderColor: theme.colors.warning,
      color: theme.colors.warning,
    },
    error: {
      backgroundColor: '#FEF2F2',
      borderColor: theme.colors.error,
      color: theme.colors.error,
    },
    info: {
      backgroundColor: '#EFF6FF',
      borderColor: theme.colors.info,
      color: theme.colors.info,
    },
    neutral: {
      backgroundColor: theme.colors.surfaceElevated,
      borderColor: theme.colors.border,
      color: theme.colors.textSecondary,
    },
  };

  const sizeStyles = {
    sm: {
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 3,
      fontSize: theme.typography.sizes.xs,
    },
    md: {
      paddingHorizontal: theme.spacing.md,
      paddingVertical: 5,
      fontSize: theme.typography.sizes.sm,
    },
    lg: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.sm,
      fontSize: theme.typography.sizes.base,
    },
  };

  const variantStyle = variantStyles[variant] || variantStyles.primary;
  const sizeStyle = sizeStyles[size] || sizeStyles.md;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variantStyle.backgroundColor,
          borderColor: variantStyle.borderColor,
          paddingHorizontal: sizeStyle.paddingHorizontal,
          paddingVertical: sizeStyle.paddingVertical,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: variantStyle.color,
            fontSize: sizeStyle.fontSize,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: theme.borderRadius.full,
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  text: {
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.3,
  },
});
