// src/screens/auth/LoginFlowWrapper.js
// Wrapper que conecta LoginFlow con AuthContext

import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import LoginFlow from './LoginFlow';
import DebugScreen from '../DebugScreen';

export default function LoginFlowWrapper() {
  const { login } = useAuth();
  const [showDebug, setShowDebug] = useState(false);

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

  const handleDebug = () => {
    setShowDebug(true);
  };

  if (showDebug) {
    return <DebugScreen onClose={() => setShowDebug(false)} />;
  }

  return (
    <LoginFlow
      palette="coral"
      skipOnboarding={false}
      backdrop="circle"
      loginAnimSize={260}
      onAuthenticated={handleAuthenticated}
      onDebug={handleDebug}
    />
  );
}
