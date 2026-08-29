// src/screens/repartidor/StatsScreen.js
// Pantalla 3 - Estadísticas semanales

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import SectionShell from '../../components/repartidor/SectionShell';
import Pill from '../../components/repartidor/Pill';
import Icon from '../../components/repartidor/Icon';
import { FONTS } from '../../theme/repartidorTheme';

/**
 * Genera un tip/consejo basado en las estadisticas del repartidor
 */
function getTipBasedOnStats(eficiencia, deliveriesToday, assignedToday, pending) {
  const hora = new Date().getHours();

  // Si completo todas las entregas
  if (assignedToday > 0 && pending === 0) {
    return {
      icon: '🎉',
      title: '¡Excelente trabajo!',
      message: 'Completaste todas tus entregas de hoy. Descansa o preparate para manana.',
    };
  }

  // Basado en eficiencia
  if (eficiencia >= 80) {
    return {
      icon: '🔥',
      title: '¡Vas muy bien!',
      message: `Solo te faltan ${pending} entregas. ¡Ya casi terminas!`,
    };
  }

  if (eficiencia >= 50) {
    return {
      icon: '💪',
      title: 'Buen ritmo',
      message: 'Manten el paso. Recuerda verificar las direcciones antes de salir.',
    };
  }

  // Si es temprano y tiene muchas pendientes
  if (hora < 12 && pending > 0) {
    return {
      icon: '☀️',
      title: 'Empieza tu ruta',
      message: 'Las mananas tienen menos trafico. Buen momento para avanzar.',
    };
  }

  // Si es tarde y tiene pendientes
  if (hora >= 12 && hora < 18 && pending > 0) {
    return {
      icon: '⏰',
      title: 'Aprovecha la tarde',
      message: `Tienes ${pending} entregas pendientes. ¡Tu puedes!`,
    };
  }

  // Default
  if (pending > 0) {
    return {
      icon: '📦',
      title: 'Entregas pendientes',
      message: `Tienes ${pending} entregas por completar hoy.`,
    };
  }

  return {
    icon: '👋',
    title: 'Sin entregas asignadas',
    message: 'No tienes entregas asignadas por el momento.',
  };
}

export default function StatsScreen({ theme, stats }) {
  const defaultStats = {
    deliveriesToday: 0,
    assignedToday: 0,
    weekBars: [0, 0, 0, 0, 0, 0, 0],
    weekDays: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
    distance: '0',
    timeInRoute: '0',
  };

  const currentStats = { ...defaultStats, ...stats };

  // Calcular eficiencia y pending para el tip
  const { deliveriesToday, assignedToday } = currentStats;
  const pending = assignedToday - deliveriesToday;
  const eficiencia = assignedToday > 0
    ? Math.round((deliveriesToday / assignedToday) * 100)
    : 0;
  const tip = getTipBasedOnStats(eficiencia, deliveriesToday, assignedToday, pending);

  return (
    <SectionShell bg={theme.accent} label="03 Estadísticas" theme={theme} padded={false}>
      <View style={{ paddingTop: 56 }}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.ink }]}>Esta semana</Text>
        </View>

        <HeroCard theme={theme} stats={currentStats} />
        <StatGrid theme={theme} stats={currentStats} />
        <TipCard theme={theme} tip={tip} />
        <AchievementStrip theme={theme} />
      </View>
    </SectionShell>
  );
}

