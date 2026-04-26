import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Indicador de estado del GPS
 */
export default function GPSStatusIndicator({ tracking, ubicacion, ultimoEnvio, error }) {
  if (error && !tracking) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <View style={styles.textContainer}>
          <Text style={styles.errorTitle}>GPS Error</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </View>
    );
  }

  if (tracking) {
    return (
      <View style={[styles.container, styles.successContainer]}>
        <Text style={styles.successIcon}>📍</Text>
        <View style={styles.textContainer}>
          <Text style={styles.successTitle}>GPS Activo - Rastreando ubicación</Text>
          {ultimoEnvio && (
            <Text style={styles.subtitle}>
              Última actualización: {new Date(ultimoEnvio).toLocaleTimeString('es-MX')}
            </Text>
          )}
          {ubicacion && (
            <Text style={styles.details}>
              Precisión: {ubicacion.precision ? `${ubicacion.precision.toFixed(0)}m` : 'N/A'}
              {ubicacion.velocidad && ` | Velocidad: ${ubicacion.velocidad.toFixed(0)} km/h`}
            </Text>
          )}
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  successContainer: {
    backgroundColor: '#d1fae5',
    borderWidth: 1,
    borderColor: '#86efac',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#fca5a5',
  },
  successIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  successTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065f46',
    marginBottom: 2,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 2,
  },
  errorText: {
    fontSize: 12,
    color: '#991b1b',
  },
  subtitle: {
    fontSize: 12,
    color: '#047857',
    marginTop: 2,
  },
  details: {
    fontSize: 11,
    color: '#059669',
    marginTop: 2,
  },
});
