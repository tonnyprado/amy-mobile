import React from 'react';
import { View, StyleSheet } from 'react-native';
import theme from '../theme';

/**
 * Componente Card reutilizable con sombras suaves
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido del card
 * @param {Object} props.style - Estilos adicionales
 * @param {boolean} props.elevated - Si debe tener elevación adicional
 */
export default function Card({ children, style, elevated = false, ...props }) {
  return (
    <View
      style={[
        styles.card,
        elevated && styles.cardElevated,
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderLight,
    ...theme.shadows.md,
  },
  cardElevated: {
    ...theme.shadows.lg,
  },
});
