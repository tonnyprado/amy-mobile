import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import Constants from 'expo-constants';
import { API_BASE_URL } from '../config/api';
import { apiClient } from '../config/api';

export default function DebugScreen({ onClose }) {
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const testConnection = async () => {
    setTesting(true);
    setTestResult(null);

    try {
      console.log('🧪 Iniciando test de conexión...');

      const startTime = Date.now();
      const response = await apiClient.get('/api/health');
      const endTime = Date.now();

      const responseText = await response.text();

      setTestResult({
        success: response.ok,
        status: response.status,
        statusText: response.statusText,
        time: endTime - startTime,
        body: responseText.substring(0, 200),
      });

      Alert.alert(
        response.ok ? '✅ Conexión exitosa' : '❌ Error de conexión',
        `Status: ${response.status}\nTiempo: ${endTime - startTime}ms`
      );
    } catch (error) {
      console.error('❌ Error en test:', error);
      setTestResult({
        success: false,
        error: error.message,
      });
      Alert.alert('❌ Error', error.message);
    } finally {
      setTesting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      {onClose && (
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>← Volver al Login</Text>
        </TouchableOpacity>
      )}
      <Text style={styles.title}>🔧 Pantalla de Debug</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuración de API</Text>
        <InfoRow label="API Base URL" value={API_BASE_URL} />
        <InfoRow label="APP_ENV" value={Constants.expoConfig?.extra?.APP_ENV || 'N/A'} />
        <InfoRow label="__DEV__" value={String(__DEV__)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Información de Build</Text>
        <InfoRow label="App Version" value={Constants.expoConfig?.version || 'N/A'} />
        <InfoRow label="Platform" value={Constants.platform?.os || 'N/A'} />
        <InfoRow label="Expo SDK" value={Constants.expoConfig?.sdkVersion || 'N/A'} />
      </View>

      <TouchableOpacity
        style={[styles.button, testing && styles.buttonDisabled]}
        onPress={testConnection}
        disabled={testing}
      >
        <Text style={styles.buttonText}>
          {testing ? '⏳ Probando conexión...' : '🧪 Probar conexión al backend'}
        </Text>
      </TouchableOpacity>

      {testResult && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resultado del Test</Text>
          {testResult.success !== undefined && (
            <>
              <InfoRow
                label="Estado"
                value={testResult.success ? '✅ Exitoso' : '❌ Fallido'}
              />
              <InfoRow label="HTTP Status" value={String(testResult.status)} />
              <InfoRow label="Tiempo" value={`${testResult.time}ms`} />
              {testResult.body && (
                <InfoRow label="Respuesta" value={testResult.body} multiline />
              )}
            </>
          )}
          {testResult.error && (
            <InfoRow label="Error" value={testResult.error} multiline />
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Variables de Entorno</Text>
        <InfoRow
          label="API_BASE_URL_FROM_CONFIG"
          value={Constants.expoConfig?.extra?.API_BASE_URL || 'No configurado'}
        />
        <InfoRow
          label="GOOGLE_MAPS_API_KEY"
          value={Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY ? '✅ Configurado' : '❌ No configurado'}
        />
      </View>
    </ScrollView>
  );
}

function InfoRow({ label, value, multiline = false }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={[styles.value, multiline && styles.valueMultiline]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  closeButton: {
    marginTop: 40,
    marginBottom: 10,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  infoRow: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    color: '#333',
    backgroundColor: '#f0f0f0',
    padding: 8,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  valueMultiline: {
    minHeight: 60,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
