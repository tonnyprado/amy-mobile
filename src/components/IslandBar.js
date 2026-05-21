import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

/**
 * IslandBar - Barra flotante tipo Dynamic Island de iPhone
 * Se muestra cuando hay pedidos EN_RUTA
 *
 * @param {Object} props
 * @param {number} props.pedidosEnRuta - Número de pedidos en ruta
 * @param {Object} props.pedidoActual - Pedido actual con navegación activa (opcional)
 * @param {function} props.onPress - Función a llamar cuando se hace click
 * @param {boolean} props.isExpanded - Si está expandida (navegación activa)
 */
export default function IslandBar({
  pedidosEnRuta = 0,
  pedidoActual = null,
  onPress,
  isExpanded = false
}) {
  if (pedidosEnRuta === 0) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isExpanded && styles.containerExpanded
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {isExpanded && pedidoActual ? (
          // Modo expandido - navegación activa
          <>
            <Ionicons name="navigate" size={20} color={theme.colors.primary} />
            <View style={styles.info}>
              <Text style={styles.title}>Navegando a</Text>
              <Text style={styles.subtitle} numberOfLines={1}>
                {pedidoActual.nombreConsultora || 'Destino'}
              </Text>
            </View>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{pedidosEnRuta}</Text>
            </View>
          </>
        ) : (
          // Modo compacto - solo contador
          <>
            <Ionicons name="cube" size={20} color={theme.colors.textPrimary} />
            <Text style={styles.text}>
              {pedidosEnRuta} {pedidosEnRuta === 1 ? 'entrega' : 'entregas'} en ruta
            </Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.lg,
    zIndex: 1000,
    minWidth: 200,
  },
  containerExpanded: {
    minWidth: 280,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  text: {
    flex: 1,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textPrimary,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  badgeText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
  },
});
