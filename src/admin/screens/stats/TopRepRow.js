/**
 * TopRepRow - Fila del podio con medalla para top repartidores
 * Muestra ranking, nombre, porcentaje de éxito y entregas
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, FONTS, FONT_SIZES, SPACING, RADIUS } from '../../theme';

const medals = ['🥇', '🥈', '🥉'];

export default function TopRepRow({ rank, name, pct, delivered }) {
  return (
    <View style={styles.row}>
      <Text style={styles.medal}>{medals[rank - 1] || '📍'}</Text>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{name}</Text>
        <Text style={styles.stats}>
          {pct}% · {delivered} entregas
        </Text>
      </View>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{pct}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  medal: {
    fontSize: 28,
    marginRight: SPACING.md,
  },
  info: {
    flex: 1,
  },
  name: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.base,
    color: theme.ink,
    marginBottom: 2,
  },
  stats: {
    fontFamily: FONTS.bodySemibold,
    fontSize: FONT_SIZES.sm,
    color: theme.muted,
  },
  badge: {
    backgroundColor: theme.successFg,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.sm,
    color: theme.surface,
  },
});
