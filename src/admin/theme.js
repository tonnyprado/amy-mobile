/**
 * Admin Theme - Paleta cool neutral + acento coral
 * Mismo sistema de diseño que el diseño web de admin
 */

export const theme = {
  // Colores principales
  canvas: '#F1F3F5',           // Fondo principal cool neutral
  surface: '#FFFFFF',          // Cards blancas
  border: 'rgba(15,23,42,0.08)',
  ink: '#0E1116',              // Texto principal / botones oscuros
  muted: '#5C6470',            // Texto secundario
  accent: '#FF7849',           // Coral — único color cálido del sistema
  accentInk: '#0E1116',

  // Estados
  successFg: '#0B7E3E',
  successBg: '#E3F1E5',
  warnBg: '#FFE9B8',
  warnBorder: '#E8B547',
  dangerBg: '#FCE2DD',
  dangerFg: '#B83A22',
  infoBg: '#E6EEF8',
  infoFg: '#0F3A8A',

  // Backgrounds especiales
  statsCardTinted: '#F0F9F4',  // Verde tinted para hero stats
  statsCardDark: '#0E1116',    // Card oscura para hero stats
  statsCardInfo: '#EEF4FB',    // Azul tinted para hero stats
  incidenciasCardBg: '#0E1116', // Fondo oscuro para tabla incidencias
  topRepsBg: '#FFF6E6',        // Beige para top repartidores
  metricasBg: '#ECF1F8',       // Azul claro para métricas
};

export const FONTS = {
  display: 'Montserrat_700Bold',        // Títulos
  displayBlack: 'Montserrat_800ExtraBold', // Display grande
  body: 'Manrope_400Regular',           // Body
  bodySemibold: 'Manrope_600SemiBold',  // Body semibold
  bodyBold: 'Manrope_700Bold',          // Body bold
  mono: 'Manrope_400Regular',           // Códigos/cifras con tabular-nums
};

// Espaciado consistente
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 18,  // Padding lateral principal
  xxl: 24,
  xxxl: 32,
};

// Radios de bordes
export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 14,
  xl: 18,
  xxl: 22,
  full: 9999,
};

// Sombras
export const SHADOWS = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  cardHeavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  fab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 8,
  },
};

// Tamaños de texto
export const FONT_SIZES = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  xxl: 22,
  xxxl: 28,
  display: 34,
  hero: 48,
};

export default theme;
