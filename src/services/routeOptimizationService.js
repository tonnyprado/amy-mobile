/**
 * Servicio de Optimización de Rutas para Amy Mobile
 * Usa OSRM (Open Source Routing Machine) - 100% GRATIS
 *
 * Este servicio optimiza el orden de entrega de paquetes para minimizar
 * la distancia total recorrida y el tiempo de entrega.
 */

import { calculateDistance } from './routeService';

// Servidor público de OSRM - COMPLETAMENTE GRATIS
const OSRM_PUBLIC_URL = 'https://router.project-osrm.org';

/**
 * Optimiza la ruta de entrega de múltiples paquetes
 *
 * @param {Array} pedidos - Array de pedidos con {id, latitud, longitud, ...}
 * @param {Object} ubicacionActual - Ubicación actual del repartidor {lat, lng}
 * @returns {Promise<Object>} Objeto con la ruta optimizada
 *
 * @example
 * const resultado = await optimizarRuta(pedidosEnRuta, {lat: 19.4326, lng: -99.1332});
 * console.log(`Ahorro: ${resultado.ahorroKm}km`);
 */
export async function optimizarRuta(pedidos, ubicacionActual) {
  // Validaciones básicas
  if (!pedidos || pedidos.length === 0) {
    throw new Error('No hay pedidos para optimizar');
  }

  if (!ubicacionActual || !ubicacionActual.lat || !ubicacionActual.lng) {
    throw new Error('Ubicación actual no válida');
  }

  // Si solo hay 1 pedido, no necesita optimización
  if (pedidos.length === 1) {
    const distancia = calculateDistance(
      ubicacionActual.lat,
      ubicacionActual.lng,
      pedidos[0].latitud,
      pedidos[0].longitud
    );

    return {
      pedidos: pedidos,
      distanciaTotal: distancia,
      duracionTotal: Math.round(distancia / 40), // Velocidad promedio 40 km/h
      algoritmo: 'directo',
      ahorroKm: 0,
      ahorroPorcentaje: 0,
      mensaje: 'Solo hay 1 pedido, no se requiere optimización'
    };
  }

  // Validar que todos los pedidos tengan coordenadas
  const pedidosSinCoords = pedidos.filter(p => !p.latitud || !p.longitud);
  if (pedidosSinCoords.length > 0) {
    throw new Error(
      `${pedidosSinCoords.length} pedido(s) no tienen coordenadas GPS. ` +
      `Corrige las direcciones primero.`
    );
  }

  console.log('[OPTIMIZACIÓN] Iniciando optimización OSRM para', pedidos.length, 'pedidos');

  try {
    // Construir string de coordenadas para OSRM
    // Formato: lng,lat;lng,lat;... (OSRM usa lng primero, no lat)
    const coordenadas = [
      `${ubicacionActual.lng},${ubicacionActual.lat}`, // Punto de inicio
      ...pedidos.map(p => `${p.longitud},${p.latitud}`) // Destinos
    ].join(';');

    // Construir URL de OSRM Trip Service
    const url = `${OSRM_PUBLIC_URL}/trip/v1/driving/${coordenadas}` +
      '?source=first' +           // Comenzar desde el primer punto (ubicación actual)
      '&roundtrip=false' +         // No regresar al inicio (one-way)
      '&steps=true' +              // Incluir instrucciones paso a paso
      '&geometries=geojson' +      // Formato de geometría para el mapa
      '&overview=full';            // Geometría completa de la ruta

    console.log('[OPTIMIZACIÓN] Llamando a OSRM...');

    // Llamar a la API de OSRM
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AmyMobile/1.0' // Buena práctica identificarse
      }
    });

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const data = await response.json();

    // Verificar respuesta exitosa
    if (data.code !== 'Ok') {
      throw new Error(`OSRM error: ${data.code} - ${data.message || 'Error desconocido'}`);
    }

    // Extraer datos de la respuesta
    const trip = data.trips[0];
    const waypoints = data.waypoints;

    console.log('[OPTIMIZACIÓN] Ruta optimizada recibida:', {
      distancia: `${(trip.distance / 1000).toFixed(1)}km`,
      duracion: `${Math.round(trip.duration / 60)}min`
    });

    // Mapear el orden optimizado de los pedidos
    // waypoints contiene el orden óptimo en waypoint_index
    // El índice 0 es la ubicación actual, los demás son pedidos
    const indicesOrdenados = waypoints
      .slice(1) // Saltar el primer waypoint (ubicación actual)
      .map(wp => wp.waypoint_index - 1); // Ajustar índice (restar 1 porque waypoint 0 es ubicación)

    // Reordenar los pedidos según la optimización
    const pedidosOptimizados = indicesOrdenados.map(idx => pedidos[idx]);

    // Calcular la distancia original (sin optimizar) para comparación
    const distanciaOriginal = calcularDistanciaRutaOriginal(pedidos, ubicacionActual);

    // Calcular ahorro
    const ahorroMetros = Math.max(0, distanciaOriginal - trip.distance);
    const ahorroKm = (ahorroMetros / 1000).toFixed(1);
    const ahorroPorcentaje = distanciaOriginal > 0
      ? Math.round((ahorroMetros / distanciaOriginal) * 100)
      : 0;

    return {
      pedidos: pedidosOptimizados,
      distanciaTotal: trip.distance,       // en metros
      duracionTotal: trip.duration,        // en segundos
      geometria: trip.geometry,            // GeoJSON para mostrar en mapa
      waypoints: waypoints,
      legs: trip.legs,                     // Segmentos individuales de la ruta
      algoritmo: 'osrm_trip',
      ahorroKm: parseFloat(ahorroKm),
      ahorroPorcentaje: ahorroPorcentaje,
      distanciaOriginal: distanciaOriginal,
      mensaje: ahorroKm > 0
        ? `¡Ruta optimizada! Ahorrarás ${ahorroKm}km (${ahorroPorcentaje}%)`
        : 'El orden actual ya es óptimo'
    };

  } catch (error) {
    console.error('[OPTIMIZACIÓN] Error:', error);

    // Mejorar mensajes de error
    if (error.message.includes('Network request failed')) {
      throw new Error('Sin conexión a internet. Verifica tu conexión.');
    } else if (error.message.includes('timeout')) {
      throw new Error('La solicitud tardó demasiado. Intenta de nuevo.');
    } else {
      throw new Error(`Error al optimizar: ${error.message}`);
    }
  }
}

