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
  console.log('[authApi] Intentando login para usuario:', username);

  const response = await apiClient.post('/api/usuarios/login', {
    usuario: username,
    password: password
  });

  console.log('[authApi] Response status:', response.status);
  console.log('[authApi] Response ok:', response.ok);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error de autenticación' }));
    console.error('[authApi] Login falló:', error);
    throw new Error(error.message || 'Credenciales inválidas');
  }

  const userData = await response.json();
  console.log('[authApi] Login exitoso para usuario:', userData.usuario);
  return userData;
}

/**
 * Obtiene los datos actualizados del usuario actual
 * (usa el token guardado automáticamente por apiClient)
 * @returns {Promise<Object>} Usuario actualizado
 */
export async function obtenerUsuarioActual() {
  const response = await apiClient.get('/api/usuarios/me');

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error al obtener usuario' }));
    throw new Error(error.message || 'No se pudo obtener la información del usuario');
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
  obtenerUsuarioActual,
  esRepartidor
};
