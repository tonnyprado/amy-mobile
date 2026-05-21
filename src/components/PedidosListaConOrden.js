import { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import PaqueteCard from './PaqueteCard';
import theme from '../theme';

/**
 * Lista simple de pedidos
 *
 * @param {Array} pedidos - Lista de pedidos
 * @param {Function} onPedidoPress - Callback al presionar un pedido
 * @param {Object} listProps - Props adicionales para FlatList
 */
export default function PedidosListaConOrden({
  pedidos,
  onPedidoPress,
  ...listProps
}) {
  const renderItem = useCallback(({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => onPedidoPress(item)}
        activeOpacity={0.7}
        style={styles.itemContainer}
      >
        <PaqueteCard
          paquete={item}
          isSelected={false}
          onPress={() => onPedidoPress(item)}
        />
      </TouchableOpacity>
    );
  }, [onPedidoPress]);

  return (
    <FlatList
      data={pedidos}
      keyExtractor={item => item.id.toString()}
      renderItem={renderItem}
      {...listProps}
    />
  );
}

const styles = StyleSheet.create({
  itemContainer: {
    marginBottom: theme.spacing.md,
  },
});
