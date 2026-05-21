/**
 * Configuración centralizada de la API para móvil
 *
 * IMPORTANTE: En producción, configurar API_BASE_URL con tu servidor
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL de la API - configurar según entorno
const DEV_API_URL_LOCAL = 'http://192.168.0.27:8080'; // Tu IP local + puerto del backend
const DEV_API_URL_RAILWAY = 'https://controlminutasapi-production.up.railway.app'; // Railway backend
const PROD_API_URL = 'https://controlminutasapi-production.up.railway.app'; // Railway backend

// Cambiar entre local y Railway en desarrollo
export const API_BASE_URL = __DEV__ ? DEV_API_URL_LOCAL : PROD_API_URL;

const STORAGE_KEY = '@amy_user';

function isFormDataBody(body) {
  return typeof FormData !== 'undefined' && body instanceof FormData;
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
    console.log('🔗 Fetch URL:', url);

    // Agregar headers por defecto (compresión gzip y token JWT)
    options.headers = {
      'Accept-Encoding': 'gzip, deflate', // Optimización: habilitar compresión HTTP
      ...options.headers,
    };

    // Agregar token JWT si existe
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEY);
      if (userData) {
        const user = JSON.parse(userData);
        if (user.accessToken) {
          console.log('🔑 Agregando token JWT a la petición');
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${user.accessToken}`
          };
        }
      }
    } catch (error) {
      console.warn('⚠️ No se pudo obtener token:', error);
    }

    return fetch(url, options);
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
