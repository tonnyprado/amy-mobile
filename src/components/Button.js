import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Animated } from 'react-native';
import theme from '../theme';

/**
 * Componente Button reutilizable con animaciones
 * @param {Object} props
 * @param {string} props.title - Texto del botón
 * @param {Function} props.onPress - Función al presionar
 * @param {string} props.variant - 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'outline'
 * @param {boolean} props.disabled - Si está deshabilitado
 * @param {boolean} props.loading - Si está cargando
 * @param {Object} props.style - Estilos adicionales
 */
export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  ...props
}) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 100,
      friction: 3,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 3,
    }).start();
  };

  const variantStyles = {
    primary: styles.primary,
    secondary: styles.secondary,
    success: styles.success,
    danger: styles.danger,
    ghost: styles.ghost,
    outline: styles.outline,
  };

  const variantTextStyles = {
    primary: styles.primaryText,
    secondary: styles.secondaryText,
    success: styles.successText,
    danger: styles.dangerText,
    ghost: styles.ghostText,
    outline: styles.outlineText,
  };

  const spinnerColor =
    variant === 'ghost' || variant === 'outline'
      ? theme.colors.primary
      : theme.colors.textOnPrimary;

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.button,
          variantStyles[variant],
          disabled && styles.disabled,
          style,
        ]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.9}
        {...props}
      >
        {loading ? (
          <ActivityIndicator color={spinnerColor} />
        ) : (
          <Text style={[styles.text, variantTextStyles[variant]]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  text: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    letterSpacing: 0.5,
  },

  // Variants
  primary: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.purple,
  },
  primaryText: {
    color: theme.colors.textOnPrimary,
  },

  secondary: {
    backgroundColor: theme.colors.secondary,
    ...theme.shadows.red,
  },
  secondaryText: {
    color: theme.colors.textOnPrimary,
  },

  success: {
    backgroundColor: theme.colors.success,
    ...theme.shadows.md,
  },
  successText: {
    color: theme.colors.textOnPrimary,
  },

  danger: {
    backgroundColor: theme.colors.error,
    ...theme.shadows.red,
  },
  dangerText: {
    color: theme.colors.textOnPrimary,
  },

  ghost: {
    backgroundColor: 'transparent',
  },
  ghostText: {
    color: theme.colors.primary,
  },

  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  outlineText: {
    color: theme.colors.primary,
  },

  disabled: {
    opacity: 0.4,
  },
});
