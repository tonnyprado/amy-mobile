import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

/**
 * Item de pedido reordenable con controles arriba/abajo.
 * Muestra el número de orden y botones para mover el pedido.
 *
 * @param {Object} pedido - Objeto pedido
 * @param {number} index - Índice actual en la lista
 * @param {number} total - Total de pedidos en la lista
 * @param {Function} onMoveUp - Callback al mover arriba
 * @param {Function} onMoveDown - Callback al mover abajo
 * @param {Function} onPress - Callback al presionar el pedido
 */
export default function PedidoReorderableItem({
  pedido,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onPress
}) {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  // Determinar color según estado
  const getEstadoColor = () => {
    switch (pedido.estado) {
      case 'PENDIENTE': return '#64748b';
      case 'EN_RUTA': return '#3b82f6';
      case 'ENTREGADO': return '#10b981';
      case 'NO_ENTREGADO': return '#ef4444';
      default: return '#64748b';
    }
  };

  return (
    <View style={styles.container}>
      {/* Panel de control de orden */}
      <View style={styles.orderPanel}>
        <View style={styles.orderNumberContainer}>
          <Text style={styles.orderNumber}>{index + 1}</Text>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={[styles.arrowButton, isFirst && styles.arrowDisabled]}
            onPress={onMoveUp}
            disabled={isFirst}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="keyboard-arrow-up"
              size={28}
              color={isFirst ? '#cbd5e1' : '#3b82f6'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.arrowButton, isLast && styles.arrowDisabled]}
            onPress={onMoveDown}
            disabled={isLast}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name="keyboard-arrow-down"
              size={28}
              color={isLast ? '#cbd5e1' : '#3b82f6'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido del pedido */}
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.mainInfo}>
          <View style={styles.headerRow}>
            <Text style={styles.numeroGuia}>{pedido.numeroGuia || pedido.numeroPedido}</Text>
            <View style={[styles.estadoBadge, { backgroundColor: `${getEstadoColor()}20` }]}>
              <Text style={[styles.estadoText, { color: getEstadoColor() }]}>
                {pedido.estado}
              </Text>
            </View>
          </View>

          <Text style={styles.destinatario} numberOfLines={1}>
            {pedido.destinatario || pedido.nombreConsultora}
          </Text>

          <View style={styles.infoRow}>
            <MaterialIcons name="location-on" size={14} color="#64748b" />
            <Text style={styles.direccion} numberOfLines={1}>
              {pedido.direccion || pedido.direccionConsultora}
            </Text>
          </View>

          {pedido.piezas && (
            <View style={styles.infoRow}>
              <MaterialIcons name="inventory-2" size={14} color="#64748b" />
              <Text style={styles.piezas}>
                {pedido.piezas} {pedido.piezas === 1 ? 'caja' : 'cajas'}
              </Text>
            </View>
          )}
        </View>

        <MaterialIcons name="chevron-right" size={24} color="#cbd5e1" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  orderPanel: {
    width: 70,
    backgroundColor: '#f8fafc',
    borderRightWidth: 2,
    borderRightColor: '#e2e8f0',
    alignItems: 'center',
    paddingVertical: 12,
  },
  orderNumberContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  controls: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowButton: {
    padding: 4,
    marginVertical: 2,
  },
  arrowDisabled: {
    opacity: 0.25,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  mainInfo: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  numeroGuia: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  estadoText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  destinatario: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  direccion: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
    flex: 1,
  },
  piezas: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
});
