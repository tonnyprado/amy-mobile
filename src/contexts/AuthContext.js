import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as loginApi, obtenerUsuarioActual } from '../services/authApi';

const AuthContext = createContext(null);

const STORAGE_KEY = '@amy_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario desde AsyncStorage al iniciar
  useEffect(() => {
    loadUserFromStorage();
  }, []);

  const loadUserFromStorage = async () => {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEY);
      if (userData) {
        setUser(JSON.parse(userData));
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

      // Verificar que sea repartidor
      if (userData.rol !== 'REPARTIDOR') {
        throw new Error('Acceso denegado. Esta app es solo para repartidores.');
      }

      // Guardar en estado y AsyncStorage (con accessToken incluido)
      setUser(userData);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(userData));

      return userData;
    } catch (error) {
      console.error('Error de login:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      setUser(null);
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

      console.log('🔄 Refrescando datos del usuario...');
      const userData = await obtenerUsuarioActual();

      // Mantener el accessToken en el objeto usuario para compatibilidad con apiClient
      const updatedUser = {
        ...userData,
        accessToken: user.accessToken
      };

      // Guardar datos actualizados
      setUser(updatedUser);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

      console.log('✅ Datos del usuario actualizados');
      console.log('🚛 Carritos actualizados:', updatedUser.repartidor?.carritos);

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
