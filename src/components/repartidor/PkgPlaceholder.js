// src/components/repartidor/PkgPlaceholder.js
// Cajita ilustrada de paquete con la etiqueta

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS } from '../../theme/repartidorTheme';

const TONES = {
  a: ['#FFCE3B', '#1A1A1A'],
  b: ['#FF7A45', '#1A1A1A'],
  c: ['#3D6BFF', '#FFFFFF'],
  d: ['#1A1A1A', '#FFFFFF'],
};

export default function PkgPlaceholder({ tone = 'a', size = 64, label }) {
  const [bg, fg] = TONES[tone];

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor: bg,
          transform: [{ rotate: '-4deg' }],
        },
      ]}
    >
      <Text style={[styles.fragile, { color: fg }]}>FRAGILE</Text>
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
      {/* Barcode pattern - simplified for RN */}
      <View style={[styles.barcode, { backgroundColor: fg }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 8,
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 7,
  },
  fragile: {
    fontSize: 8,
    opacity: 0.8,
    letterSpacing: 0.4,
    fontFamily: FONTS.bodyBold,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 12,
    fontFamily: FONTS.bodyBold,
  },
  barcode: {
    position: 'absolute',
    bottom: 7,
    left: 7,
    right: 7,
    height: 8,
    opacity: 0.7,
  },
});
