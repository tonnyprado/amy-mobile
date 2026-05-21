/**
 * StatsScreen - Pantalla 01 - Estadísticas e incidencias
 * Fondo coral (theme.accent) - Es la primera pantalla por default
 * Las animaciones se repiten cada vez que se vuelve a esta pantalla (gracias al key prop)
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { ScanLine, RotateCw, TrendingUp, ChevronRight } from 'lucide-react-native';
import { theme, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { STATS } from '../data';
import AdminBadge from '../components/AdminBadge';
import CountUp from '../components/CountUp';
import { SectionShell, HeroStat, IntentoBox, SmallMetric } from '../components/primitives';
import RitmoCard from './stats/RitmoCard';
import AlertsStrip from './stats/AlertsStrip';

export default function StatsScreen({ onOpenScanner, onOpenMoreDetails, onRefresh }) {
  const data = STATS;

  // Animaciones de entrada para cards
  const fadeAnim1 = useRef(new Animated.Value(0)).current;
  const fadeAnim2 = useRef(new Animated.Value(0)).current;
  const fadeAnim3 = useRef(new Animated.Value(0)).current;
  const fadeAnim4 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Animar cards con stagger
    Animated.stagger(80, [
      Animated.timing(fadeAnim1, {
        toValue: 1,
        duration: 750,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim2, {
        toValue: 1,
        duration: 750,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim3, {
        toValue: 1,
        duration: 750,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim4, {
        toValue: 1,
        duration: 750,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SectionShell style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AdminBadge />
          <Text style={styles.kicker}>01 — Operación de hoy</Text>
          <Text style={styles.title}>
            Estadísticas{'\n'}e incidencias
          </Text>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.scanButton}
            onPress={onOpenScanner}
            activeOpacity={0.8}
          >
            <ScanLine size={17} color={theme.canvas} strokeWidth={2.2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            activeOpacity={0.8}
          >
            <RotateCw size={16} color={theme.ink} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Scrollable content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 3 Hero Stats */}
        <Animated.View style={[styles.heroStatsGrid, { opacity: fadeAnim1 }]}>
          <HeroStat
            value={<CountUp value={data.successRate} suffix="%" />}
            label="Éxito"
            bgColor={theme.successBg}
            textColor={theme.successFg}
            style={styles.heroStat}
          />
          <HeroStat
            value={<CountUp value={data.delivered} />}
            label="Entregados"
            bgColor={theme.ink}
            textColor={theme.surface}
            style={styles.heroStat}
          />
          <HeroStat
            value={<CountUp value={data.activeDrivers} />}
            label="Activos"
            bgColor={theme.infoBg}
            textColor={theme.infoFg}
            style={styles.heroStat}
          />
        </Animated.View>

        {/* Progreso del día */}
        <Animated.View style={[styles.card, { opacity: fadeAnim2 }]}>
          <View style={styles.cardHeader}>
            <TrendingUp size={18} color={theme.ink} strokeWidth={2.2} />
            <Text style={styles.cardTitle}>Progreso del día</Text>
          </View>

          <View style={styles.progressHeader}>
            <Text style={styles.progressValue}>
              <CountUp value={data.successRate} />%
            </Text>
            <Text style={styles.progressSubtext}>
              <CountUp value={data.delivered} /> / {data.assigned}
            </Text>
          </View>

          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${data.successRate}%` }]} />
          </View>

          <View style={styles.miniStatsGrid}>
            <SmallMetric label="En ruta" value={data.inRoute} />
            <SmallMetric label="Pendientes" value={data.pending} />
          </View>
        </Animated.View>

        {/* RitmoCard */}
        <Animated.View style={{ opacity: fadeAnim2 }}>
          <RitmoCard
            successRate={data.successRate}
            expectedPct={data.expectedPct}
          />
        </Animated.View>

        {/* AlertsStrip */}
        <Animated.View style={{ opacity: fadeAnim3 }}>
          <AlertsStrip high={data.alerts.high} mid={data.alerts.mid} />
        </Animated.View>

        {/* Intentos de entrega */}
        <Animated.View style={[styles.card, { opacity: fadeAnim3 }]}>
          <Text style={styles.cardTitle}>Intentos de entrega</Text>
          <View style={styles.intentosGrid}>
            <IntentoBox
              value={data.intentos.uno}
              label="1er intento"
              color={theme.successFg}
            />
            <IntentoBox
              value={data.intentos.dos}
              label="2do intento"
              color="#f59e0b"
            />
            <IntentoBox
              value={data.intentos.tres}
              label="3er intento"
              color={theme.dangerFg}
            />
          </View>
        </Animated.View>

        {/* Botón Ver más detalles */}
        <Animated.View style={{ opacity: fadeAnim4 }}>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={onOpenMoreDetails}
            activeOpacity={0.8}
          >
            <View style={styles.moreButtonContent}>
              <Text style={styles.moreButtonText}>Ver más detalles</Text>
              <Text style={styles.moreButtonSub}>
                Incidencias · Top repartidores · Métricas
              </Text>
            </View>
            <ChevronRight size={24} color={theme.surface} strokeWidth={2.5} />
          </TouchableOpacity>
        </Animated.View>

        {/* Avisos (si > 0) */}
        {data.avisos > 0 && (
          <Animated.View style={[styles.avisosCard, { opacity: fadeAnim4 }]}>
            <View style={styles.avisosHeader}>
              <Text style={styles.avisosIcon}>📢</Text>
              <View style={styles.avisosTexts}>
                <Text style={styles.avisosTitle}>Pedidos tipo AVISO</Text>
                <Text style={styles.avisosSubtext}>
                  {data.avisos} pedido{data.avisos !== 1 ? 's' : ''} requiere
                  {data.avisos !== 1 ? 'n' : ''} atención especial
                </Text>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Métricas finales */}
        <Animated.View style={[styles.card, { opacity: fadeAnim4 }]}>
          <Text style={styles.cardTitle}>Métricas generales</Text>
          <View style={styles.metricsGrid}>
            <SmallMetric label="Total pedidos" value={data.metricas.total} />
            <SmallMetric label="Promedio/rep" value={data.metricas.promedio} />
          </View>
          <View style={[styles.metricsGrid, { marginTop: SPACING.md }]}>
            <SmallMetric label="En ruta" value={data.metricas.ruta} />
            <SmallMetric label="Pendientes" value={data.metricas.pendientes} />
          </View>
        </Animated.View>

        {/* Espacio final */}
        <View style={{ height: SPACING.xxxl }} />
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
    paddingTop: 6,
    gap: SPACING.md,
  },
  headerLeft: {
    flex: 1,
  },
  kicker: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 1.4,
    color: theme.ink,
    opacity: 0.55,
    textTransform: 'uppercase',
    marginTop: 8,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 26,
    letterSpacing: -0.7,
    lineHeight: 28,
    marginTop: 2,
    color: theme.ink,
  },
  headerRight: {
    gap: 8,
  },
  scanButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: theme.ink,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.cardHeavy,
  },
  refreshButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingTop: 14,
    paddingBottom: 30,
  },
  heroStatsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: SPACING.md,
  },
  heroStat: {
    flex: 1,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.base,
    color: theme.ink,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  progressValue: {
    fontFamily: FONTS.displayBlack,
    fontSize: 32,
    letterSpacing: -1.2,
    color: theme.ink,
  },
  progressSubtext: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 1.2,
    color: theme.muted,
    textTransform: 'uppercase',
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.canvas,
    borderRadius: RADIUS.sm,
    overflow: 'hidden',
    marginBottom: SPACING.md,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.ink,
    borderRadius: RADIUS.sm,
  },
  miniStatsGrid: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  intentosGrid: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.ink,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  moreButtonContent: {
    flex: 1,
  },
  moreButtonText: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.lg,
    color: theme.surface,
    marginBottom: 4,
  },
  moreButtonSub: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: theme.surface,
    opacity: 0.7,
  },
  avisosCard: {
    backgroundColor: theme.warnBg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: theme.warnBorder,
  },
  avisosHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  avisosIcon: {
    fontSize: 24,
  },
  avisosTexts: {
    flex: 1,
  },
  avisosTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.base,
    color: '#A86A12',
    marginBottom: 2,
  },
  avisosSubtext: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: '#A86A12',
    opacity: 0.8,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
});
