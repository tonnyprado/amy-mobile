// src/admin/theme.js
// Paleta cool neutral + acento coral, mismos tokens que el Admin App.html.

export const theme = {
  canvas: '#F1F3F5',          // fondo principal cool neutral
  surface: '#FFFFFF',          // cards blancas
  border: 'rgba(15,23,42,0.08)',
  ink: '#0E1116',              // texto principal / botones oscuros
  muted: '#5C6470',            // texto secundario
  accent: '#FF7849',           // coral — único color cálido del sistema
  accentInk: '#0E1116',

  // Estados
  successFg: '#0B7E3E', successBg: '#E3F1E5',
  warnBg:    '#FFE9B8', warnBorder: '#E8B547',
  dangerBg:  '#FCE2DD', dangerFg:   '#B83A22',
  infoBg:    '#E6EEF8', infoFg:     '#0F3A8A',
};

export const FONTS = {
  display: 'Montserrat',
  body:    'Manrope',
  mono:    'Manrope',          // Manrope tabular-nums para códigos/cifras
};

// CSS custom-prop helper para componentes web. En RN usa los hex directos.
export const cssVars = {
  '--ink':       theme.ink,
  '--canvas':    theme.canvas,
  '--surface':   theme.surface,
  '--accent':    theme.accent,
  '--muted':     theme.muted,
  '--border':    theme.border,
  '--success':   theme.successFg,
  '--danger':    theme.dangerFg,
  '--warn':      '#A86A12',
  '--info':      theme.infoFg,
};
