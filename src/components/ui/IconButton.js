import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import theme from '../../theme';

/**
 * IconButton component - botón circular con icono
 * @param {React.ReactNode} children - Icono (de Expo Icons)
 * @param {function} onPress - Callback al presionar
 * @param {number} size - Tamaño del botón (default: 40)
 * @param {string} backgroundColor - Color de fondo (default: transparent)
 * @param {boolean} disabled - Si está deshabilitado
 * @param {object} style - Estilos adicionales
 */
export default function IconButton({
  children,
  onPress,
  size = 40,
  backgroundColor = 'transparent',
  disabled = false,
  style,
  ...props
}) {
  const buttonStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor: disabled ? theme.colors.surface : backgroundColor,
  };

  return (
    <TouchableOpacity
      style={[styles.button, buttonStyle, style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
