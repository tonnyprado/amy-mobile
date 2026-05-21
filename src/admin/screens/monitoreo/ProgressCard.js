/**
 * ProgressCard - Card por repartidor con progreso y mini-stats
 * Muestra avatar, nombre, progreso y barra de avance
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Package, MapPin, CheckCircle2 } from 'lucide-react-native';
import { theme, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../../theme';

export default function ProgressCard({ repartidor }) {
  const { name, tag, color, progress, status } = repartidor;
  const { total, done, route, pct } = progress;

  const statusConfig = {
    enRuta: { label: 'En ruta', color: theme.infoFg, bg: theme.infoBg },
    libre: { label: 'Libre', color: theme.muted, bg: theme.canvas },
    descanso: { label: 'Descanso', color: theme.successFg, bg: theme.successBg },
  };

  const currentStatus = statusConfig[status] || statusConfig.libre;

  return (
    <View style={styles.card}>
      {/* Header con avatar y nombre */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Text style={styles.avatarText}>{tag}</Text>
        </View>

        <View style={styles.nameContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: currentStatus.bg }]}>
            <Text style={[styles.statusText, { color: currentStatus.color }]}>
              {currentStatus.label}
            </Text>
          </View>
        </View>

        <Text style={styles.percentage}>{pct}%</Text>
      </View>

      {/* Barra de progreso */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>

      {/* Mini stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Package size={14} color={theme.muted} strokeWidth={2} />
          <Text style={styles.statText}>
            {done}/{total}
          </Text>
        </View>

        <View style={styles.stat}>
          <MapPin size={14} color={theme.muted} strokeWidth={2} />
          <Text style={styles.statText}>Ruta {route}</Text>
        </View>

        {done > 0 && (
          <View style={styles.stat}>
            <CheckCircle2 size={14} color={theme.successFg} strokeWidth={2} />
            <Text style={[styles.statText, { color: theme.successFg }]}>{done}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.lg,
    color: theme.ink,
  },
  nameContainer: {
    flex: 1,
  },
  name: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.base,
    color: theme.ink,
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  statusText: {
    fontFamily: FONTS.bodySemibold,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 0.4,
  },
  percentage: {
    fontFamily: FONTS.displayBlack,
    fontSize: FONT_SIZES.xxl,
    color: theme.ink,
    letterSpacing: -0.5,
  },
  progressBar: {
    height: 6,
    backgroundColor: theme.canvas,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontFamily: FONTS.bodySemibold,
    fontSize: FONT_SIZES.sm,
    color: theme.muted,
  },
});
