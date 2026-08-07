/**
 * Configuración centralizada de la API para móvil
 *
 * IMPORTANTE: En producción, configurar API_BASE_URL con tu servidor
 */

import { getToken } from '../utils/secureStorage';
import { validateRequestUrl } from '../utils/networkSecurity';

// Base URL de la API - configurar según entorno
const DEV_API_URL_LOCAL = 'http://192.168.0.14:8080'; // Tu IP local + puerto del backend
const DEV_API_URL_RENDER = 'https://amy-backend-minutaapi.onrender.com'; // Render backend (HTTPS)
const PROD_API_URL = 'https://amy-backend-minutaapi.onrender.com'; // Render backend

// Configuración de desarrollo:
// - true: usar Render (HTTPS) incluso en desarrollo
// - false: usar servidor local (HTTP) para desarrollo
const USE_HTTPS_IN_DEV = false;

// En producción SIEMPRE usar HTTPS
export const API_BASE_URL = __DEV__
  ? (USE_HTTPS_IN_DEV ? DEV_API_URL_RENDER : DEV_API_URL_LOCAL)
  : PROD_API_URL;

// Timeout para peticiones (3 segundos para datos, 10 segundos para auth)
const REQUEST_TIMEOUT = 3000;
const AUTH_TIMEOUT = 10000;

function isFormDataBody(body) {
  return typeof FormData !== 'undefined' && body instanceof FormData;
}

// Helper para agregar timeout a fetch
function fetchWithTimeout(url, options = {}, timeout = REQUEST_TIMEOUT) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]);
}

// Helper para hacer peticiones HTTP
export const apiClient = {
  /**
   * Wrapper de fetch que agrega la base URL y token automáticamente
   * @param {string} endpoint - Endpoint relativo (ej: '/api/usuarios/login')
   * @param {RequestInit} options - Opciones de fetch
   * @returns {Promise<Response>}
   */
  fetch: async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    // Validar seguridad de la conexión
    validateRequestUrl(url);

    if (__DEV__) {
      console.log('Fetch URL:', url);
    }

    // Agregar headers por defecto (compresión gzip y token JWT)
    options.headers = {
      'Accept-Encoding': 'gzip, deflate',
      ...options.headers,
    };

    // Agregar token JWT desde SecureStore
    try {
      const token = await getToken();
      if (token) {
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${token}`
        };
      }
    } catch (error) {
      if (__DEV__) {
        console.warn('No se pudo obtener token:', error);
      }
    }

    // Usar timeout más largo para autenticación (10s) y normal para otros (3s)
    const isAuthEndpoint = endpoint.includes('/login') || endpoint.includes('/auth');
    const timeout = isAuthEndpoint ? AUTH_TIMEOUT : REQUEST_TIMEOUT;

    return fetchWithTimeout(url, options, timeout);
  },

  /**
   * GET request
   */
  get: (endpoint, options = {}) => {
    return apiClient.fetch(endpoint, {
      ...options,
      method: 'GET',
    });
  },

  /**
   * POST request
   */
  post: (endpoint, body, options = {}) => {
    const isFormData = isFormDataBody(body);
    return apiClient.fetch(endpoint, {
      ...options,
      method: 'POST',
      headers: {
        ...options.headers,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  /**
   * PUT request
   */
  put: (endpoint, body, options = {}) => {
    const isFormData = isFormDataBody(body);
    return apiClient.fetch(endpoint, {
      ...options,
      method: 'PUT',
      headers: {
        ...options.headers,
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      },
      body: isFormData ? body : JSON.stringify(body),
    });
  },

  /**
   * DELETE request
   */
  delete: (endpoint, options = {}) => {
    return apiClient.fetch(endpoint, {
      ...options,
      method: 'DELETE',
    });
  },
};

export default apiClient;
