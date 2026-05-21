import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import theme from '../../theme';

/**
 * Avatar component - muestra iniciales o imagen
 * @param {string} name - Nombre para generar iniciales
 * @param {string} imageUri - URI de la imagen (opcional)
 * @param {number} size - Tamaño del avatar (default: 40)
 * @param {string} backgroundColor - Color de fondo (default: primary)
 * @param {object} style - Estilos adicionales
 */
export default function Avatar({
  name = '',
  imageUri,
  size = 40,
  backgroundColor = theme.colors.primary,
  style,
}) {
  const getInitials = () => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    backgroundColor,
  };

  const textStyle = {
    fontSize: size * 0.4,
  };

  if (imageUri) {
    return (
      <View style={[styles.container, containerStyle, style]}>
        <Image source={{ uri: imageUri }} style={styles.image} />
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle, style]}>
      <Text style={[styles.text, textStyle]}>{getInitials()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  text: {
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.bold,
  },
});
