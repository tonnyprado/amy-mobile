/**
 * StatsScreen - Pantalla 01 - Estadísticas e incidencias  
 * Diseño según Image 2 del usuario
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ScanLine, RefreshCw, CheckCircle2, Package, Truck, TrendingUp, AlertTriangle, Grid3x3, ChevronRight, Rocket, Settings } from 'lucide-react-native';
import { theme, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import AdminBadge from '../components/AdminBadge';
import { SectionShell } from '../components/primitives';

export default function StatsScreen({ data, onOpenScanner, onOpenMoreDetails, onRefresh, onOpenSettings }) {
  // Mostrar loading si no hay datos aún
  if (!data) {
    return (
      <SectionShell style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
          <Text style={styles.loadingText}>Cargando estadísticas...</Text>
        </View>
      </SectionShell>
    );
  }

  // Calcular progreso
  const progressPct = Math.round((data.delivered / data.assigned) * 100);

  // Determinar ritmo
  const ritmo = data.successRate >= data.expectedPct
    ? { status: 'excelente', color: '#0B7E3E', bg: '#E6F4ED', icon: Rocket }
    : data.successRate >= data.expectedPct - 10
    ? { status: 'bien', color: '#1E5B8C', bg: '#ECF1F8', icon: TrendingUp }
    : { status: 'lento', color: '#B83A22', bg: '#FCEAE6', icon: AlertTriangle };

  return (
    <SectionShell style={styles.container} statusBarHeight={0}>
      {/* Header */}
      <View style={styles.header}>
        <AdminBadge />
        <View style={styles.headerButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={onOpenScanner}>
            <ScanLine size={20} color={theme.surface} strokeWidth={2.5} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={onRefresh}>
            <RefreshCw size={18} color={theme.surface} strokeWidth={2.5} />
          </TouchableOpacity>
          {onOpenSettings && (
            <TouchableOpacity style={styles.settingsButton} onPress={onOpenSettings}>
              <Settings size={18} color={theme.ink} strokeWidth={2.5} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Título */}
        <Text style={styles.title}>Estadísticas</Text>

        {/* 3 Hero Stats */}
        <View style={styles.heroRow}>
          {/* Éxito */}
          <View style={[styles.heroCard, { backgroundColor: '#E6F4ED' }]}>
            <View style={[styles.heroIcon, { backgroundColor: '#C5E6D6' }]}>
              <CheckCircle2 size={20} color="#0B7E3E" strokeWidth={2.5} />
            </View>
            <Text style={[styles.heroValue, { color: '#0B7E3E' }]}>{data.successRate}%</Text>
            <Text style={[styles.heroLabel, { color: '#0B7E3E' }]}>ÉXITO</Text>
          </View>

          {/* Entregados */}
          <View style={[styles.heroCard, { backgroundColor: theme.ink }]}>
            <View style={[styles.heroIcon, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <Package size={20} color={theme.surface} strokeWidth={2.5} />
            </View>
            <Text style={[styles.heroValue, { color: theme.surface }]}>{data.delivered}</Text>
            <Text style={[styles.heroLabel, { color: 'rgba(255,255,255,0.7)' }]}>ENTREGADOS</Text>
            <Text style={[styles.heroSubtext, { color: 'rgba(255,255,255,0.5)' }]}>de {data.assigned}</Text>
          </View>

          {/* Activos */}
          <View style={[styles.heroCard, { backgroundColor: '#ECF1F8' }]}>
            <View style={[styles.heroIcon, { backgroundColor: '#D6E2F1' }]}>
              <Truck size={20} color="#1E5B8C" strokeWidth={2.5} />
            </View>
            <Text style={[styles.heroValue, { color: '#1E5B8C' }]}>{data.activeDrivers}</Text>
            <Text style={[styles.heroLabel, { color: '#1E5B8C' }]}>ACTIVOS</Text>
            <Text style={[styles.heroSubtext, { color: '#6B8199' }]}>de {data.totalDrivers}</Text>
          </View>
        </View>

        {/* Progreso del Día */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <TrendingUp size={18} color={theme.ink} strokeWidth={2.2} />
            <Text style={styles.progressTitle}>PROGRESO DEL DÍA</Text>
          </View>

          <View style={styles.progressMain}>
            <Text style={styles.progressValue}>{progressPct}%</Text>
            <Text style={styles.progressCount}>{data.delivered} / {data.assigned}</Text>
          </View>

          {/* Barra de progreso */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${progressPct}%` }]} />
          </View>

          {/* Mini boxes */}
          <View style={styles.miniBoxesRow}>
            <View style={[styles.miniBox, { backgroundColor: '#E6F4ED' }]}>
              <Text style={[styles.miniValue, { color: '#0B7E3E' }]}>{data.delivered}</Text>
              <Text style={[styles.miniLabel, { color: '#0B7E3E' }]}>ENTREGADOS</Text>
            </View>

            <View style={[styles.miniBox, { backgroundColor: '#ECF1F8' }]}>
              <Text style={[styles.miniValue, { color: '#1E5B8C' }]}>{data.inRoute}</Text>
              <Text style={[styles.miniLabel, { color: '#1E5B8C' }]}>EN RUTA</Text>
            </View>

            <View style={[styles.miniBox, { backgroundColor: '#FFF6E6' }]}>
              <Text style={[styles.miniValue, { color: '#B87A00' }]}>{data.pending}</Text>
              <Text style={[styles.miniLabel, { color: '#B87A00' }]}>PENDIENTES</Text>
            </View>
          </View>
        </View>

        {/* Análisis de Ritmo */}
        <View style={[styles.ritmoCard, { backgroundColor: ritmo.bg }]}>
          <View style={[styles.ritmoIcon, { backgroundColor: `${ritmo.color}20` }]}>
            <Rocket size={24} color={ritmo.color} strokeWidth={2} />
          </View>

          <View style={styles.ritmoContent}>
            <Text style={[styles.ritmoKicker, { color: ritmo.color }]}>ANÁLISIS DE RITMO</Text>
            <Text style={[styles.ritmoTitle, { color: ritmo.color }]}>
              {ritmo.status === 'excelente' && 'Excelente ritmo'}
              {ritmo.status === 'bien' && 'Buen ritmo'}
              {ritmo.status === 'lento' && 'Ritmo lento'}
            </Text>
            <Text style={[styles.ritmoSubtext, { color: ritmo.color }]}>
              {ritmo.status === 'excelente' && 'Vamos adelante del objetivo'}
              {ritmo.status === 'bien' && 'Vamos al ritmo esperado'}
              {ritmo.status === 'lento' && 'Necesitamos acelerar'}
            </Text>
            <Text style={[styles.ritmoStats, { color: ritmo.color }]}>
              Esperado: {data.expectedPct}% · Real: {data.successRate}%
            </Text>
          </View>
        </View>

        {/* Alertas Activas */}
        {(data.alerts.high + data.alerts.mid) > 0 && (
          <View style={styles.alertasCard}>
            <View style={styles.alertasIcon}>
              <AlertTriangle size={20} color="#B83A22" strokeWidth={2.5} />
            </View>
            <View style={styles.alertasContent}>
              <Text style={styles.alertasTitle}>
                ALERTAS ACTIVAS · {data.alerts.high + data.alerts.mid} EN TOTAL
              </Text>
              <Text style={styles.alertasSubtext}>
                {data.alerts.high} alta · {data.alerts.mid} media
              </Text>
            </View>
          </View>
        )}

        {/* Ver más detalles */}
        <TouchableOpacity
          style={styles.moreButton}
          onPress={onOpenMoreDetails}
          activeOpacity={0.8}
        >
          <View style={styles.moreIcon}>
            <Grid3x3 size={20} color={theme.accent} strokeWidth={2.2} />
          </View>
          <View style={styles.moreContent}>
            <Text style={styles.moreTitle}>Ver más detalles</Text>
            <Text style={styles.moreSubtext}>
              Incidencias · Intentos · Top repartidores · Métricas
            </Text>
          </View>
          <ChevronRight size={24} color={theme.muted} strokeWidth={2.5} />

          {/* Badge */}
          <View style={styles.moreBadge}>
            <Text style={styles.moreBadgeText}>4</Text>
          </View>
        </TouchableOpacity>

        {/* Espacio final */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </SectionShell>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.accent,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.xl,
    paddingTop: 54, // Status bar height
    paddingBottom: SPACING.sm,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: theme.ink,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
  },
  title: {
    fontFamily: FONTS.displayBlack,
    fontSize: 28,
    letterSpacing: -0.5,
    color: theme.ink,
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  heroRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  heroCard: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  heroValue: {
    fontFamily: FONTS.displayBlack,
    fontSize: 32,
    letterSpacing: -0.5,
  },
  heroLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  heroSubtext: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.xs,
    marginTop: 2,
  },
  progressCard: {
    backgroundColor: theme.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  },
  progressTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.sm,
    letterSpacing: 1,
    color: theme.ink,
  },
  progressMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
  },
  progressValue: {
    fontFamily: FONTS.displayBlack,
    fontSize: 48,
    letterSpacing: -1,
    color: theme.ink,
  },
  progressCount: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.lg,
    color: theme.muted,
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: theme.canvas,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#0B7E3E',
    borderRadius: RADIUS.full,
  },
  miniBoxesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  miniBox: {
    flex: 1,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
  },
  miniValue: {
    fontFamily: FONTS.displayBlack,
    fontSize: 24,
    letterSpacing: -0.5,
  },
  miniLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.xs - 1,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 2,
  },
  ritmoCard: {
    flexDirection: 'row',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  ritmoIcon: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ritmoContent: {
    flex: 1,
  },
  ritmoKicker: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.xs - 1,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  ritmoTitle: {
    fontFamily: FONTS.displayBlack,
    fontSize: FONT_SIZES.xl,
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  ritmoSubtext: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    marginBottom: 6,
  },
  ritmoStats: {
    fontFamily: FONTS.bodySemibold,
    fontSize: FONT_SIZES.sm,
  },
  alertasCard: {
    flexDirection: 'row',
    backgroundColor: '#FCEAE6',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    gap: SPACING.md,
  },
  alertasIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: '#F5C4B8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertasContent: {
    flex: 1,
  },
  alertasTitle: {
    fontFamily: FONTS.displayBlack,
    fontSize: FONT_SIZES.base,
    color: '#B83A22',
    marginBottom: 4,
  },
  alertasSubtext: {
    fontFamily: FONTS.bodySemibold,
    fontSize: FONT_SIZES.sm,
    color: '#B83A22',
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.ink,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    position: 'relative',
  },
  moreIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: theme.accent + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  moreContent: {
    flex: 1,
  },
  moreTitle: {
    fontFamily: FONTS.displayBlack,
    fontSize: FONT_SIZES.lg,
    color: theme.surface,
    marginBottom: 2,
  },
  moreSubtext: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  moreBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreBadgeText: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.sm,
    color: theme.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.base,
    color: theme.muted,
  },
});
