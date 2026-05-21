import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import chatRealtimeService from '../services/chatRealtimeService';

export default function WebSocketStatusIndicator() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const removeListener = chatRealtimeService.addConnectionListener((connected) => {
      setIsConnected(connected);
    });

    return removeListener;
  }, []);

  // Solo mostrar cuando está desconectado o en desarrollo
  if (isConnected && !__DEV__) {
    return null;
  }

  return (
    <View style={[styles.container, isConnected ? styles.connected : styles.disconnected]}>
      <View style={[styles.dot, isConnected ? styles.dotConnected : styles.dotDisconnected]} />
      <Text style={styles.text}>
        {isConnected ? '● WebSocket Conectado' : '○ WebSocket Desconectado'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    right: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 9999,
  },
  connected: {
    backgroundColor: '#10b981',
  },
  disconnected: {
    backgroundColor: '#ef4444',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotConnected: {
    backgroundColor: '#ffffff',
  },
  dotDisconnected: {
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  text: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
});
