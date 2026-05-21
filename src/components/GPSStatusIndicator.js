import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../theme';

/**
 * Indicador de estado del GPS
 */
export default function GPSStatusIndicator({ tracking, ubicacion, ultimoEnvio, error }) {
  if (error && !tracking) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Ionicons name="warning" size={20} color={theme.colors.error} />
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
        <Ionicons name="location" size={20} color={theme.colors.success} />
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
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.lg,
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  successContainer: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.success,
  },
  errorContainer: {
    backgroundColor: theme.colors.surfaceElevated,
    borderWidth: 1,
    borderColor: theme.colors.error,
  },
  textContainer: {
    flex: 1,
  },
  successTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.success,
    marginBottom: 2,
  },
  errorTitle: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.error,
    marginBottom: 2,
  },
  errorText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.error,
  },
  subtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  details: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginTop: 2,
  },
});
