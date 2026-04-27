/**
 * Servicio API para funcionalidad de repartidores
 * Maneja pedidos, rastreo GPS e intentos de entrega
 */

import { apiClient } from '../config/api';

// ============================================================================
// PEDIDOS
// ============================================================================

/**
 * Obtiene todos los pedidos asignados a un repartidor
 * @param {string} idRepartidor - ID del repartidor (ej: "0001")
 * @returns {Promise<Array>} Lista de pedidos
 */
export async function obtenerPedidosRepartidor(idRepartidor) {
  const response = await apiClient.get(`/api/pedidos/repartidor/${idRepartidor}`);

  if (!response.ok) {
    throw new Error('Error al obtener pedidos del repartidor');
  }

  return await response.json();
}

/**
 * Obtiene los pedidos de hoy de un repartidor
 * @param {string} idRepartidor
 * @returns {Promise<Array>}
 */
export async function obtenerPedidosHoy(idRepartidor) {
  const response = await apiClient.get(`/api/pedidos/repartidor/${idRepartidor}/hoy`);

  if (!response.ok) {
    throw new Error('Error al obtener pedidos de hoy');
  }

  return await response.json();
}

/**
 * Obtiene los pedidos pendientes de un repartidor
 * @param {string} idRepartidor
 * @returns {Promise<Array>}
 */
export async function obtenerPedidosPendientes(idRepartidor) {
  const response = await apiClient.get(`/api/pedidos/repartidor/${idRepartidor}/pendientes`);

  if (!response.ok) {
    throw new Error('Error al obtener pedidos pendientes');
  }

  return await response.json();
}

/**
 * Obtiene el detalle completo de un pedido (boleta de despacho)
 * @param {number} pedidoId
 * @returns {Promise<Object>}
 */
export async function obtenerDetallePedido(pedidoId) {
  const response = await apiClient.get(`/api/pedidos/${pedidoId}/boleta`);

  if (!response.ok) {
    throw new Error('Error al obtener detalle del pedido');
  }

  return await response.json();
}

// ============================================================================
// RASTREO GPS
// ============================================================================

/**
 * Envía la ubicación actual del repartidor
 * @param {Object} ubicacion
 * @param {string} ubicacion.repartidorId
 * @param {number} ubicacion.latitud
 * @param {number} ubicacion.longitud
 * @param {number} ubicacion.precision - Precisión en metros
 * @param {number} ubicacion.velocidad - Velocidad en km/h
 * @param {string} ubicacion.estadoActividad - EN_ALMACEN, EN_RUTA, EN_PAUSA, FINALIZADO
 * @param {number} ubicacion.bateria - Nivel de batería 0-100
 * @returns {Promise<void>}
 */
export async function enviarUbicacion(ubicacion) {
  const response = await apiClient.post('/api/rastreo/ubicacion', {
    repartidorId: ubicacion.repartidorId,
    latitud: ubicacion.latitud,
    longitud: ubicacion.longitud,
    altitud: ubicacion.altitud || null,
    precision: ubicacion.precision || null,
    velocidad: ubicacion.velocidad || null,
    estadoActividad: ubicacion.estadoActividad,
    bateria: ubicacion.bateria || null,
    proveedorUbicacion: ubicacion.proveedorUbicacion || 'GPS'
  });

  if (!response.ok) {
    throw new Error('Error al enviar ubicación');
  }

  // El backend devuelve texto plano, no JSON
  const text = await response.text();
  return { message: text };
}

// ============================================================================
// RECORRIDOS
// ============================================================================

/**
 * Inicia un nuevo recorrido para el repartidor
 * @param {string} idRepartidor
 * @returns {Promise<Object>}
 */
export async function iniciarRecorrido(idRepartidor) {
  const response = await apiClient.post(`/api/rastreo/recorrido/iniciar/${idRepartidor}`);

  if (!response.ok) {
    throw new Error('Error al iniciar recorrido');
  }

  return await response.json();
}

/**
 * Finaliza el recorrido activo del repartidor
 * @param {string} idRepartidor
 * @returns {Promise<Object>}
 */
export async function finalizarRecorrido(idRepartidor) {
  const response = await apiClient.post(`/api/rastreo/recorrido/finalizar/${idRepartidor}`);

  if (!response.ok) {
    throw new Error('Error al finalizar recorrido');
  }

  return await response.json();
}

/**
 * Obtiene el recorrido activo del repartidor
 * @param {string} idRepartidor
 * @returns {Promise<Object|null>}
 */
export async function obtenerRecorridoActivo(idRepartidor) {
  const response = await apiClient.get(`/api/rastreo/recorrido/activo/${idRepartidor}`);

  if (response.status === 404) {
    return null; // No hay recorrido activo
  }

  if (!response.ok) {
    throw new Error('Error al obtener recorrido activo');
  }

  return await response.json();
}

// ============================================================================
// INTENTOS DE ENTREGA
// ============================================================================

