/**
 * Componentes primitivos reutilizables
 * Block · HeroStat · MiniBox · Pill · SectionShell
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme, FONTS, SPACING, RADIUS, SHADOWS, FONT_SIZES } from '../theme';

/**
 * SectionShell - Contenedor con padding para status bar e indicator
 */
export function SectionShell({ children, statusBarHeight = 54, homeIndicatorHeight = 30, style }) {
  return (
    <View style={[styles.sectionShell, style]}>
      {/* Status bar overlay */}
      <View style={{ height: statusBarHeight }} />

      {/* Content */}
      <View style={styles.sectionContent}>{children}</View>

      {/* Home indicator space */}
      <View style={{ height: homeIndicatorHeight }} />
    </View>
  );
}

/**
 * Block - Componente genérico para construir layouts
 */
export function Block({ children, style, ...props }) {
  return <View style={style} {...props}>{children}</View>;
}

/**
 * Pill - Chip pequeño uppercase
 */
export function Pill({ children, color = theme.muted, bg = theme.canvas, style }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }, style]}>
      <Text style={[styles.pillText, { color }]}>
        {typeof children === 'string' ? children.toUpperCase() : children}
      </Text>
    </View>
  );
}

/**
 * HeroStat - Stat card grande para dashboard
 */
export function HeroStat({ value, label, bgColor = theme.statsCardTinted, textColor = theme.ink, style }) {
  return (
    <View style={[styles.heroStat, { backgroundColor: bgColor }, SHADOWS.card, style]}>
      <Text style={[styles.heroStatValue, { color: textColor }]}>{value}</Text>
      <Text style={[styles.heroStatLabel, { color: textColor, opacity: 0.7 }]}>
        {label}
      </Text>
    </View>
  );
}

/**
 * MiniBox - Card pequeña para métricas secundarias
 */
export function MiniBox({ value, label, style }) {
  return (
    <View style={[styles.miniBox, style]}>
      <Text style={styles.miniBoxValue}>{value}</Text>
      <Text style={styles.miniBoxLabel}>{label}</Text>
    </View>
  );
}

/**
 * IntentoBox - Card para intentos de entrega
 */
export function IntentoBox({ value, label, color = theme.successFg, style }) {
  return (
    <View style={[styles.intentoBox, style]}>
      <Text style={[styles.intentoValue, { color }]}>{value}</Text>
      <Text style={[styles.intentoLabel, { color }]}>{label}</Text>
    </View>
  );
}

/**
 * SmallMetric - Métrica pequeña inline
 */
export function SmallMetric({ label, value, style }) {
  return (
    <View style={[styles.smallMetric, style]}>
      <Text style={styles.smallMetricLabel}>{label}</Text>
      <Text style={styles.smallMetricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // SectionShell
  sectionShell: {
    flex: 1,
    backgroundColor: theme.canvas,
  },
  sectionContent: {
    flex: 1,
  },

  // Pill
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },
  pillText: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 0.6,
  },

  // HeroStat
  heroStat: {
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
  },
  heroStatValue: {
    fontFamily: FONTS.displayBlack,
    fontSize: FONT_SIZES.hero,
    letterSpacing: -1,
    marginBottom: SPACING.xs,
  },
  heroStatLabel: {
    fontFamily: FONTS.bodySemibold,
    fontSize: FONT_SIZES.base,
    letterSpacing: 0.3,
  },

  // MiniBox
  miniBox: {
    backgroundColor: theme.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    flex: 1,
    ...SHADOWS.card,
  },
  miniBoxValue: {
    fontFamily: FONTS.displayBlack,
    fontSize: FONT_SIZES.xxxl,
    color: theme.ink,
    marginBottom: SPACING.xs,
  },
  miniBoxLabel: {
    fontFamily: FONTS.bodySemibold,
    fontSize: FONT_SIZES.xs,
    color: theme.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },

  // IntentoBox
  intentoBox: {
    backgroundColor: theme.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    minWidth: 70,
    ...SHADOWS.card,
  },
  intentoValue: {
    fontFamily: FONTS.displayBlack,
    fontSize: FONT_SIZES.xxl,
    marginBottom: 4,
  },
  intentoLabel: {
    fontFamily: FONTS.bodySemibold,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 0.3,
  },

  // SmallMetric
  smallMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  smallMetricLabel: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: theme.muted,
  },
  smallMetricValue: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.base,
    color: theme.ink,
  },
});
