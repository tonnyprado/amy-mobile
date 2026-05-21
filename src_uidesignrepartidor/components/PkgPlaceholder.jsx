// src/components/PkgPlaceholder.jsx
// Cajita ilustrada de paquete con la etiqueta. Sustituye por una imagen
// real (Image source={require(...)}) o lottie cuando tengas el asset.

import React from 'react';

const TONES = {
  a: ['#FFCE3B', '#1A1A1A'],
  b: ['#FF7A45', '#1A1A1A'],
  c: ['#3D6BFF', '#FFFFFF'],
  d: ['#1A1A1A', '#FFFFFF'],
};

export default function PkgPlaceholder({ tone = 'a', size = 64, label }) {
  const [bg, fg] = TONES[tone];
  return (
    <div style={{
      width: size, height: size, borderRadius: 10,
      background: bg, color: fg,
      position: 'relative', overflow: 'hidden',
      boxShadow: '0 6px 14px rgba(0,0,0,0.16), inset 0 0 0 1px rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      padding: 7, boxSizing: 'border-box',
      fontFamily: "'Manrope', sans-serif",
      transform: 'rotate(-4deg)', flexShrink: 0,
    }}>
      <div style={{ fontSize: 8, opacity: 0.8, letterSpacing: 0.4 }}>FRAGILE</div>
      <div style={{ fontSize: 12, fontWeight: 700, lineHeight: 1 }}>{label}</div>
      <div style={{
        position: 'absolute', bottom: 7, left: 7, right: 7,
        height: 8,
        background: `repeating-linear-gradient(90deg, ${fg} 0 1.5px, transparent 1.5px 3px)`,
        opacity: 0.7,
      }} />
    </div>
  );
}
