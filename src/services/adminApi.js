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
// ESTADÍSTICAS Y MONITOREO
// ============================================================================

/**
 * Obtiene todos los pedidos del día actual (de todos los repartidores)
 *
 * @returns {Promise<Array>} Lista de todos los pedidos de hoy
 */
export async function obtenerTodosPedidosHoy() {
  try {
    console.log('📦 Obteniendo todos los pedidos de hoy...');

    const response = await apiClient.get('/api/pedidos/hoy');

    if (!response.ok) {
      if (response.status === 404) {
        return []; // No hay pedidos hoy
      }
      throw new Error('Error al obtener pedidos de hoy');
    }

    const pedidos = await response.json();
    console.log(`✅ Se encontraron ${pedidos.length} pedidos de hoy`);
    return pedidos;

  } catch (error) {
    console.error('❌ Error en obtenerTodosPedidosHoy:', error);
    throw error;
  }
}

/**
 * Obtiene lista de repartidores activos con su información de rastreo
 *
 * @returns {Promise<Array>} Lista de repartidores en ruta con datos GPS
 */
export async function obtenerRepartidoresActivos() {
  try {
    console.log('🚚 Obteniendo repartidores activos...');

    const response = await apiClient.get('/api/rastreo/activos');

    if (!response.ok) {
      if (response.status === 404) {
        return []; // No hay repartidores activos
      }
      throw new Error('Error al obtener repartidores activos');
    }

    const activos = await response.json();
    console.log(`✅ Se encontraron ${activos.length} repartidores activos`);
    return activos;

  } catch (error) {
    console.error('❌ Error en obtenerRepartidoresActivos:', error);
    throw error;
  }
}

/**
 * Obtiene el historial de ubicaciones de un repartidor
 *
 * @param {string} idRepartidor - ID del repartidor
 * @param {string} fechaInicio - Fecha inicio en formato ISO
 * @param {string} fechaFin - Fecha fin en formato ISO
 * @returns {Promise<Array>} Historial de ubicaciones
 */
export async function obtenerHistorialUbicaciones(idRepartidor, fechaInicio, fechaFin) {
  try {
    console.log(`📍 Obteniendo historial de ${idRepartidor}...`);

    const params = new URLSearchParams();
    if (fechaInicio) params.append('fechaInicio', fechaInicio);
    if (fechaFin) params.append('fechaFin', fechaFin);

    const url = `/api/rastreo/repartidor/${idRepartidor}/historial${params.toString() ? '?' + params.toString() : ''}`;
    const response = await apiClient.get(url);

    if (!response.ok) {
      if (response.status === 404) {
        return [];
      }
      throw new Error('Error al obtener historial de ubicaciones');
    }

    const historial = await response.json();
    console.log(`✅ Se encontraron ${historial.length} registros de ubicación`);
    return historial;

  } catch (error) {
    console.error('❌ Error en obtenerHistorialUbicaciones:', error);
    throw error;
  }
}

/**
 * Obtiene estadísticas agregadas del día actual
 *
 * @returns {Promise<Object>} Estadísticas generales
 */
export async function obtenerEstadisticasDia() {
  try {
    console.log('📊 Calculando estadísticas del día...');

    // Obtener datos base
    const [pedidos, repartidores, activos] = await Promise.all([
      obtenerTodosPedidosHoy(),
      obtenerRepartidores(),
      obtenerRepartidoresActivos()
    ]);

    // Calcular estadísticas
    const totalPedidos = pedidos.length;
    const entregados = pedidos.filter(p => p.estado === 'ENTREGADO').length;
    const enRuta = pedidos.filter(p => p.estado === 'EN_RUTA').length;
    const pendientes = pedidos.filter(p => p.estado === 'PENDIENTE').length;
    const noEntregados = pedidos.filter(p => p.estado === 'NO_ENTREGADO').length;
    const avisos = pedidos.filter(p => p.tipoPedido === 'AVISO').length;

    // Calcular incidencias por motivo
    const incidenciasPorMotivo = {
      CLIENTE_NO_ESTABA: 0,
      DATOS_INCORRECTOS: 0,
      ALTO_RIESGO: 0,
      CAMBIO_DOMICILIO: 0,
      RECHAZO: 0,
      OTRA_RAZON: 0
    };

    pedidos.forEach(p => {
      if (p.estado === 'NO_ENTREGADO' && p.motivoNoEntrega) {
        incidenciasPorMotivo[p.motivoNoEntrega] = (incidenciasPorMotivo[p.motivoNoEntrega] || 0) + 1;
      }
    });

    // Calcular intentos de entrega
    const intentosPorNumero = {
      primero: 0,
      segundo: 0,
      tercero: 0,
      masDeTres: 0
    };

    pedidos.forEach(p => {
      const intento = p.numeroIntento || 1;
      if (intento === 1) intentosPorNumero.primero++;
      else if (intento === 2) intentosPorNumero.segundo++;
      else if (intento === 3) intentosPorNumero.tercero++;
      else intentosPorNumero.masDeTres++;
    });

    // Calcular alertas (basado en datos de rastreo)
    const alertas = {
      alta: 0,
      media: 0,
      baja: 0,
      total: 0
    };

    activos.forEach(r => {
      // Batería baja
      if (r.bateria !== null && r.bateria < 10) alertas.alta++;
      else if (r.bateria !== null && r.bateria < 20) alertas.media++;

      // Velocidad inusual
      if (r.velocidad !== null && r.velocidad > 120) alertas.alta++;

      // Sin actualización (verificar ultimaActualizacion)
      if (r.ultimaActualizacion) {
        const minutosDesdeUltimaActualizacion =
          (new Date() - new Date(r.ultimaActualizacion)) / 1000 / 60;
        if (minutosDesdeUltimaActualizacion > 45) alertas.alta++;
      }
    });

    alertas.total = alertas.alta + alertas.media + alertas.baja;

    // Calcular tasa de éxito
    const tasaExito = totalPedidos > 0
      ? Math.round((entregados / totalPedidos) * 100)
      : 0;

    const tasaRechazo = totalPedidos > 0
      ? Math.round((noEntregados / totalPedidos) * 100)
      : 0;

    // Calcular velocidad de entrega (comparado con expectativa)
    const ahora = new Date();
    const horaActual = ahora.getHours();
    const minutosActuales = ahora.getMinutes();
    const minutosDesde8AM = (horaActual - 8) * 60 + minutosActuales;
    const tiempoDisponible = 14 * 60; // 8 AM a 10 PM = 14 horas
    const porcentajeEsperado = Math.min(100, Math.round((minutosDesde8AM / tiempoDisponible) * 100));

    let velocidad = 'bien';
    if (tasaExito >= porcentajeEsperado) velocidad = 'adelante';
    else if (tasaExito < porcentajeEsperado - 10) velocidad = 'atrasado';

    const estadisticas = {
      totalPedidos,
      entregados,
      enRuta,
      pendientes,
      noEntregados,
      avisos,
      tasaExito,
      tasaRechazo,
      velocidad,
      porcentajeEsperado,
      incidenciasPorMotivo,
      intentosPorNumero,
      alertas,
      repartidoresActivos: activos.length,
      totalRepartidores: repartidores.length,
      promedioEntregasPorRepartidor: repartidores.length > 0
        ? Math.round(entregados / repartidores.length)
        : 0
    };

    console.log('✅ Estadísticas calculadas:', estadisticas);
    return estadisticas;

  } catch (error) {
    console.error('❌ Error en obtenerEstadisticasDia:', error);
    throw error;
  }
}
