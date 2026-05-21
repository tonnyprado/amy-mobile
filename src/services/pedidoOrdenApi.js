/**
 * API Service para manejo de orden de pedidos
 * Permite guardar y resetear el orden personalizado de pedidos
 */

import apiClient from '../config/api';

/**
 * Actualiza el orden de los pedidos en el backend.
 * Puede usarse tanto para orden manual como para guardar el orden optimizado por OSRM.
 *
 * @param {string} idRepartidor - ID del repartidor
 * @param {Array<{pedidoId: number, orden: number}>} pedidos - Array con pedidoId y orden
 * @returns {Promise<Object>} Resultado de la operación
 *
 * @example
 * await guardarOrdenPedidos('R001', [
 *   { pedidoId: 123, orden: 1 },
 *   { pedidoId: 456, orden: 2 },
 *   { pedidoId: 789, orden: 3 }
 * ]);
 */
export async function guardarOrdenPedidos(idRepartidor, pedidos) {
  try {
    console.log('[ORDEN_API] Guardando orden de', pedidos.length, 'pedidos para', idRepartidor);

    const response = await apiClient.post('/api/pedidos/actualizar-orden', {
      idRepartidor,
      pedidos
    });

    console.log('[ORDEN_API] Orden guardado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('[ORDEN_API] Error al guardar orden:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Resetea el orden de los pedidos al orden por defecto (por ID).
 *
 * @param {string} idRepartidor - ID del repartidor
 * @param {string} fecha - Fecha en formato YYYY-MM-DD (opcional, default: hoy)
 * @returns {Promise<Object>} Resultado de la operación
 */
export async function resetearOrdenPedidos(idRepartidor, fecha = null) {
  try {
    const endpoint = `/api/pedidos/repartidor/${idRepartidor}/resetear-orden`;
    const params = fecha ? { fecha } : {};

    console.log('[ORDEN_API] Reseteando orden para', idRepartidor, fecha || '(hoy)');

    const response = await apiClient.post(endpoint, null, { params });

    console.log('[ORDEN_API] Orden reseteado exitosamente:', response.data);
    return response.data;
  } catch (error) {
    console.error('[ORDEN_API] Error al resetear orden:', error.response?.data || error.message);
    throw error;
  }
}

export default {
  guardarOrdenPedidos,
  resetearOrdenPedidos
};
