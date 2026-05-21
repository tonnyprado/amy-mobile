// src/components/repartidor/Pill.js
// Etiqueta pequeña tipo badge / chip para la UI del repartidor

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS } from '../../theme/repartidorTheme';

export default function Pill({ children, bg, color, style }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    fontFamily: FONTS.bodyBold,
  },
});
