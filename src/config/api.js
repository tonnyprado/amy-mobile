/**
 * Configuración centralizada de la API para móvil
 *
 * IMPORTANTE: La URL del backend se configura desde app.config.js usando variables de entorno
 */

import Constants from 'expo-constants';
import { getToken } from '../utils/secureStorage';
import { validateRequestUrl } from '../utils/networkSecurity';

// Obtener configuración desde app.config.js (extra)
const APP_ENV = Constants.expoConfig?.extra?.APP_ENV || 'development';
const API_BASE_URL_FROM_CONFIG = Constants.expoConfig?.extra?.API_BASE_URL;

// Fallbacks por entorno (en caso de que no esté configurado en extra)
const DEV_API_URL_LOCAL = 'http://192.168.0.14:8080';
const DEV_API_URL_RENDER = 'https://amy-backend-minutaapi.onrender.com';
const STAGING_API_URL = 'https://amy-backend-staging.onrender.com';
const PROD_API_URL = 'https://amy-backend-minutaapi.onrender.com';

// Determinar URL según entorno
const getApiBaseUrl = () => {
  // Si está configurado en app.config.js, usarlo
  if (API_BASE_URL_FROM_CONFIG) {
    return API_BASE_URL_FROM_CONFIG;
  }

  // Fallback según entorno
  if (APP_ENV === 'production') {
    return PROD_API_URL;
  } else if (APP_ENV === 'staging') {
    return STAGING_API_URL;
  } else {
    // Desarrollo: usar HTTPS por defecto (más seguro)
    return __DEV__ ? DEV_API_URL_RENDER : PROD_API_URL;
  }
};

// Base URL de la API
export const API_BASE_URL = getApiBaseUrl();

// Log de configuración (siempre, para debugging)
console.log('=== API Configuration ===');
console.log('Environment:', APP_ENV);
console.log('API_BASE_URL_FROM_CONFIG:', API_BASE_URL_FROM_CONFIG);
console.log('API Base URL (final):', API_BASE_URL);
console.log('__DEV__:', __DEV__);
console.log('=======================');

// Timeout para peticiones
const REQUEST_TIMEOUT = 5000;  // 5 segundos para peticiones normales
const AUTH_TIMEOUT = 10000;    // 10 segundos para auth
const WRITE_TIMEOUT = 8000;    // 8 segundos para escrituras (actividades, intentos)

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

    // Log para debugging (siempre)
    console.log('[apiClient] Fetch URL:', url);
    console.log('[apiClient] Method:', options.method || 'GET');

    // Validar seguridad de la conexión
    try {
      validateRequestUrl(url);
      console.log('[apiClient] URL validation passed');
    } catch (error) {
      console.error('[apiClient] URL validation failed:', error.message);
      throw error;
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

    // Determinar timeout según tipo de endpoint
    const isAuthEndpoint = endpoint.includes('/login') || endpoint.includes('/auth');
    const isWriteEndpoint = endpoint.includes('/actividades') ||
                            endpoint.includes('/intento-entrega') ||
                            endpoint.includes('/recorrido');
    const timeout = isAuthEndpoint ? AUTH_TIMEOUT :
                    isWriteEndpoint ? WRITE_TIMEOUT :
                    REQUEST_TIMEOUT;

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
