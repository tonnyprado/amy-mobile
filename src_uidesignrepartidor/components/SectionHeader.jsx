// src/components/SectionHeader.jsx
// Cabecera de pantalla con kicker + título + subtítulo + slot derecho.

import React from 'react';

export default function SectionHeader({ kicker, title, sub, theme, right, dark }) {
  return (
    <div style={{
      padding: '6px 20px 0',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      gap: 12,
    }}>
      <div>
        <div style={{
          fontSize: 10.5, fontFamily: "'Manrope', sans-serif",
          letterSpacing: 1.4,
          color: dark ? 'rgba(255,255,255,0.5)' : theme.muted,
          textTransform: 'uppercase',
        }}>{kicker}</div>
        <div style={{
          fontSize: 28, fontWeight: 700, letterSpacing: -0.8,
          lineHeight: 1.05, marginTop: 2,
          color: dark ? theme.canvas : theme.ink,
          fontFamily: "'Montserrat', sans-serif",
        }}>{title}</div>
        {sub && (
          <div style={{
            fontSize: 12.5, color: dark ? 'rgba(255,255,255,0.7)' : theme.muted,
            marginTop: 4, maxWidth: 280,
          }}>{sub}</div>
        )}
      </div>
      {right}
    </div>
  );
}
