import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

/**
 * Componente Button reutilizable
 * @param {Object} props
 * @param {string} props.title - Texto del botón
 * @param {Function} props.onPress - Función al presionar
 * @param {string} props.variant - 'primary' | 'secondary' | 'success' | 'danger'
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
  const variantStyles = {
    primary: styles.primary,
    secondary: styles.secondary,
    success: styles.success,
    danger: styles.danger,
  };

  const variantTextStyles = {
    primary: styles.primaryText,
    secondary: styles.secondaryText,
    success: styles.successText,
    danger: styles.dangerText,
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variantStyles[variant],
        disabled && styles.disabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? '#000' : '#fff'} />
      ) : (
        <Text style={[styles.text, variantTextStyles[variant]]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Variants
  primary: {
    backgroundColor: '#2563eb',
  },
  primaryText: {
    color: '#ffffff',
  },

  secondary: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  secondaryText: {
    color: '#334155',
  },

  success: {
    backgroundColor: '#10b981',
  },
  successText: {
    color: '#ffffff',
  },

  danger: {
    backgroundColor: '#ef4444',
  },
  dangerText: {
    color: '#ffffff',
  },

  disabled: {
    opacity: 0.5,
  },
});
