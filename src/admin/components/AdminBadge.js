/**
 * AdminBadge - Pill negra "PANEL ADMIN"
 * Aparece en todos los headers del admin para diferenciar visualmente del repartidor
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, FONTS, FONT_SIZES, RADIUS } from '../theme';

export default function AdminBadge() {
  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>PANEL ADMIN</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: theme.ink,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.xs,
    color: theme.surface,
    letterSpacing: 0.8,
  },
});
