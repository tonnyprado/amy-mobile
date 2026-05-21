/**
 * BoxScannerScreen - TEMPORALMENTE DESHABILITADO
 *
 * Vision Camera requiere un Custom Development Client.
 * Para habilitar esta funcionalidad:
 * 1. Ejecuta: npx expo prebuild
 * 2. Ejecuta: npx expo run:ios (o run:android)
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function BoxScannerScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.content}>
        <Text style={styles.icon}>📦📷</Text>
        <Text style={styles.title}>Escáner de Cajas</Text>
        <Text style={styles.subtitle}>No disponible en Expo Go</Text>

        <View style={styles.card}>
          <Text style={styles.message}>
            Esta funcionalidad requiere un Custom Development Client porque usa Vision Camera (OCR en tiempo real).
          </Text>

          <Text style={styles.instructions}>
            Para habilitar:
          </Text>
          <Text style={styles.code}>
            npx expo prebuild{'\n'}
            npx expo run:ios
          </Text>
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>← Volver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  icon: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    marginBottom: 32,
  },
  card: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    width: '100%',
  },
  message: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 20,
    marginBottom: 16,
  },
  instructions: {
    fontSize: 14,
    color: '#f1f5f9',
    fontWeight: '600',
    marginBottom: 8,
  },
  code: {
    fontSize: 12,
    color: '#10b981',
    fontFamily: 'monospace',
    backgroundColor: '#0f172a',
    padding: 12,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
