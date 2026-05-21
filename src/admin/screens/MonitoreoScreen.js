/**
 * MonitoreoScreen - Pantalla 02 - Monitoreo en tiempo real
 * Muestra estado actual de repartidores y entregas en tiempo real
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Lightbulb, ChevronRight } from 'lucide-react-native';
import { theme, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { REPARTIDORES, STATS } from '../data';
import AdminBadge from '../components/AdminBadge';
import { SectionShell } from '../components/primitives';
import CriticalAlert from './monitoreo/CriticalAlert';
import MetricCard from './monitoreo/MetricCard';
import ProgressCard from './monitoreo/ProgressCard';

export default function MonitoreoScreen({ userName = 'Admin', onOpenAnalysis }) {
  const data = STATS;
  const hora = new Date().getHours();
  const esDespuesDeLas10 = hora >= 10;

  return (
    <SectionShell style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <AdminBadge />
        </View>

        <Text style={styles.kicker}>02 — Monitoreo</Text>
        <Text style={styles.greeting}>Hola, {userName} 👋</Text>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Alerta crítica (solo después de las 10 AM) */}
        {esDespuesDeLas10 && <CriticalAlert />}

        {/* 3 Metric Cards */}
        <View style={styles.metricsGrid}>
          <MetricCard
            label="Tasa de éxito"
            value={data.successRate}
            showBar={false}
            color={theme.successFg}
          />
          <MetricCard
            label="Entregados"
            value={data.delivered}
            total={data.assigned}
            showBar={true}
            color={theme.ink}
          />
          <MetricCard
            label="Activos"
            value={data.activeDrivers}
            total={data.totalDrivers}
            showBar={false}
            color={theme.infoFg}
          />
        </View>

        {/* Título de repartidores */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Estado del equipo</Text>
          <Text style={styles.sectionSubtext}>
            {data.activeDrivers} de {data.totalDrivers} en ruta
          </Text>
        </View>

        {/* Cards de progreso por repartidor */}
        {(REPARTIDORES || []).map((rep) => (
          <ProgressCard key={rep.id} repartidor={rep} />
        ))}

        {/* Botón Análisis y sugerencias */}
        <TouchableOpacity
          style={styles.analysisButton}
          onPress={onOpenAnalysis}
          activeOpacity={0.8}
        >
          <View style={styles.analysisIcon}>
            <Lightbulb size={20} color={theme.accent} strokeWidth={2.2} />
          </View>

          <View style={styles.analysisContent}>
            <Text style={styles.analysisTitle}>Análisis y sugerencias</Text>
            <Text style={styles.analysisSubtext}>
              Recomendaciones basadas en el rendimiento actual
            </Text>
          </View>

          <ChevronRight size={24} color={theme.muted} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Espacio final */}
        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </SectionShell>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.canvas,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 6,
  },
  headerTop: {
    marginBottom: 8,
  },
  kicker: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 1.4,
    color: theme.muted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  greeting: {
    fontFamily: FONTS.display,
    fontSize: 26,
    letterSpacing: -0.7,
    lineHeight: 28,
    color: theme.ink,
    marginBottom: SPACING.lg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingTop: 0,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.lg,
  },
  sectionHeader: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.lg,
    color: theme.ink,
    marginBottom: 4,
  },
  sectionSubtext: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: theme.muted,
  },
  analysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    ...SHADOWS.card,
  },
  analysisIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: `${theme.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  analysisContent: {
    flex: 1,
  },
  analysisTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.base,
    color: theme.ink,
    marginBottom: 2,
  },
  analysisSubtext: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: theme.muted,
  },
});
