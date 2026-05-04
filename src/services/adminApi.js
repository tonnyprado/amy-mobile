/**
 * Servicio API para funcionalidad administrativa
 * Maneja escaneo de cajas y otras operaciones de admin
 */

import { apiClient } from '../config/api';

// ============================================================================
// ESCÁNER DE CAJAS
// ============================================================================

/**
 * Busca información de una caja basándose en los datos de la etiqueta
 *
 * @param {Object} datosEtiqueta - Datos extraídos de la etiqueta
 * @param {string} datosEtiqueta.ruta - Número de ruta
 * @param {string} datosEtiqueta.direccion - Dirección de entrega
 * @param {string} datosEtiqueta.consultora - Nombre de la consultora
 * @returns {Promise<Object>} Información de la caja (ruta, color, numeroCarrito, colorHex, consultora, direccion)
 */
export async function buscarInformacionCaja(datosEtiqueta) {
  try {
    console.log('🔍 Buscando información de caja:', datosEtiqueta);

    const response = await apiClient.post('/api/listados-pedidos/buscar-etiqueta', {
      ruta: datosEtiqueta.ruta,
      direccion: datosEtiqueta.direccion,
      consultora: datosEtiqueta.consultora
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('No se encontró información para esta caja');
      }
      if (response.status === 400) {
        throw new Error('Datos de etiqueta incompletos');
      }
      throw new Error('Error al buscar información de la caja');
    }

    const data = await response.json();
    console.log('✅ Información encontrada:', data);
    return data;

  } catch (error) {
    console.error('❌ Error en buscarInformacionCaja:', error);
    throw error;
  }
}

/**
 * Registra un escaneo de caja (para estadísticas/logs)
 *
 * @param {Object} registro - Datos del escaneo
 * @param {string} registro.ruta - Ruta escaneada
 * @param {string} registro.color - Color asignado
 * @param {string} registro.numeroCarrito - Número de carrito
 * @param {Date} registro.timestamp - Momento del escaneo
 * @returns {Promise<void>}
 */
export async function registrarEscaneo(registro) {
  try {
    // TODO: Implementar cuando se necesite tracking de escaneos
    /*
    const response = await apiClient.post('/api/admin/escaneos', registro);

    if (!response.ok) {
      console.warn('⚠️ No se pudo registrar el escaneo');
    }
    */

    console.log('📊 Escaneo registrado:', registro);
  } catch (error) {
    // No lanzar error, solo log
    console.warn('⚠️ Error registrando escaneo:', error);
  }
}

// ============================================================================
// GESTIÓN DE REPARTIDORES
// ============================================================================

/**
 * Obtiene la lista completa de repartidores
 *
 * @returns {Promise<Array>} Lista de repartidores con su información
 */
export async function obtenerRepartidores() {
  try {
    console.log('👥 Obteniendo lista de repartidores...');

    const response = await apiClient.get('/api/usuarios');

    if (!response.ok) {
      throw new Error('Error al obtener repartidores');
    }

    const usuarios = await response.json();

    // Filtrar solo repartidores
    const repartidores = usuarios.filter(u => u.rol === 'REPARTIDOR');

    console.log(`✅ Se encontraron ${repartidores.length} repartidores`);
    return repartidores;

  } catch (error) {
    console.error('❌ Error en obtenerRepartidores:', error);
    throw error;
  }
}

/**
 * Obtiene información detallada de un repartidor
 *
 * @param {number} repartidorId - ID del repartidor
 * @returns {Promise<Object>} Información del repartidor
 */
export async function obtenerRepartidor(repartidorId) {
  try {
    console.log(`👤 Obteniendo información del repartidor ${repartidorId}...`);

    const response = await apiClient.get(`/api/usuarios/${repartidorId}`);

    if (!response.ok) {
      throw new Error('Error al obtener información del repartidor');
    }

    const repartidor = await response.json();
    console.log('✅ Información obtenida:', repartidor);
    return repartidor;

  } catch (error) {
    console.error('❌ Error en obtenerRepartidor:', error);
    throw error;
  }
}

// ============================================================================
// OTRAS FUNCIONES ADMIN (Para futuro)
// ============================================================================

/**
 * Obtiene estadísticas del día
 * TODO: Implementar cuando sea necesario
 */
export async function obtenerEstadisticasDia() {
  // Placeholder para futuras funcionalidades
}

/**
 * Obtiene lista de repartidores activos
 * TODO: Implementar cuando sea necesario
 */
export async function obtenerRepartidoresActivos() {
  // Placeholder para futuras funcionalidades
}
