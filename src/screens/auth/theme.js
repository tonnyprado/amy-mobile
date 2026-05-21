// src/theme.js
// Paletas de color. Mismo formato que el proyecto principal de Mendiola
// (Repartidor App / Admin App) — copia este archivo tal cual a tu Expo.

export const THEMES = {
  coral: {
    canvas:     '#F8F4F0',
    surface:    '#FFFFFF',
    ink:        '#1A1110',
    muted:      '#6E5E5C',
    border:     'rgba(0,0,0,0.07)',
    accent:     '#FF7849',
    accentDk:   '#E66238',
    accentSoft: '#FFE9DD',
  },
  violet: {
    canvas:     '#F5F4FA',
    surface:    '#FFFFFF',
    ink:        '#1B1E36',
    muted:      '#7B7F9A',
    border:     'rgba(27,30,54,0.08)',
    accent:     '#8B6CF8',
    accentDk:   '#7253E8',
    accentSoft: '#EFE9FF',
  },
  indigo: {
    canvas:     '#F1F2F8',
    surface:    '#FFFFFF',
    ink:        '#11163A',
    muted:      '#6F7497',
    border:     'rgba(17,22,58,0.08)',
    accent:     '#5165F4',
    accentDk:   '#3D4FDC',
    accentSoft: '#E5E9FE',
  },
};

export const DEFAULT_PALETTE = 'coral';

// Tipografía: mantén las mismas familias que el resto de la plataforma
// para coherencia visual con Repartidor / Admin.
export const FONTS = {
  display: 'Montserrat',   // titulares
  body:    'Manrope',      // UI / labels / inputs
};