/**
 * Calcula la distancia total de la ruta original (orden actual de pedidos)
 * Usa distancia en línea recta (haversine) como aproximación
 */
function calcularDistanciaRutaOriginal(pedidos, ubicacionActual) {
  let distanciaTotal = 0;

  // Distancia desde ubicación actual al primer pedido
  distanciaTotal += calculateDistance(
    ubicacionActual.lat,
    ubicacionActual.lng,
    pedidos[0].latitud,
    pedidos[0].longitud
  );

  // Distancias entre pedidos consecutivos
  for (let i = 0; i < pedidos.length - 1; i++) {
    const distancia = calculateDistance(
      pedidos[i].latitud,
      pedidos[i].longitud,
      pedidos[i + 1].latitud,
      pedidos[i + 1].longitud
    );
    distanciaTotal += distancia;
  }

  return distanciaTotal;
}

/**
 * Formatea distancia en metros a formato legible
 * @param {number} metros - Distancia en metros
 * @returns {string} Distancia formateada (ej: "2.5km" o "850m")
 */
export function formatearDistancia(metros) {
  if (!metros || metros < 0) return '0m';

  if (metros < 1000) {
    return `${Math.round(metros)}m`;
  }
  return `${(metros / 1000).toFixed(1)}km`;
}

/**
 * Formatea duración en segundos a formato legible
 * @param {number} segundos - Duración en segundos
 * @returns {string} Duración formateada (ej: "1h 23min" o "45min")
 */
export function formatearDuracion(segundos) {
  if (!segundos || segundos < 0) return '0min';

  const horas = Math.floor(segundos / 3600);
  const minutos = Math.floor((segundos % 3600) / 60);

  if (horas > 0) {
    return `${horas}h ${minutos}min`;
  }
  return `${minutos}min`;
}

/**
 * Calcula métricas de comparación entre ruta original y optimizada
 * @param {Object} rutaOriginal - {distanciaTotal, duracionTotal}
 * @param {Object} rutaOptimizada - {distanciaTotal, duracionTotal}
 * @returns {Object} Métricas de ahorro
 */
export function calcularAhorro(rutaOriginal, rutaOptimizada) {
  const ahorroDistancia = rutaOriginal.distanciaTotal - rutaOptimizada.distanciaTotal;
  const ahorroTiempo = rutaOriginal.duracionTotal - rutaOptimizada.duracionTotal;

  return {
    ahorroDistanciaKm: (ahorroDistancia / 1000).toFixed(1),
    ahorroTiempoMin: Math.round(ahorroTiempo / 60),
    porcentajeAhorroDistancia: Math.round(
      (ahorroDistancia / rutaOriginal.distanciaTotal) * 100
    ),
    porcentajeAhorroTiempo: Math.round(
      (ahorroTiempo / rutaOriginal.duracionTotal) * 100
    )
  };
}

/**
 * Valida que los pedidos estén listos para optimización
 * @param {Array} pedidos - Array de pedidos
 * @returns {Object} {valido: boolean, errores: Array<string>}
 */
export function validarPedidosParaOptimizacion(pedidos) {
  const errores = [];

  if (!pedidos || pedidos.length === 0) {
    errores.push('No hay pedidos para optimizar');
  }

  if (pedidos.length === 1) {
    return {
      valido: false,
      errores: ['Se necesitan al menos 2 pedidos para optimizar'],
      advertencia: true
    };
  }

  // Verificar coordenadas
  const sinCoordenadas = pedidos.filter(p => !p.latitud || !p.longitud);
  if (sinCoordenadas.length > 0) {
    errores.push(
      `${sinCoordenadas.length} pedido(s) sin coordenadas GPS. ` +
      `Corrige las direcciones primero.`
    );
  }

  // Verificar que estén en estado EN_RUTA
  const noEnRuta = pedidos.filter(p => p.estado !== 'EN_RUTA');
  if (noEnRuta.length > 0) {
    errores.push(
      `Solo se pueden optimizar pedidos EN_RUTA. ` +
      `Tienes ${noEnRuta.length} pedido(s) en otro estado.`
    );
  }

  return {
    valido: errores.length === 0,
    errores: errores
  };
}

export default {
  optimizarRuta,
  formatearDistancia,
  formatearDuracion,
  calcularAhorro,
  validarPedidosParaOptimizacion
};
