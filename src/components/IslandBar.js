import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';

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
            <View style={[styles.icon, styles.iconPulse]}>
              <Text style={styles.iconText}>📍</Text>
            </View>
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
            <View style={styles.icon}>
              <Text style={styles.iconText}>📦</Text>
            </View>
            <Text style={styles.text}>
              {pedidosEnRuta} {pedidosEnRuta === 1 ? 'entrega' : 'entregas'} en ruta
            </Text>
            <Text style={styles.arrow}>→</Text>
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
    backgroundColor: '#0f172a',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
    minWidth: 200,
  },
  containerExpanded: {
    minWidth: 280,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 10,
  },
  iconPulse: {
    // Para el pulso, podrías usar Animated.Value
  },
  iconText: {
    fontSize: 20,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    marginRight: 8,
  },
  arrow: {
    fontSize: 16,
    color: '#94a3b8',
  },
  badge: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
