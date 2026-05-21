/**
 * Sistema de diseño Amy Mobile
 * Paleta de colores: Violeta + Rojo + Fondos Claros
 * Inspirado en diseños modernos de delivery/tracking apps
 */

const theme = {
  colors: {
    // Fondos claros y suaves
    background: '#F8F9FA',      // Gris muy claro
    surface: '#FFFFFF',         // Blanco puro para cards
    surfaceElevated: '#FAFBFC', // Elementos elevados
    surfacePurple: '#F5F3FF',   // Fondo con tinte violeta
    surfaceOrange: '#FFF7ED',   // Fondo con tinte naranja
    surfacePink: '#FDF2F8',     // Fondo con tinte rosa

    // Primario (Violeta/Púrpura)
    primary: '#8B5CF6',         // Violeta principal
    primaryLight: '#A78BFA',    // Violeta claro
    primaryDark: '#7C3AED',     // Violeta oscuro

    // Secundario (Rojo que le gusta al usuario)
    secondary: '#DC2626',       // Rojo
    secondaryLight: '#EF4444',  // Rojo claro
    secondaryDark: '#B91C1C',   // Rojo oscuro

    // Acento (Naranja vibrante)
    accent: '#F97316',          // Naranja
    accentLight: '#FB923C',     // Naranja claro

    // Textos
    textPrimary: '#1F2937',     // Texto oscuro principal
    textSecondary: '#6B7280',   // Texto gris medio
    textMuted: '#9CA3AF',       // Texto apagado
    textOnPrimary: '#FFFFFF',   // Texto sobre colores primarios
    textOnDark: '#FFFFFF',      // Texto sobre fondos oscuros

    // Bordes muy sutiles
    border: '#E5E7EB',          // Borde sutil
    borderLight: '#F3F4F6',     // Borde casi invisible
    borderDark: '#D1D5DB',      // Borde más visible

    // Estados
    success: '#10B981',         // Verde éxito
    successLight: '#34D399',    // Verde claro
    warning: '#F59E0B',         // Amarillo advertencia
    warningLight: '#FBBF24',    // Amarillo claro
    error: '#DC2626',           // Rojo error
    errorLight: '#EF4444',      // Rojo claro
    info: '#3B82F6',            // Azul info
    infoLight: '#60A5FA',       // Azul claro

    // Colores adicionales para variedad
    purple: '#8B5CF6',
    orange: '#F97316',
    pink: '#EC4899',
    teal: '#14B8A6',
    indigo: '#6366F1',
    cyan: '#06B6D4',

    // Transparencias
    overlay: 'rgba(0, 0, 0, 0.5)',
    overlayLight: 'rgba(0, 0, 0, 0.3)',
    surfaceTransparent: 'rgba(255, 255, 255, 0.95)',
  },

  // Espaciado consistente
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  // Bordes redondeados (más redondeados para look moderno)
  borderRadius: {
    xs: 6,
    sm: 10,
    md: 14,
    lg: 18,
    xl: 24,
    xxl: 32,
    full: 9999,
  },

  // Tipografía
  typography: {
    // Tamaños
    sizes: {
      xs: 11,
      sm: 12,
      base: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      xxxl: 32,
    },

    // Pesos
    weights: {
      regular: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },

    // Alturas de línea
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Sombras suaves y elegantes
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },

    sm: {
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },

    md: {
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },

    lg: {
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },

    xl: {
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 24,
      elevation: 12,
    },

    // Sombras de colores específicos
    purple: {
      shadowColor: '#8B5CF6',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },

    red: {
      shadowColor: '#DC2626',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },

    orange: {
      shadowColor: '#F97316',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
  },
};

export default theme;

// Export individual modules for convenience
export const colors = theme.colors;
export const spacing = theme.spacing;
export const borderRadius = theme.borderRadius;
export const typography = theme.typography;
export const shadows = theme.shadows;
