/**
 * MetricCard - Card compacta para métricas con barra de progreso opcional
 * Usada en MonitoreoScreen para mostrar métricas principales
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../../theme';
import CountUp from '../../components/CountUp';

export default function MetricCard({ label, value, total, showBar = false, color = theme.ink }) {
  const percentage = total ? Math.round((value / total) * 100) : 0;

  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.valueRow}>
        <Text style={[styles.value, { color }]}>
          <CountUp value={value} />
        </Text>
        {total && (
          <Text style={styles.total}> / {total}</Text>
        )}
      </View>

      {showBar && (
        <View style={styles.barContainer}>
          <View style={[styles.bar, { width: `${percentage}%`, backgroundColor: color }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: theme.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    ...SHADOWS.card,
  },
  label: {
    fontFamily: FONTS.bodySemibold,
    fontSize: FONT_SIZES.xs,
    color: theme.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.sm,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  value: {
    fontFamily: FONTS.displayBlack,
    fontSize: FONT_SIZES.xxxl,
    letterSpacing: -1,
  },
  total: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.base,
    color: theme.muted,
  },
  barContainer: {
    height: 4,
    backgroundColor: theme.canvas,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: SPACING.sm,
  },
  bar: {
    height: '100%',
    borderRadius: 2,
  },
});
