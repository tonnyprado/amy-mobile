import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Van } from 'lucide-react-native';
import Badge from './ui/Badge';
import theme from '../theme';

const ESTADOS_CONFIG = {
  PENDIENTE: { label: 'Pendiente', variant: 'neutral', icon: 'time-outline', color: theme.colors.textMuted },
  EN_RUTA: { label: 'En ruta', variant: 'info', icon: 'navigate', color: theme.colors.info },
  ENTREGADO: { label: 'Entregado', variant: 'success', icon: 'checkmark-circle', color: theme.colors.success },
  NO_ENTREGADO: { label: 'No entregado', variant: 'error', icon: 'close-circle', color: theme.colors.error },
};

const SUBTIPOS_AVISO_LABELS = {
  A: 'Aviso',
  DI: 'Datos Incorrectos',
  AR: 'Alto Riesgo',
  CD: 'Cambio Domicilio',
  R: 'Rechazo'
};

/**
 * Tarjeta de paquete individual con diseño moderno
 */
export default function PaqueteCard({ paquete, isSelected, onPress }) {
  const estadoConfig = ESTADOS_CONFIG[paquete.estado] || ESTADOS_CONFIG.PENDIENTE;
  const esAviso = paquete.tipoPedido === 'AVISO';
  const totalIntentos = (paquete.numeroIntento || 1) + (paquete.intentosAviso || 0);

  return (
    <TouchableOpacity
      style={[
        styles.card,
        isSelected && styles.cardSelected,
        esAviso && styles.cardAviso,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Header con icono y guía */}
      <View style={styles.header}>
        <View style={[styles.iconCircle, { backgroundColor: `${theme.colors.primary}15` }]}>
          <Van size={22} color={theme.colors.primary} strokeWidth={2.5} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.guia}>{paquete.numeroGuia}</Text>
          <Text style={styles.destinatario} numberOfLines={1}>{paquete.destinatario}</Text>
        </View>
        <View style={styles.badgesContainer}>
          {esAviso && (
            <Badge label="AVISO" variant="warning" size="sm" />
          )}
          <Badge label={estadoConfig.label} variant={estadoConfig.variant} size="sm" />
        </View>
      </View>

      {/* Aviso info si aplica */}
      {esAviso && paquete.subtipoAviso && (
        <View style={styles.avisoInfoContainer}>
          <Ionicons name="warning" size={16} color={theme.colors.warning} />
          <Text style={styles.avisoInfoLabel}>
            {paquete.subtipoAviso}: {SUBTIPOS_AVISO_LABELS[paquete.subtipoAviso] || paquete.subtipoAviso}
          </Text>
        </View>
      )}

      {/* Dirección */}
      <View style={styles.infoRow}>
        <Ionicons name="location-outline" size={18} color={theme.colors.textMuted} />
        <Text style={styles.direccion} numberOfLines={2}>
          {paquete.direccion}
        </Text>
      </View>

      {/* Footer con detalles */}
      <View style={styles.footer}>
        <View style={styles.footerItem}>
          <Ionicons name="cube-outline" size={16} color={theme.colors.textMuted} />
          <Text style={styles.footerText}>{paquete.piezas} pza(s)</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="time-outline" size={16} color={theme.colors.textMuted} />
          <Text style={styles.footerText}>{paquete.ventanaEntrega}</Text>
        </View>
        {esAviso && (
          <View style={styles.footerItem}>
            <Ionicons name="repeat-outline" size={16} color={theme.colors.warning} />
            <Text style={[styles.footerText, { color: theme.colors.warning }]}>
              {totalIntentos} intento(s)
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.md,
  },
  cardSelected: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    ...theme.shadows.purple,
  },
  cardAviso: {
    borderColor: theme.colors.warning,
    borderWidth: 2,
    backgroundColor: theme.colors.surfaceOrange,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    gap: theme.spacing.md,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  guia: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.extrabold,
    color: theme.colors.textPrimary,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  destinatario: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
  },
  badgesContainer: {
    gap: theme.spacing.xs,
    alignItems: 'flex-end',
  },
  avisoInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surfaceOrange,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  avisoInfoLabel: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.warning,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  direccion: {
    flex: 1,
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.medium,
    lineHeight: theme.typography.sizes.sm * 1.4,
  },
  footer: {
    flexDirection: 'row',
    gap: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  footerText: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.semibold,
  },
});
