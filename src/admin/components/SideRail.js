/**
 * SideRail - Indicador lateral de puntos
 * Muestra qué pantalla está activa y permite saltar entre ellas
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme';

const DEFAULT_SCREENS = [
  { id: 'stats', name: 'Estadísticas' },
  { id: 'chat', name: 'Chat' },
];

export default function SideRail({ activeSection = 0, screens = DEFAULT_SCREENS, onPress }) {
  return (
    <View style={styles.rail}>
      {(screens || DEFAULT_SCREENS).map((screen, index) => (
        <TouchableOpacity
          key={screen.id || index}
          onPress={() => onPress?.(index)}
          style={styles.dotContainer}
          activeOpacity={0.7}
          disabled={!onPress}
        >
          <View
            style={[
              styles.dot,
              activeSection === index && styles.dotActive,
            ]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    position: 'absolute',
    right: 8,
    top: '50%',
    transform: [{ translateY: -40 }],
    gap: 12,
    zIndex: 50,
  },
  dotContainer: {
    padding: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.border,
  },
  dotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.accent,
  },
});
