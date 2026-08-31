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
  const endpoint = `/api/pedidos/repartidor/${idRepartidor}/hoy`;
  const response = await apiClient.get(endpoint);

  // 403/404 = No hay pedidos asignados (esto es normal, no es error)
  if (response.status === 403 || response.status === 404) {
    return [];
  }

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
 * Cambia todos los pedidos PENDIENTES de un repartidor a EN_RUTA
 * @param {string} idRepartidor - ID del repartidor (ej: "0001")
 * @returns {Promise<Object>} Resultado con cantidad de pedidos actualizados
 */
export async function comenzarRuta(idRepartidor) {
  const response = await apiClient.post(`/api/pedidos/repartidor/${idRepartidor}/comenzar-ruta`);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Error al comenzar la ruta');
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
 * @param {string} intento.motivoFallo - CLIENTE_NO_ESTABA, DATOS_INCORRECTOS, ALTO_RIESGO, CAMBIO_DOMICILIO, RECHAZO, OTRA_RAZON
 * @param {string} intento.descripcionFallo
 * @param {string} intento.subtipoAviso - ALTO_RIESGO, CAMBIO_DOMICILIO, DATO_INCORRECTO, RECHAZO, AVISO
 * @param {string} intento.fotoEvidenciaUrl
 * @param {string} intento.fotoMapaUrl - Foto del mapa/ubicacion
 * @param {string} intento.fotoLlamadaUrl - Foto de evidencia de llamada
 * @param {string} intento.mensajesAdicionales - Mensajes adicionales enviados
 * @param {string} intento.firmaUrl
 * @param {string} intento.observaciones
 * @param {string} intento.nombreReceptor - Nombre de quien recibe
 * @param {string} intento.recibidoPor - TITULAR, CONSULTORA, FAMILIAR, LIDER, GZ, VECINO
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
    subtipoAviso: intento.subtipoAviso || null,
    fotoEvidenciaUrl: intento.fotoEvidenciaUrl || null,
    fotoMapaUrl: intento.fotoMapaUrl || null,
    fotoLlamadaUrl: intento.fotoLlamadaUrl || null,
    mensajesAdicionales: intento.mensajesAdicionales || null,
    firmaUrl: intento.firmaUrl || null,
    observaciones: intento.observaciones || null,
    nombreReceptor: intento.nombreReceptor || null,
    recibidoPor: intento.recibidoPor || null
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
// LOG DE ACTIVIDADES
// ============================================================================

/**
 * Registra una actividad del repartidor para el log de monitoreo
 * @param {Object} actividad
 * @param {string} actividad.repartidorId - ID del repartidor
 * @param {string} actividad.tipo - Tipo de actividad (INICIO_RECORRIDO, ENTREGA_EXITOSA, etc.)
 * @param {number} actividad.pedidoId - ID del pedido (opcional)
 * @param {string} actividad.descripcion - Descripción de la actividad
 * @param {string} actividad.pedidoNumero - Número de pedido (opcional)
 * @param {string} actividad.consultora - Número de consultora (opcional)
 * @param {string} actividad.direccion - Dirección (opcional)
 * @param {number} actividad.latitud - Latitud GPS (opcional)
 * @param {number} actividad.longitud - Longitud GPS (opcional)
 * @param {Object} actividad.metadata - Datos adicionales (opcional)
 * @returns {Promise<Object>}
 */
export async function registrarActividad(actividad, reintentos = 2) {
  const payload = {
    repartidorId: actividad.repartidorId,
    tipo: actividad.tipo,
    pedidoId: actividad.pedidoId || null,
    descripcion: actividad.descripcion || null,
    pedidoNumero: actividad.pedidoNumero || null,
    consultora: actividad.consultora || null,
    direccion: actividad.direccion || null,
    latitud: actividad.latitud || null,
    longitud: actividad.longitud || null,
    duracionSegundos: actividad.duracionSegundos || null,
    metadata: actividad.metadata || null
  };

  for (let intento = 0; intento <= reintentos; intento++) {
    try {
      const response = await apiClient.post('/api/actividades', payload);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Sin detalle');
        console.warn(`[ACTIVIDAD] Error HTTP ${response.status}: ${errorText}`);
        if (intento < reintentos) {
          console.log(`[ACTIVIDAD] Reintentando (${intento + 1}/${reintentos})...`);
          await new Promise(r => setTimeout(r, 1000 * (intento + 1)));
          continue;
        }
        return null;
      }

      const result = await response.json();
      console.log(`[ACTIVIDAD] Registrada: ${actividad.tipo}`);
      return result;
    } catch (error) {
      console.warn(`[ACTIVIDAD] Error intento ${intento + 1}:`, error.message);
      if (intento < reintentos) {
        await new Promise(r => setTimeout(r, 1000 * (intento + 1)));
        continue;
      }
      return null;
    }
  }
  return null;
}

