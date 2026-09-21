/**
 * Utilidades para estilos cross-platform (iOS/Android)
 *
 * Este archivo proporciona helpers para crear estilos que se adapten
 * automáticamente según la plataforma (iOS o Android).
 */

import { Platform, StyleSheet } from 'react-native';

/**
 * Retorna un valor según la plataforma actual
 * @param {Object} options - Objeto con keys 'ios' y 'android'
 * @returns {any} El valor correspondiente a la plataforma
 */
export const platformValue = (options) => {
  return Platform.select(options);
};

/**
 * Estilos de sombra optimizados por plataforma
 * iOS usa shadowOffset, shadowOpacity, shadowRadius
 * Android usa elevation
 *
 * @param {number} elevation - Nivel de elevación (1-24)
 * @returns {Object} Estilos de sombra compatibles
 */
export const platformShadow = (elevation = 4) => {
  return Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: elevation / 2,
      },
      shadowOpacity: 0.1 + (elevation * 0.01),
      shadowRadius: elevation,
    },
    android: {
      elevation: elevation,
    },
  });
};

/**
 * Padding para status bar (área superior del dispositivo)
 * @returns {number} Padding superior según plataforma
 */
export const statusBarPadding = () => {
  return Platform.select({
    ios: 20,  // Status bar en iOS
    android: 0,  // Status bar se maneja con SafeAreaView en Android
  });
};

/**
 * Padding para botón de home (área inferior en iPhone X+)
 * @returns {number} Padding inferior según plataforma
 */
export const homeIndicatorPadding = () => {
  return Platform.select({
    ios: 34,  // Home indicator en iPhone X+
    android: 0,
  });
};

/**
 * Altura de header según plataforma
 * @returns {number} Altura recomendada
 */
export const headerHeight = () => {
  return Platform.select({
    ios: 44,
    android: 56,
  });
};

/**
 * Tamaño de fuente ajustado por plataforma
 * Android tiende a renderizar fuentes ligeramente más grandes
 * @param {number} size - Tamaño base
 * @returns {number} Tamaño ajustado
 */
export const platformFontSize = (size) => {
  return Platform.select({
    ios: size,
    android: size * 0.95,  // Reducir 5% en Android
  });
};

/**
 * Border radius según diseño material (Android) vs iOS
 * @param {number} radius - Radio base
 * @returns {number} Radio ajustado
 */
export const platformBorderRadius = (radius) => {
  return Platform.select({
    ios: radius,
    android: radius * 0.75,  // Material Design usa bordes menos redondeados
  });
};

/**
 * Estilos para botones según plataforma
 * @param {string} type - Tipo de botón ('primary', 'secondary', 'text')
 * @returns {Object} Estilos de botón
 */
export const platformButton = (type = 'primary') => {
  const baseStyles = {
    primary: {
      height: Platform.select({ ios: 50, android: 48 }),
      borderRadius: Platform.select({ ios: 12, android: 8 }),
      paddingHorizontal: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    secondary: {
      height: Platform.select({ ios: 44, android: 42 }),
      borderRadius: Platform.select({ ios: 10, android: 6 }),
      paddingHorizontal: 20,
      borderWidth: Platform.select({ ios: 1.5, android: 1 }),
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      height: Platform.select({ ios: 40, android: 38 }),
      paddingHorizontal: 16,
      justifyContent: 'center',
      alignItems: 'center',
    },
  };

  return {
    ...baseStyles[type],
    ...Platform.select({
      android: {
        ...platformShadow(2),
      },
      ios: {},
    }),
  };
};

/**
 * Estilos para cards/tarjetas según plataforma
 * @param {number} elevation - Nivel de elevación (1-24)
 * @returns {Object} Estilos de card
 */
export const platformCard = (elevation = 2) => {
  return {
    backgroundColor: '#FFFFFF',
    borderRadius: Platform.select({ ios: 16, android: 12 }),
    padding: Platform.select({ ios: 16, android: 14 }),
    ...platformShadow(elevation),
    // Android usa borders sutiles junto con elevation
    ...Platform.select({
      android: {
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
      },
      ios: {},
    }),
  };
};

/**
 * Estilos para inputs según plataforma
 * @returns {Object} Estilos de input
 */
export const platformInput = () => {
  return {
    height: Platform.select({ ios: 48, android: 52 }),
    borderRadius: Platform.select({ ios: 12, android: 8 }),
    paddingHorizontal: 16,
    fontSize: platformFontSize(16),
    borderWidth: Platform.select({ ios: 1.5, android: 1 }),
    ...Platform.select({
      android: {
        paddingTop: 12,
        paddingBottom: 12,
      },
      ios: {},
    }),
  };
};

/**
 * Verifica si es iOS
 * @returns {boolean}
 */
export const isIOS = () => Platform.OS === 'ios';

/**
 * Verifica si es Android
 * @returns {boolean}
 */
export const isAndroid = () => Platform.OS === 'android';

/**
 * Obtiene la versión del OS
 * @returns {number}
 */
export const osVersion = () => Platform.Version;

/**
 * Estilos para bottom navigation/tabs
 * @returns {Object} Estilos de bottom nav
 */
export const platformBottomNav = () => {
  return {
    height: Platform.select({
      ios: 82,  // 48 + 34 (home indicator)
      android: 56
    }),
    paddingBottom: Platform.select({
      ios: 34,  // Safe area en iPhone X+
      android: 8
    }),
    paddingTop: Platform.select({
      ios: 8,
      android: 8
    }),
    ...platformShadow(8),
    borderTopWidth: Platform.select({
      ios: 0,
      android: 1,
    }),
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  };
};

/**
 * Helper para crear estilos con Platform.select inline
 * Ejemplo: ps({ ios: { color: 'red' }, android: { color: 'blue' } })
 */
export const ps = Platform.select;

// Exportar todo como default también
export default {
  platformValue,
  platformShadow,
  statusBarPadding,
  homeIndicatorPadding,
  headerHeight,
  platformFontSize,
  platformBorderRadius,
  platformButton,
  platformCard,
  platformInput,
  platformBottomNav,
  isIOS,
  isAndroid,
  osVersion,
  ps,
};
