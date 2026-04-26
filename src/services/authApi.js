/**
 * Servicio de autenticación para repartidores
 */

import { apiClient } from '../config/api';

/**
 * Inicia sesión con credenciales
 * @param {string} username
 * @param {string} password
 * @returns {Promise<Object>} Usuario autenticado
 */
export async function login(username, password) {
  const response = await apiClient.post('/api/usuarios/login', {
    usuario: username,
    contrasena: password
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de autenticación' }));
    throw new Error(error.message || 'Credenciales inválidas');
  }

  return await response.json();
}

/**
 * Verifica si el usuario tiene rol de repartidor
 * @param {Object} user
 * @returns {boolean}
 */
export function esRepartidor(user) {
  return user?.rol === 'REPARTIDOR';
}

export default {
  login,
  esRepartidor
};
