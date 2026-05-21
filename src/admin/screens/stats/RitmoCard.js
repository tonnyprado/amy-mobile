/**
 * RitmoCard - Banner verde/azul/rojo según ritmo de entregas
 * Muestra si van adelante, bien o atrasado respecto al objetivo
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, FONTS, FONT_SIZES, RADIUS, SPACING, SHADOWS } from '../../theme';

export default function RitmoCard({ successRate, expectedPct }) {
  // Calcular ritmo
  let ritmo = 'bien';
  let color = theme.infoFg;
  let bgColor = theme.infoBg;
  let icon = '⚡';
  let title = 'Buen Ritmo';
  let message = 'Mantener el paso';

  if (successRate >= expectedPct) {
    ritmo = 'adelante';
    color = theme.successFg;
    bgColor = theme.successBg;
    icon = '🚀';
    title = 'Excelente Ritmo';
    message = 'Van adelante del objetivo';
  } else if (successRate < expectedPct - 10) {
    ritmo = 'atrasado';
    color = theme.dangerFg;
    bgColor = theme.dangerBg;
    icon = '⚠️';
    title = 'Ritmo Lento';
    message = 'Necesitan acelerar';
  }

  return (
    <View style={[styles.card, { backgroundColor: bgColor }, SHADOWS.card]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color }]}>{title}</Text>
          <Text style={[styles.message, { color }]}>{message}</Text>
        </View>
      </View>

      <View style={styles.detail}>
        <Text style={styles.detailText}>
          Esperado: {expectedPct}% | Real: {successRate}%
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  icon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: FONTS.displayBlack,
    fontSize: FONT_SIZES.xl,
    marginBottom: 2,
  },
  message: {
    fontFamily: FONTS.bodySemibold,
    fontSize: FONT_SIZES.sm,
  },
  detail: {
    marginTop: 4,
  },
  detailText: {
    fontFamily: FONTS.bodySemibold,
    fontSize: FONT_SIZES.xs,
    color: theme.muted,
  },
});