function HeroCard({ theme, stats }) {
  const { deliveriesToday, assignedToday, weekBars, weekDays } = stats;
  const maxB = Math.max(...weekBars, 1);
  const lastIdx = weekBars.length - 1;
  const pending = assignedToday - deliveriesToday;

  return (
    <View style={styles.heroCardContainer}>
      <View style={[styles.heroCard, { backgroundColor: theme.ink }]}>
        <View style={styles.heroHeader}>
          <View style={styles.heroLabel}>
            <Icon name="package" size={11} color={theme.canvas} />
            <Text style={[styles.heroLabelText, { color: theme.canvas }]}>
              Entregas hoy
            </Text>
          </View>
          <Pill bg={theme.accent} color={theme.ink}>
            <>
              <Icon name="trending-up" size={10} color={theme.ink} strokeWidth={2.4} />
              <Text> +12%</Text>
            </>
          </Pill>
        </View>
        <Text style={[styles.heroNumber, { color: theme.canvas }]}>
          {deliveriesToday}
        </Text>
        <Text style={[styles.heroSubtitle, { color: theme.canvas }]}>
          de {assignedToday} asignadas · {pending} pendientes
        </Text>

        <View style={styles.chart}>
          <View style={styles.chartBars}>
            {weekBars.map((b, i) => (
              <View key={i} style={[styles.chartBarContainer, { height: 64 }]}>
                <View
                  style={[
                    styles.chartBar,
                    {
                      height: `${(b / maxB) * 100}%`,
                      backgroundColor:
                        i === lastIdx ? theme.accent : 'rgba(255,255,255,0.22)',
                    },
                  ]}
                >
                  {i === lastIdx && b > 0 && (
                    <Text style={[styles.chartBarLabel, { color: theme.accent }]}>
                      {b}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
          <View style={styles.chartLabels}>
            {weekDays.map((d, i) => (
              <Text
                key={i}
                style={[
                  styles.chartLabel,
                  { color: theme.canvas },
                  i === lastIdx && styles.chartLabelActive,
                ]}
              >
                {d}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

function StatGrid({ theme, stats }) {
  // Calcular eficiencia real: entregas completadas / asignadas
  const eficiencia = stats.assignedToday > 0
    ? Math.round((stats.deliveriesToday / stats.assignedToday) * 100)
    : 0;

  const cells = [
    {
      k: 'Distancia',
      v: stats.distance,
      u: 'km',
      sub: `${stats.timeInRoute || '0'} hr en ruta`,
      icon: 'map',
    },
    {
      k: 'Eficiencia',
      v: eficiencia.toString(),
      u: '%',
      sub: 'Entregas completadas hoy',
      icon: 'zap',
    },
  ];

  return (
    <View style={styles.statGrid}>
      {cells.map((s) => (
        <View
          key={s.k}
          style={[styles.statGridCell, { backgroundColor: theme.canvas }]}
        >
          <View style={styles.statGridHeader}>
            <Text style={[styles.statGridLabel, { color: theme.muted }]}>
              {s.k}
            </Text>
            <Icon name={s.icon} size={13} color={theme.muted} />
          </View>
          <View style={styles.statGridValue}>
            <Text style={[styles.statGridNumber, { color: theme.ink }]}>
              {s.v}
            </Text>
            <Text style={[styles.statGridUnit, { color: theme.muted }]}>
              {s.u}
            </Text>
          </View>
          <Text style={[styles.statGridSub, { color: theme.muted }]}>
            {s.sub}
          </Text>
        </View>
      ))}
    </View>
  );
}

function TipCard({ theme, tip }) {
  return (
    <View style={[styles.tipCard, { backgroundColor: theme.canvas }]}>
      <View style={[styles.tipIcon, { backgroundColor: '#F3F0FF' }]}>
        <Text style={styles.tipEmoji}>{tip.icon}</Text>
      </View>
      <View style={styles.tipContent}>
        <Text style={[styles.tipTitle, { color: theme.ink }]}>{tip.title}</Text>
        <Text style={[styles.tipMessage, { color: theme.muted }]}>{tip.message}</Text>
      </View>
    </View>
  );
}

function AchievementStrip({ theme }) {
  return (
    <TouchableOpacity
      style={[styles.achievement, { backgroundColor: 'rgba(0,0,0,0.06)' }]}
      activeOpacity={0.7}
    >
      <View style={[styles.achievementIcon, { backgroundColor: theme.ink }]}>
        <Icon name="award" size={18} color={theme.accent} />
      </View>
      <View style={styles.achievementText}>
        <Text style={[styles.achievementTitle, { color: theme.ink }]}>
          Racha de 5 dias sin incidencias
        </Text>
        <Text style={[styles.achievementSubtitle, { color: theme.ink }]}>
          Sigue asi para bono mensual
        </Text>
      </View>
      <Icon name="chevron-right" size={16} color={theme.ink} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  kicker: {
    fontSize: 10.5,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    opacity: 0.55,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 29,
    marginTop: 2,
    fontFamily: FONTS.display,
  },
  heroCardContainer: {
    paddingHorizontal: 20,
    paddingTop: 14,
  },
  heroCard: {
    borderRadius: 22,
    padding: 20,
    overflow: 'hidden',
  },
  heroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  heroLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  heroLabelText: {
    fontSize: 10,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1.4,
    opacity: 0.6,
    textTransform: 'uppercase',
  },
  heroNumber: {
    fontSize: 92,
    fontWeight: '700',
    letterSpacing: -4,
    lineHeight: 96,
    fontFamily: FONTS.displayExtraBold,
    marginTop: 4,
  },
  heroSubtitle: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 6,
  },
  chart: {
    marginTop: 16,
  },
  chartBars: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-end',
  },
  chartBarContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  chartBar: {
    borderRadius: 4,
    position: 'relative',
  },
  chartBarLabel: {
    position: 'absolute',
    top: -16,
    left: 0,
    right: 0,
    fontSize: 10,
    fontFamily: FONTS.bodyBold,
    fontWeight: '700',
    textAlign: 'center',
  },
  chartLabels: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  chartLabel: {
    flex: 1,
    fontSize: 9.5,
    fontFamily: FONTS.bodyRegular,
    opacity: 0.45,
    textAlign: 'center',
  },
  chartLabelActive: {
    fontFamily: FONTS.bodyBold,
    fontWeight: '700',
  },
  statGrid: {
    paddingHorizontal: 20,
    paddingTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statGridCell: {
    width: '48%',
    borderRadius: 16,
    padding: 14,
  },
  statGridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statGridLabel: {
    fontSize: 10,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  statGridValue: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 3,
    marginTop: 6,
  },
  statGridNumber: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 32,
    fontFamily: FONTS.bodyBold,
  },
  statGridUnit: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
  },
  statGridSub: {
    fontSize: 10.5,
    marginTop: 4,
  },
  achievement: {
    marginHorizontal: 20,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  achievementIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
    fontFamily: FONTS.bodyBold,
  },
  achievementSubtitle: {
    fontSize: 11,
    opacity: 0.6,
  },
  tipCard: {
    marginHorizontal: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tipEmoji: {
    fontSize: 20,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FONTS.bodyBold,
    marginBottom: 2,
  },
  tipMessage: {
    fontSize: 13,
    lineHeight: 18,
    fontFamily: FONTS.bodyRegular,
  },
});
