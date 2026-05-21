// src/screens/auth/components/SoftBackdrop.js
// Fondo decorativo detrás del Lottie. Tres variantes:
//   - 'circle' (default): dos blobs del accent (sin blur en RN)
//   - 'grid':              patrón de puntos
//   - 'none':              sin decoración

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, Pattern, Circle, Rect } from 'react-native-svg';

export default function SoftBackdrop({ theme, intensity = 1, variant = 'circle' }) {
  if (variant === 'none') return null;

  if (variant === 'grid') {
    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg style={StyleSheet.absoluteFill} opacity={0.5}>
          <Defs>
            <Pattern
              id="amy-grid"
              x="0"
              y="0"
              width="22"
              height="22"
              patternUnits="userSpaceOnUse"
            >
              <Circle cx="1.2" cy="1.2" r="1.2" fill={theme.accent} opacity="0.18" />
            </Pattern>
          </Defs>
          <Rect width="100%" height="100%" fill="url(#amy-grid)" />
        </Svg>
      </View>
    );
  }

  // Variante circle: dos blobs translúcidos sin blur
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View
        style={{
          position: 'absolute',
          top: '-8%',
          left: '-15%',
          width: 240,
          height: 240,
          borderRadius: 120,
          backgroundColor: theme.accent,
          opacity: 0.18 * intensity,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: '20%',
          right: '-20%',
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: theme.accentDk,
          opacity: 0.14 * intensity,
        }}
      />
    </View>
  );
}
