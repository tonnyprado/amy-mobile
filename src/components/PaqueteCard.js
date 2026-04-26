import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const ESTADOS_CONFIG = {
  PENDIENTE: { label: 'Pendiente', color: '#64748b', bgColor: '#f1f5f9' },
  EN_RUTA: { label: 'En ruta', color: '#2563eb', bgColor: '#dbeafe' },
  ENTREGADO: { label: 'Entregado', color: '#10b981', bgColor: '#d1fae5' },
  NO_ENTREGADO: { label: 'No entregado', color: '#ef4444', bgColor: '#fee2e2' }
};

/**
 * Tarjeta de paquete individual
 */
export default function PaqueteCard({ paquete, isSelected, onPress }) {
  const estadoConfig = ESTADOS_CONFIG[paquete.estado] || ESTADOS_CONFIG.PENDIENTE;

  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.guia}>{paquete.numeroGuia}</Text>
        <View style={[styles.badge, { backgroundColor: estadoConfig.bgColor }]}>
          <Text style={[styles.badgeText, { color: estadoConfig.color }]}>
            {estadoConfig.label}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <InfoRow label="Destinatario" value={paquete.destinatario} />
        <InfoRow label="Dirección" value={paquete.direccion} numberOfLines={2} />
        <InfoRow label="Ventana" value={paquete.ventanaEntrega} />
        <InfoRow label="Piezas" value={String(paquete.piezas)} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {paquete.evidencias?.fotos?.length || 0} foto(s)
        </Text>
        <Text style={styles.footerText}>
          {formatDate(paquete.evidencias?.ultimaActualizacion)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function InfoRow({ label, value, numberOfLines = 1 }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={numberOfLines}>
        {value}
      </Text>
    </View>
  );
}

function formatDate(value) {
  if (!value) return 'Sin movimientos';
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardSelected: {
    borderColor: '#2563eb',
    shadowOpacity: 0.2,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  guia: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  body: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
    fontWeight: '500',
    flex: 0.4,
  },
  infoValue: {
    fontSize: 13,
    color: '#0f172a',
    flex: 0.6,
    textAlign: 'right',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  footerText: {
    fontSize: 11,
    color: '#94a3b8',
  },
});
