// src/theme.js
// Paleta de colores tokens. En Expo / React Native usa este archivo
// tal cual — no necesita transformación.

export const PALETTES = {
  lime: {
    canvas: '#F4F4EF', surface: '#FFFFFF', border: 'rgba(0,0,0,0.07)',
    ink: '#0F0F0F', muted: '#6E6E6E',
    accent: '#B8FF3C', accentInk: '#0F0F0F',
    mapBg: '#EFEFEA', mapLine: '#C9C9C2',
    successFg: '#0B7E3E', successBg: '#D6F4DD',
    warnBg: '#FFE9A8', warnBorder: '#F0CB55',
  },
  coral: {
    canvas: '#F8F4F0', surface: '#FFFFFF', border: 'rgba(0,0,0,0.07)',
    ink: '#1A1110', muted: '#6E5E5C',
    accent: '#FF7849', accentInk: '#1A1110',
    mapBg: '#F0EBE6', mapLine: '#D2CBC3',
    successFg: '#0B7E3E', successBg: '#DFF1E2',
    warnBg: '#FFE3B8', warnBorder: '#F0BE5C',
  },
  violet: {
    canvas: '#F5F3FA', surface: '#FFFFFF', border: 'rgba(0,0,0,0.07)',
    ink: '#171327', muted: '#665E80',
    accent: '#C5B4FF', accentInk: '#171327',
    mapBg: '#EEEAF5', mapLine: '#CDC6DE',
    successFg: '#0B7E3E', successBg: '#DDF1E1',
    warnBg: '#FFE0BE', warnBorder: '#EFBE6F',
  },
  blue: {
    canvas: '#F1F4F8', surface: '#FFFFFF', border: 'rgba(0,0,0,0.07)',
    ink: '#0C1A2E', muted: '#5C6A82',
    accent: '#3D6BFF', accentInk: '#FFFFFF',
    mapBg: '#E8ECF2', mapLine: '#C2CADA',
    successFg: '#0B7E3E', successBg: '#DDF1E1',
    warnBg: '#FFE3A8', warnBorder: '#F0C45C',
  },
};

export const DEFAULT_PALETTE = 'coral';

// Tipografía. En Expo carga estas familias con expo-font.
export const FONTS = {
  display: 'Montserrat',         // títulos grandes
  body:    'Manrope',            // texto e UI
  mono:    'Manrope',            // antes era JetBrains — ahora Manrope con tnum
};
