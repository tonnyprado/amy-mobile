/**
 * Configuración centralizada de la API para móvil
 *
 * IMPORTANTE: En producción, configurar API_BASE_URL con tu servidor
 */

// Base URL de la API - configurar según entorno
const DEV_API_URL = 'http://192.168.1.100:8080'; // Cambiar por tu IP local
const PROD_API_URL = 'https://amy-api.railway.app'; // Cambiar por tu URL de producción

export const API_BASE_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

// Helper para hacer peticiones HTTP
export const apiClient = {
  /**
   * Wrapper de fetch que agrega la base URL automáticamente
   * @param {string} endpoint - Endpoint relativo (ej: '/api/usuarios/login')
   * @param {RequestInit} options - Opciones de fetch
   * @returns {Promise<Response>}
   */
  fetch: (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
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
    return apiClient.fetch(endpoint, {
      ...options,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(body),
    });
  },

  /**
   * PUT request
   */
  put: (endpoint, body, options = {}) => {
    return apiClient.fetch(endpoint, {
      ...options,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      body: JSON.stringify(body),
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
