/**
 * AlertsStrip - Pill central de alertas activas
 * Muestra cantidad de alertas alta/media con colores
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, FONTS, FONT_SIZES, RADIUS, SPACING, SHADOWS } from '../../theme';

export default function AlertsStrip({ high = 0, mid = 0 }) {
  const total = high + mid;

  if (total === 0) return null;

  return (
    <View style={[styles.strip, SHADOWS.card]}>
      <Text style={styles.icon}>🚨</Text>
      <Text style={styles.text}>
        Alertas activas: {total}
      </Text>

      <View style={styles.badges}>
        {high > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.dangerBg }]}>
            <Text style={[styles.badgeText, { color: theme.dangerFg }]}>
              {high} ALTA
            </Text>
          </View>
        )}
        {mid > 0 && (
          <View style={[styles.badge, { backgroundColor: theme.warnBg }]}>
            <Text style={[styles.badgeText, { color: '#A86A12' }]}>
              {mid} MEDIA
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  strip: {
    backgroundColor: theme.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  icon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },
  text: {
    flex: 1,
    fontFamily: FONTS.bodySemibold,
    fontSize: FONT_SIZES.base,
    color: theme.ink,
  },
  badges: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 0.5,
  },
});