/**
 * Tipos de actividad disponibles
 */
export const TIPO_ACTIVIDAD = {
  // Recorrido
  INICIO_RECORRIDO: 'INICIO_RECORRIDO',
  FIN_RECORRIDO: 'FIN_RECORRIDO',
  PAUSA_RECORRIDO: 'PAUSA_RECORRIDO',
  REANUDA_RECORRIDO: 'REANUDA_RECORRIDO',
  // Navegación
  INICIO_NAVEGACION: 'INICIO_NAVEGACION',
  FIN_NAVEGACION: 'FIN_NAVEGACION',
  CAMBIO_DESTINO: 'CAMBIO_DESTINO',
  // Entregas
  INTENTO_ENTREGA: 'INTENTO_ENTREGA',
  ENTREGA_EXITOSA: 'ENTREGA_EXITOSA',
  ENTREGA_FALLIDA: 'ENTREGA_FALLIDA',
  FOTO_EVIDENCIA: 'FOTO_EVIDENCIA',
  FIRMA_CAPTURADA: 'FIRMA_CAPTURADA',
  // Comunicación
  LLAMADA_CONSULTORA: 'LLAMADA_CONSULTORA',
  MENSAJE_CONSULTORA: 'MENSAJE_CONSULTORA',
  MENSAJE_ADMIN: 'MENSAJE_ADMIN',
  // App
  LOGIN: 'LOGIN',
  LOGOUT: 'LOGOUT',
  APP_ABIERTA: 'APP_ABIERTA',
  APP_CERRADA: 'APP_CERRADA',
  UBICACION_ACTUALIZADA: 'UBICACION_ACTUALIZADA',
  // Pedidos
  VER_PEDIDO: 'VER_PEDIDO',
  ESCANEAR_CODIGO: 'ESCANEAR_CODIGO',
  MARCAR_PROBLEMA: 'MARCAR_PROBLEMA',
  NOTA_AGREGADA: 'NOTA_AGREGADA'
};

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
    numeroPedido: pedidoBackend.numeroPedido,
    destinatario: pedidoBackend.nombreConsultora || 'Sin nombre',
    nombreConsultora: pedidoBackend.nombreConsultora,
    direccion: pedidoBackend.direccionConsultora || 'Sin dirección',
    direccionConsultora: pedidoBackend.direccionConsultora,
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

    // Coordenadas GPS (necesarias para el mapa de navegación)
    latitud: pedidoBackend.latitud || null,
    longitud: pedidoBackend.longitud || null,

    // Dirección corregida por el repartidor (si la original estaba mal)
    direccionCorregida: pedidoBackend.direccionCorregida || null,

    // Datos de entrega/no entrega
    nombreRecibe: pedidoBackend.nombreReceptor || '',
    relacionRecibe: pedidoBackend.recibidoPor || '',
    motivoNoEntrega: pedidoBackend.motivoNoEntrega || '',
    descripcionNoEntrega: pedidoBackend.descripcionNoEntrega || '',
    numeroIntento: pedidoBackend.numeroIntento || 1,

    // Sistema AVISO
    tipoPedido: pedidoBackend.tipoPedido || 'NORMAL',
    subtipoAviso: pedidoBackend.subtipoAviso || null,
    intentosAviso: pedidoBackend.intentosAviso || 0,

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
  comenzarRuta,

  // Rastreo
  enviarUbicacion,

  // Recorridos
  iniciarRecorrido,
  finalizarRecorrido,
  obtenerRecorridoActivo,

  // Intentos
  registrarIntentoEntrega,
  obtenerIntentosEntrega,

  // Actividades
  registrarActividad,
  TIPO_ACTIVIDAD,

  // Helpers
  mapearEstadoBackend,
  convertirPedidoBackend
};
