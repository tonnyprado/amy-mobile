import api from '../config/api';

/**
 * Geocodifica una dirección
 * @param {string} direccion - Dirección a geocodificar
 * @param {string} region - Región opcional para mejorar precisión
 * @returns {Promise<{latitud: number, longitud: number, direccionFormateada: string, confianza: number, exitoso: boolean}>}
 */
export const geocodificarDireccion = async (direccion, region = null) => {
  try {
    console.log('🗺️ Geocodificando dirección:', direccion);

    const response = await api.post('/api/geocoding/geocode', {
      direccion,
      region
    });

    const data = await response.json();

    if (data.exitoso) {
      console.log('✅ Geocodificación exitosa:', data);
    } else {
      console.warn('⚠️ Geocodificación fallida:', data.mensajeError);
    }

    return data;
  } catch (error) {
    console.error('❌ Error al geocodificar:', error);
    throw error;
  }
};

/**
 * Geocodifica y actualiza un pedido
 * @param {number} pedidoId - ID del pedido
 * @param {string} direccion - Dirección a geocodificar
 * @param {string} region - Región opcional
 * @returns {Promise<{latitud: number, longitud: number, direccionFormateada: string, confianza: number, exitoso: boolean}>}
 */
export const geocodificarYActualizarPedido = async (pedidoId, direccion, region = null) => {
  try {
    console.log('🗺️ Geocodificando pedido:', pedidoId);

    const response = await api.post('/api/geocoding/geocode-pedido', {
      pedidoId,
      direccion,
      region
    });

    const data = await response.json();

    if (data.exitoso) {
      console.log('✅ Pedido geocodificado y actualizado:', data);
    } else {
      console.warn('⚠️ Error al geocodificar pedido:', data.mensajeError);
    }

    return data;
  } catch (error) {
    console.error('❌ Error al geocodificar pedido:', error);
    throw error;
  }
};

/**
 * Verifica si el servicio de geocodificación está habilitado
 * @returns {Promise<{enabled: boolean, message: string}>}
 */
export const verificarGeocodingEstado = async () => {
  try {
    const response = await api.get('/api/geocoding/status');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Error al verificar estado de geocoding:', error);
    return { enabled: false, message: 'Error al verificar estado' };
  }
};
