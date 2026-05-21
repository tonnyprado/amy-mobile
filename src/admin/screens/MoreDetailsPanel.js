/**
 * MoreDetailsPanel - Drawer que se desliza desde la izquierda
 * Muestra: Incidencias (oscura) · Intentos · Avisos · Top reps (beige) · Métricas (azul)
 * El reveal-circle coral se maneja en el padre (AdminApp)
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import {
  ChevronLeft,
  PackageX,
  RotateCw,
  BellRing,
  Trophy,
  ChevronRight,
  BarChart3,
} from 'lucide-react-native';
import { theme, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { STATS } from '../data';
import { SectionShell, IntentoBox, SmallMetric } from '../components/primitives';
import IncidenciaRow from './stats/IncidenciaRow';
import TopRepRow from './stats/TopRepRow';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MoreDetailsPanel({ visible, onClose, onOpenAnalysis }) {
  // Animación de slide
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -SCREEN_WIDTH,
        duration: 320,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  // Calculate after visibility check
  const data = STATS;
  const totalIncidencias = data.incidencias?.reduce((a, x) => a + x.value, 0) || 0;
  const rejectionRate = Math.round((totalIncidencias / (data.assigned || 1)) * 100);
  const maxInc = Math.max(...(data.incidencias?.map(i => i.value) || [1]));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      <SectionShell style={styles.shell}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerKicker}>ESTADÍSTICAS</Text>
            <Text style={styles.headerTitle}>Más detalles</Text>
          </View>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.7}
          >
            <ChevronLeft size={18} color={theme.ink} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* Scrollable content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Incidencias — Card oscura */}
          <View style={styles.incidenciasCard}>
            <View style={styles.sectionHeader}>
              <PackageX size={18} color={theme.canvas} strokeWidth={2.2} />
              <Text style={styles.sectionTitle}>Incidencias</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalIncidencias}</Text>
              </View>
            </View>

            <View style={styles.incidenciasList}>
              {(data.incidencias || []).map((inc, i) => (
                <IncidenciaRow
                  key={inc.key}
                  icon={inc.icon}
                  label={inc.label}
                  value={inc.value}
                  maxValue={maxInc}
                  delay={50 + i * 60}
                />
              ))}
            </View>

            <View style={styles.incidenciasFooter}>
              <Text style={styles.footerText}>
                Rechazados: <Text style={styles.footerValue}>{totalIncidencias}</Text>
              </Text>
              <Text style={styles.footerText}>
                Tasa rechazo:{' '}
                <Text style={[styles.footerValue, { color: theme.accent }]}>
                  {rejectionRate}%
                </Text>
              </Text>
            </View>
          </View>

          {/* Intentos de entrega */}
          <View style={styles.card}>
            <View style={[styles.sectionHeader, { marginBottom: SPACING.md }]}>
              <RotateCw size={18} color={theme.ink} strokeWidth={2.2} />
              <Text style={[styles.sectionTitle, { color: theme.ink }]}>
                Intentos de entrega
              </Text>
            </View>

            <View style={styles.intentosGrid}>
              <IntentoBox
                value={data.intentos.uno}
                label="1er intento"
                color={theme.successFg}
              />
              <IntentoBox
                value={data.intentos.dos}
                label="2do intento"
                color="#A86A12"
              />
              <IntentoBox
                value={data.intentos.tres}
                label="3er intento"
                color={theme.dangerFg}
              />
            </View>
          </View>

          {/* Pedidos tipo aviso - Botón */}
          <TouchableOpacity
            style={styles.avisosButton}
            onPress={onOpenAnalysis}
            activeOpacity={0.8}
          >
            <View style={styles.avisosIcon}>
              <BellRing size={16} color="#A86A12" strokeWidth={2.2} />
            </View>

            <View style={styles.avisosContent}>
              <Text style={styles.avisosKicker}>PEDIDOS TIPO AVISO</Text>
              <Text style={styles.avisosTitle}>Requieren atención especial</Text>
            </View>

            <Text style={styles.avisosCount}>{data.avisos}</Text>
            <ChevronRight size={16} color={theme.muted} strokeWidth={2.2} />
          </TouchableOpacity>

          {/* Top repartidores — Beige cálida */}
          <View style={styles.topRepsCard}>
            <View style={styles.sectionHeader}>
              <Trophy size={18} color={theme.ink} strokeWidth={2.2} />
              <Text style={[styles.sectionTitle, { color: theme.ink }]}>
                Top repartidores
              </Text>
            </View>

            <View style={styles.topRepsList}>
              {(data.topReps || []).map((rep, i) => (
                <TopRepRow
                  key={rep.name}
                  rank={i + 1}
                  name={rep.name}
                  pct={rep.pct}
                  delivered={rep.delivered}
                />
              ))}
            </View>
          </View>

          {/* Métricas generales — Azul clara */}
          <View style={styles.metricsCard}>
            <View style={styles.sectionHeader}>
              <BarChart3 size={18} color={theme.ink} strokeWidth={2.2} />
              <Text style={[styles.sectionTitle, { color: theme.ink }]}>
                Métricas generales
              </Text>
            </View>

            <View style={styles.metricsGrid}>
              <SmallMetric label="Total pedidos" value={data.metricas.total} />
              <SmallMetric label="Promedio/rep" value={data.metricas.promedio} />
            </View>
            <View style={[styles.metricsGrid, { marginTop: SPACING.md }]}>
              <SmallMetric label="En ruta" value={data.metricas.ruta} />
              <SmallMetric label="Pendientes" value={data.metricas.pendientes} />
            </View>
          </View>

          {/* Espacio final */}
          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </SectionShell>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SCREEN_WIDTH,
    backgroundColor: theme.canvas,
    zIndex: 90,
  },
  shell: {
    backgroundColor: theme.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    gap: 10,
  },
  headerLeft: {
    flex: 1,
  },
  headerKicker: {
    fontFamily: FONTS.body,
    fontSize: 10.5,
    letterSpacing: 1.4,
    color: theme.muted,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontFamily: FONTS.display,
    fontSize: 22,
    letterSpacing: -0.6,
    lineHeight: 24,
    marginTop: 2,
    color: theme.ink,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    flex: 1,
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.base,
  },
  badge: {
    backgroundColor: theme.accent,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  badgeText: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.sm,
    color: theme.surface,
  },

  // Incidencias Card
  incidenciasCard: {
    backgroundColor: theme.ink,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  incidenciasList: {
    gap: 8,
  },
  incidenciasFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontFamily: FONTS.body,
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.6)',
  },
  footerValue: {
    fontFamily: FONTS.bodyBold,
    color: theme.canvas,
  },

  // Card genérica
  card: {
    backgroundColor: theme.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },

  // Intentos
  intentosGrid: {
    flexDirection: 'row',
    gap: 6,
  },

  // Avisos Button
  avisosButton: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: RADIUS.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  avisosIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.warnBg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avisosContent: {
    flex: 1,
  },
  avisosKicker: {
    fontFamily: FONTS.body,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: theme.muted,
    textTransform: 'uppercase',
  },
  avisosTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: 13.5,
    color: theme.ink,
    marginTop: 1,
  },
  avisosCount: {
    fontFamily: FONTS.displayBlack,
    fontSize: 22,
    letterSpacing: -0.5,
    color: '#A86A12',
  },

  // Top Reps Card
  topRepsCard: {
    backgroundColor: '#FFF6E6',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  topRepsList: {
    gap: 8,
  },

  // Metrics Card
  metricsCard: {
    backgroundColor: '#ECF1F8',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
});
