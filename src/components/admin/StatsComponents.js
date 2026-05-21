/**
 * Componentes reutilizables para estadísticas e incidencias
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// ============================================================================
// StatCard - Card de estadística principal
// ============================================================================

export function StatCard({ value, label, color = '#2563eb', icon, subtext }) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      {icon && <Text style={styles.statIcon}>{icon}</Text>}
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      {subtext && <Text style={styles.statSubtext}>{subtext}</Text>}
    </View>
  );
}

// ============================================================================
// MiniStatCard - Card pequeña para métricas secundarias
// ============================================================================

export function MiniStatCard({ value, label, color = '#64748b' }) {
  return (
    <View style={styles.miniStatCard}>
      <Text style={[styles.miniStatValue, { color }]}>{value}</Text>
      <Text style={styles.miniStatLabel}>{label}</Text>
    </View>
  );
}

// ============================================================================
// AlertBadge - Badge de alerta
// ============================================================================

export function AlertBadge({ count, severity = 'media', label }) {
  const colors = {
    alta: '#ef4444',
    media: '#f59e0b',
    baja: '#10b981'
  };

  const bgColors = {
    alta: '#fee2e2',
    media: '#fef3c7',
    baja: '#dcfce7'
  };

  if (count === 0) return null;

  return (
    <View style={[styles.alertBadge, { backgroundColor: bgColors[severity] }]}>
      <Text style={[styles.alertBadgeCount, { color: colors[severity] }]}>
        {count}
      </Text>
      <Text style={[styles.alertBadgeLabel, { color: colors[severity] }]}>
        {label}
      </Text>
    </View>
  );
}

// ============================================================================
// ProgressBar - Barra de progreso
// ============================================================================

export function ProgressBar({ progress, color = '#10b981', height = 6, showLabel = false }) {
  const percentage = Math.min(100, Math.max(0, progress));

  return (
    <View>
      {showLabel && (
        <Text style={styles.progressLabel}>{percentage}%</Text>
      )}
      <View style={[styles.progressBarContainer, { height }]}>
        <View
          style={[
            styles.progressBarFill,
            { width: `${percentage}%`, backgroundColor: color }
          ]}
        />
      </View>
    </View>
  );
}

// ============================================================================
// IncidenciaItem - Item de incidencia
// ============================================================================

export function IncidenciaItem({ icon, label, count, color = '#64748b' }) {
  if (count === 0) return null;

  return (
    <View style={styles.incidenciaItem}>
      <Text style={styles.incidenciaIcon}>{icon}</Text>
      <Text style={styles.incidenciaLabel}>{label}</Text>
      <View style={[styles.incidenciaBadge, { backgroundColor: `${color}20` }]}>
        <Text style={[styles.incidenciaCount, { color }]}>{count}</Text>
      </View>
    </View>
  );
}

// ============================================================================
// VelocidadCard - Card de velocidad/ritmo
// ============================================================================

export function VelocidadCard({ velocidad, porcentajeReal, porcentajeEsperado }) {
  const configs = {
    adelante: {
      color: '#10b981',
      bg: '#dcfce7',
      icon: '🚀',
      titulo: 'Excelente Ritmo',
      mensaje: 'Van adelante del objetivo'
    },
    bien: {
      color: '#f59e0b',
      bg: '#fef3c7',
      icon: '⚡',
      titulo: 'Buen Ritmo',
      mensaje: 'Mantener el paso'
    },
    atrasado: {
      color: '#ef4444',
      bg: '#fee2e2',
      icon: '⚠️',
      titulo: 'Ritmo Lento',
      mensaje: 'Necesitan acelerar'
    }
  };

  const config = configs[velocidad] || configs.bien;

  return (
    <View style={[styles.velocidadCard, { backgroundColor: config.bg }]}>
      <View style={styles.velocidadHeader}>
        <Text style={styles.velocidadIcon}>{config.icon}</Text>
        <View style={styles.velocidadTexts}>
          <Text style={[styles.velocidadTitulo, { color: config.color }]}>
            {config.titulo}
          </Text>
          <Text style={[styles.velocidadMensaje, { color: config.color }]}>
            {config.mensaje}
          </Text>
        </View>
      </View>
      <View style={styles.velocidadDetalle}>
        <Text style={styles.velocidadDetalleText}>
          Esperado: {porcentajeEsperado}% | Real: {porcentajeReal}%
        </Text>
      </View>
    </View>
  );
}

// ============================================================================
// SectionHeader - Encabezado de sección
// ============================================================================

export function SectionHeader({ title, icon, rightComponent }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionHeaderLeft}>
        {icon && <Text style={styles.sectionHeaderIcon}>{icon}</Text>}
        <Text style={styles.sectionHeaderTitle}>{title}</Text>
      </View>
      {rightComponent}
    </View>
  );
}

// ============================================================================
// EmptyState - Estado vacío
// ============================================================================

export function EmptyState({ icon = '📊', title, message }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>{icon}</Text>
      <Text style={styles.emptyStateTitle}>{title}</Text>
      {message && <Text style={styles.emptyStateMessage}>{message}</Text>}
    </View>
  );
}

// ============================================================================
// TopRepartidorCard - Card de top repartidor
// ============================================================================

export function TopRepartidorCard({ ranking, nombre, tasaExito, entregas, color }) {
  const medals = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <View style={styles.topRepartidorCard}>
      <Text style={styles.topRepartidorMedal}>{medals[ranking] || '📍'}</Text>
      <View style={styles.topRepartidorInfo}>
        <Text style={styles.topRepartidorNombre} numberOfLines={1}>
          {nombre}
        </Text>
        <Text style={styles.topRepartidorStats}>
          {tasaExito}% · {entregas} entregas
        </Text>
      </View>
      <View style={[styles.topRepartidorBadge, { backgroundColor: color || '#10b981' }]}>
        <Text style={styles.topRepartidorBadgeText}>{tasaExito}%</Text>
      </View>
    </View>
  );
}

// ============================================================================
// Estilos
// ============================================================================

const styles = StyleSheet.create({
  // StatCard
  statCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    minWidth: 100,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  statSubtext: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },

  // MiniStatCard
  miniStatCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    minWidth: 80,
  },
  miniStatValue: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  miniStatLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },

  // AlertBadge
  alertBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  alertBadgeCount: {
    fontSize: 16,
    fontWeight: '800',
  },
  alertBadgeLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },

  // ProgressBar
  progressLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: '#e2e8f0',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 999,
  },

  // IncidenciaItem
  incidenciaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  incidenciaIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  incidenciaLabel: {
    flex: 1,
    fontSize: 14,
    color: '#0f172a',
    fontWeight: '500',
  },
  incidenciaBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  incidenciaCount: {
    fontSize: 14,
    fontWeight: '800',
  },

  // VelocidadCard
  velocidadCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  velocidadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  velocidadIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  velocidadTexts: {
    flex: 1,
  },
  velocidadTitulo: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  velocidadMensaje: {
    fontSize: 13,
    fontWeight: '600',
  },
  velocidadDetalle: {
    marginTop: 4,
  },
  velocidadDetalleText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },

  // SectionHeader
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionHeaderIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // EmptyState
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },

  // TopRepartidorCard
  topRepartidorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  topRepartidorMedal: {
    fontSize: 28,
    marginRight: 12,
  },
  topRepartidorInfo: {
    flex: 1,
  },
  topRepartidorNombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  topRepartidorStats: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  topRepartidorBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  topRepartidorBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
  },
});
