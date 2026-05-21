// src/components/Pill.jsx
// Etiqueta pequeña tipo badge / chip.
//
// En RN: View con borderRadius 999, padding horizontal y Text dentro.

import React from 'react';

export default function Pill({ children, bg, color, style }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999,
      fontSize: 10, fontWeight: 700, letterSpacing: 0.4,
      background: bg, color: color, textTransform: 'uppercase',
      fontFamily: "'Manrope', sans-serif",
      ...style,
    }}>{children}</span>
  );
}
