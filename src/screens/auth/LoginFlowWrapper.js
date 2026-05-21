// src/screens/auth/LoginFlowWrapper.js
// Wrapper que conecta LoginFlow con AuthContext

import React from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import LoginFlow from './LoginFlow';

export default function LoginFlowWrapper() {
  const { login } = useAuth();

  const handleAuthenticated = async (username, password) => {
    try {
      await login(username, password);
      // La navegación se maneja automáticamente por el estado de autenticación
    } catch (error) {
      console.error('Error de login:', error);
      // Lanzar el error para que el LoginScreen lo maneje visualmente
      throw new Error(error.message || 'Usuario o contraseña incorrectos');
    }
  };

  return (
    <LoginFlow
      palette="coral"
      skipOnboarding={false}
      backdrop="circle"
      loginAnimSize={260}
      onAuthenticated={handleAuthenticated}
    />
  );
}