/**
 * Registra un intento de entrega (exitoso o fallido)
 * @param {Object} intento
 * @param {number} intento.pedidoId
 * @param {number} intento.latitudIntento
 * @param {number} intento.longitudIntento
 * @param {string} intento.resultado - ENTREGADO o NO_ENTREGADO
 * @param {string} intento.motivoFallo - CLIENTE_NO_ESTABA, OTRA_RAZON
 * @param {string} intento.descripcionFallo
 * @param {string} intento.fotoEvidenciaUrl
 * @param {string} intento.firmaUrl
 * @param {string} intento.observaciones
 * @returns {Promise<Object>}
 */
export async function registrarIntentoEntrega(intento) {
  const response = await apiClient.post('/api/rastreo/intento-entrega', {
    pedidoId: intento.pedidoId,
    latitudIntento: intento.latitudIntento || null,
    longitudIntento: intento.longitudIntento || null,
    resultado: intento.resultado,
    motivoFallo: intento.motivoFallo || null,
    descripcionFallo: intento.descripcionFallo || null,
    fotoEvidenciaUrl: intento.fotoEvidenciaUrl || null,
    firmaUrl: intento.firmaUrl || null,
    observaciones: intento.observaciones || null
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al registrar intento de entrega');
  }

  return await response.json();
}

/**
 * Obtiene todos los intentos de entrega de un pedido
 * @param {number} pedidoId
 * @returns {Promise<Array>}
 */
export async function obtenerIntentosEntrega(pedidoId) {
  const response = await apiClient.get(`/api/rastreo/intento-entrega/pedido/${pedidoId}`);

  if (!response.ok) {
    throw new Error('Error al obtener intentos de entrega');
  }

  return await response.json();
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Mapea el estado del backend al estado del frontend
 * @param {string} estadoBackend - PENDIENTE, EN_RUTA, ENTREGADO, NO_ENTREGADO
 * @returns {string}
 */
export function mapearEstadoBackend(estadoBackend) {
  const mapa = {
    'PENDIENTE': 'PENDIENTE',
    'EN_RUTA': 'EN_RUTA',
    'ENTREGADO': 'ENTREGADO',
    'NO_ENTREGADO': 'NO_ENTREGADO'
  };

  return mapa[estadoBackend] || 'PENDIENTE';
}

/**
 * Convierte un pedido del backend al formato del frontend
 * @param {Object} pedidoBackend
 * @returns {Object}
 */
export function convertirPedidoBackend(pedidoBackend) {
  return {
    id: pedidoBackend.id,
    numeroGuia: pedidoBackend.numeroPedido || `PED-${pedidoBackend.id}`,
    destinatario: pedidoBackend.nombreConsultora || 'Sin nombre',
    direccion: pedidoBackend.direccionConsultora || 'Sin dirección',
    telefono: pedidoBackend.telefono || 'Sin teléfono',
    estado: mapearEstadoBackend(pedidoBackend.estado),
    fechaAsignacion: pedidoBackend.fechaEmision || new Date().toISOString().split('T')[0],
    ventanaEntrega: '09:00 - 18:00', // Por defecto
    piezas: pedidoBackend.totalCajas || 0,
    resumen: `${pedidoBackend.totalCajas || 0} cajas, ${pedidoBackend.totalUnidadesFueraCaja || 0} unidades sueltas`,
    referencia: pedidoBackend.observaciones || '',
    consultora: pedidoBackend.consultora,
    ruta: pedidoBackend.ruta,
    territorio: pedidoBackend.territorio,
    campania: pedidoBackend.campania,

    // Datos de entrega/no entrega
    nombreRecibe: pedidoBackend.nombreReceptor || '',
    relacionRecibe: pedidoBackend.recibidoPor || '',
    motivoNoEntrega: pedidoBackend.motivoNoEntrega || '',
    descripcionNoEntrega: pedidoBackend.descripcionNoEntrega || '',
    numeroIntento: pedidoBackend.numeroIntento || 1,

    // Evidencias (se mantiene estructura del frontend)
    evidencias: {
      fotos: [],
      nombreRecibe: pedidoBackend.nombreReceptor || '',
      relacionRecibe: pedidoBackend.recibidoPor || '',
      notasEntrega: pedidoBackend.observaciones || '',
      motivoNoEntrega: pedidoBackend.descripcionNoEntrega || '',
      boletaTomada: false,
      firma: pedidoBackend.firmaUrl || '',
      ultimaActualizacion: pedidoBackend.fechaActualizacion || null
    }
  };
}

export default {
  // Pedidos
  obtenerPedidosRepartidor,
  obtenerPedidosHoy,
  obtenerPedidosPendientes,
  obtenerDetallePedido,

  // Rastreo
  enviarUbicacion,

  // Recorridos
  iniciarRecorrido,
  finalizarRecorrido,
  obtenerRecorridoActivo,

  // Intentos
  registrarIntentoEntrega,
  obtenerIntentosEntrega,

  // Helpers
  mapearEstadoBackend,
  convertirPedidoBackend
};
