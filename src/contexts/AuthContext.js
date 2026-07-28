import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveToken, getToken, deleteToken } from '../utils/secureStorage';
import { login as loginApi, obtenerUsuarioActual } from '../services/authApi';

const AuthContext = createContext(null);

// Datos no sensibles del usuario (sin token)
const STORAGE_KEY = '@amy_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde storage al iniciar
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      // Cargar datos del usuario desde AsyncStorage
      const userData = await AsyncStorage.getItem(STORAGE_KEY);
      // Cargar token desde SecureStore
      const token = await getToken();

      if (userData && token) {
        const parsedUser = JSON.parse(userData);
        // Combinar usuario con token para mantener compatibilidad
        setUser({ ...parsedUser, accessToken: token });
      } else if (userData || token) {
        // Datos inconsistentes, limpiar todo
        console.warn('Datos de sesión inconsistentes, limpiando...');
        await AsyncStorage.removeItem(STORAGE_KEY);
        await deleteToken();
      }
    } catch (error) {
      console.error('Error al cargar usuario:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const userData = await loginApi(username, password);

      // Verificar que sea repartidor o administrador
      if (userData.rol !== 'REPARTIDOR' && userData.rol !== 'ADMIN') {
        throw new Error('Acceso denegado. Esta app es solo para repartidores y administradores.');
      }

      // Extraer token para almacenamiento seguro
      const { accessToken, ...userWithoutToken } = userData;

      // Guardar token de forma segura en SecureStore
      await saveToken(accessToken);

      // Guardar datos no sensibles en AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutToken));

      // Mantener compatibilidad con el resto de la app
      setUser(userData);

      return userData;
    } catch (error) {
      console.error('Error de login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      // Eliminar token seguro
      await deleteToken();
      // Eliminar datos de usuario
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const refreshUser = async () => {
    try {
      if (!user) {
        console.warn('No hay usuario para refrescar');
        return;
      }

      console.log('Refrescando datos del usuario...');
      const userData = await obtenerUsuarioActual();

      // Obtener token actual desde SecureStore
      const currentToken = await getToken();

      // Mantener el accessToken en el objeto usuario para compatibilidad
      const updatedUser = {
        ...userData,
        accessToken: currentToken
      };

      // Guardar datos no sensibles actualizados
      const { accessToken, ...userWithoutToken } = updatedUser;
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userWithoutToken));

      setUser(updatedUser);

      console.log('Datos del usuario actualizados');

      return updatedUser;
    } catch (error) {
      console.error('Error al refrescar usuario:', error);
      // Si el token expiró, hacer logout
      if (error.message.includes('Token') || error.message.includes('401')) {
        console.warn('Token expirado, cerrando sesión');
        await logout();
      }
      throw error;
    }
  };

  const value = {
    user,
    login,
    logout,
    refreshUser,
    loading,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
