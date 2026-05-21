/**
 * Servicio de navegación y cálculo de rutas
 * Usa OSRM (Open Source Routing Machine) - API pública y gratuita
 *
 * OSRM es un motor de enrutamiento de alto rendimiento para rutas de carretera.
 * Funciona tanto en web como en React Native.
 */

const OSRM_BASE_URL = 'https://router.project-osrm.org';
const routeCache = new Map();
const ROUTE_CACHE_TTL_MS = 5 * 60 * 1000;

function roundCoord(value) {
  return Number(value).toFixed(4);
}

function buildRouteCacheKey(origin, destination) {
  return [
    roundCoord(origin.lat),
    roundCoord(origin.lng),
    roundCoord(destination.lat),
    roundCoord(destination.lng),
  ].join('|');
}

/**
 * Calcula la ruta entre dos puntos
 * @param {Object} origin - {lat: number, lng: number}
 * @param {Object} destination - {lat: number, lng: number}
 * @returns {Promise<Object>} Ruta con geometría, distancia, duración e instrucciones
 */
export async function calculateRoute(origin, destination) {
  try {
    const cacheKey = buildRouteCacheKey(origin, destination);
    const cachedRoute = routeCache.get(cacheKey);

    if (cachedRoute && Date.now() - cachedRoute.timestamp < ROUTE_CACHE_TTL_MS) {
      return cachedRoute.data;
    }

    // OSRM espera formato: longitude,latitude
    const coords = `${origin.lng},${origin.lat};${destination.lng},${destination.lat}`;

    // Parámetros: steps=true para instrucciones paso a paso, overview=full para geometría completa
    const url = `${OSRM_BASE_URL}/route/v1/driving/${coords}?steps=true&geometries=geojson&overview=full`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Error al calcular ruta');
    }

    const data = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No se pudo encontrar una ruta');
    }

    const route = data.routes[0];

    const normalizedRoute = {
      distance: route.distance, // metros
      duration: route.duration, // segundos
      geometry: route.geometry.coordinates, // Array de [lng, lat]
      steps: parseSteps(route.legs[0].steps), // Instrucciones paso a paso
      bounds: calculateBounds(route.geometry.coordinates),
      raw: route
    };

    routeCache.set(cacheKey, {
      data: normalizedRoute,
      timestamp: Date.now(),
    });

    return normalizedRoute;

  } catch (error) {
    console.error('Error calculando ruta:', error);
    throw error;
  }
}

/**
 * Parsea las instrucciones de navegación
 */
function parseSteps(steps) {
  return steps.map((step, index) => ({
    instruction: step.maneuver.instruction || getManeuverInstruction(step.maneuver),
    distance: step.distance,
    duration: step.duration,
    type: step.maneuver.type,
    modifier: step.maneuver.modifier,
    location: step.maneuver.location, // [lng, lat]
    stepNumber: index + 1
  }));
}

/**
 * Genera instrucción en español basada en el tipo de maniobra
 */
function getManeuverInstruction(maneuver) {
  const { type, modifier } = maneuver;

  const instructions = {
    'turn': {
      'left': 'Gira a la izquierda',
      'right': 'Gira a la derecha',
      'slight left': 'Gira ligeramente a la izquierda',
      'slight right': 'Gira ligeramente a la derecha',
      'sharp left': 'Gira bruscamente a la izquierda',
      'sharp right': 'Gira bruscamente a la derecha'
    },
    'new name': {
      'straight': 'Continúa recto'
    },
    'depart': {
      default: 'Inicia el recorrido'
    },
    'arrive': {
      default: 'Has llegado a tu destino'
    },
    'merge': {
      'left': 'Incorpórate a la izquierda',
      'right': 'Incorpórate a la derecha',
      'slight left': 'Incorpórate ligeramente a la izquierda',
      'slight right': 'Incorpórate ligeramente a la derecha'
    },
    'roundabout': {
      default: 'Toma la rotonda'
    },
    'exit roundabout': {
      default: 'Sal de la rotonda'
    },
    'continue': {
      default: 'Continúa'
    }
  };

  if (instructions[type]) {
    return instructions[type][modifier] || instructions[type].default || 'Continúa';
  }

  return 'Continúa por esta vía';
}

/**
 * Calcula los límites (bounds) de las coordenadas de la ruta
 * Retorna en formato: [[minLat, minLng], [maxLat, maxLng]]
 */
function calculateBounds(coordinates) {
  if (!coordinates || coordinates.length === 0) {
    return null;
  }

  let minLng = coordinates[0][0];
  let maxLng = coordinates[0][0];
  let minLat = coordinates[0][1];
  let maxLat = coordinates[0][1];

  coordinates.forEach(([lng, lat]) => {
    if (lng < minLng) minLng = lng;
    if (lng > maxLng) maxLng = lng;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  });

  return [
    [minLat, minLng],  // southWest corner
    [maxLat, maxLng]   // northEast corner
  ];
}

/**
 * Formatea distancia en formato legible
 * @param {number} meters - Distancia en metros
 * @returns {string} Distancia formateada
 */
export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Formatea duración en formato legible
 * @param {number} seconds - Duración en segundos
 * @returns {string} Duración formateada
 */
export function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes} min`;
}

/**
 * Calcula la distancia entre dos puntos (Haversine)
 * @param {Object} point1 - {lat: number, lng: number}
 * @param {Object} point2 - {lat: number, lng: number}
 * @returns {number} Distancia en metros
 */
export function calculateDistance(point1, point2) {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (point1.lat * Math.PI) / 180;
  const φ2 = (point2.lat * Math.PI) / 180;
  const Δφ = ((point2.lat - point1.lat) * Math.PI) / 180;
  const Δλ = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
}

export default {
  calculateRoute,
  formatDistance,
  formatDuration,
  calculateDistance
};
