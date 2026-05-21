import { useState, useCallback, useEffect } from 'react';
import { guardarOrdenPedidos } from '../services/pedidoOrdenApi';

/**
 * Hook para manejar el reordenamiento manual de pedidos.
 * Proporciona funcionalidades de mover pedidos arriba/abajo y guardar el orden.
 *
 * @param {Array} pedidosIniciales - Lista inicial de pedidos
 * @param {string} idRepartidor - ID del repartidor
 * @returns {Object} Estado y funciones para manejar el reorden
 *
 * @example
 * const { pedidos, moverPedido, guardarOrden, ordenModificado } = usePedidosReorder(
 *   paquetes,
 *   usuario.id
 * );
 */
export function usePedidosReorder(pedidosIniciales, idRepartidor) {
  const [pedidos, setPedidos] = useState(pedidosIniciales);
  const [guardando, setGuardando] = useState(false);
  const [ordenModificado, setOrdenModificado] = useState(false);

  // Sincronizar cuando cambien los pedidos iniciales
  useEffect(() => {
    setPedidos(pedidosIniciales);
    setOrdenModificado(false);
  }, [pedidosIniciales]);

  /**
   * Mueve un pedido a una nueva posición
   * @param {number} fromIndex - Índice actual
   * @param {number} toIndex - Índice destino
   */
  const moverPedido = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    if (fromIndex < 0 || toIndex < 0) return;

    setPedidos(prevPedidos => {
      if (fromIndex >= prevPedidos.length || toIndex >= prevPedidos.length) {
        return prevPedidos;
      }

      const nuevosPedidos = [...prevPedidos];
      const [elementoMovido] = nuevosPedidos.splice(fromIndex, 1);
      nuevosPedidos.splice(toIndex, 0, elementoMovido);

      return nuevosPedidos;
    });

    setOrdenModificado(true);
  }, []);

  /**
   * Mueve un pedido una posición arriba
   * @param {number} index - Índice actual
   */
  const moverArriba = useCallback((index) => {
    if (index > 0) {
      moverPedido(index, index - 1);
    }
  }, [moverPedido]);

  /**
   * Mueve un pedido una posición abajo
   * @param {number} index - Índice actual
   */
  const moverAbajo = useCallback((index) => {
    moverPedido(index, index + 1);
  }, [moverPedido]);

  /**
   * Guarda el orden actual en el backend
   * @returns {Promise<Object>} Resultado de la operación
   */
  const guardarOrden = useCallback(async () => {
    if (!ordenModificado) {
      console.log('[REORDER] No hay cambios para guardar');
      return { sinCambios: true };
    }

    if (!idRepartidor) {
      throw new Error('ID de repartidor no disponible');
    }

    setGuardando(true);
    try {
      // Crear array con pedidoId y orden (índice + 1)
      const pedidosOrden = pedidos.map((pedido, index) => ({
        pedidoId: pedido.id,
        orden: index + 1
      }));

      const resultado = await guardarOrdenPedidos(idRepartidor, pedidosOrden);

      console.log('[REORDER] Orden guardado exitosamente:', resultado);
      setOrdenModificado(false);

      return resultado;
    } catch (error) {
      console.error('[REORDER] Error al guardar orden:', error);
      throw error;
    } finally {
      setGuardando(false);
    }
  }, [pedidos, idRepartidor, ordenModificado]);

  /**
   * Resetea la lista al orden inicial
   */
  const resetearOrden = useCallback(() => {
    setPedidos(pedidosIniciales);
    setOrdenModificado(false);
  }, [pedidosIniciales]);

  /**
   * Aplica un nuevo orden de pedidos (útil para orden optimizado por OSRM)
   * @param {Array} nuevosPedidos - Array de pedidos en el nuevo orden
   */
  const aplicarNuevoOrden = useCallback((nuevosPedidos) => {
    setPedidos(nuevosPedidos);
    setOrdenModificado(true);
  }, []);

  return {
    pedidos,
    moverPedido,
    moverArriba,
    moverAbajo,
    guardarOrden,
    resetearOrden,
    aplicarNuevoOrden,
    guardando,
    ordenModificado
  };
}

export default usePedidosReorder;
