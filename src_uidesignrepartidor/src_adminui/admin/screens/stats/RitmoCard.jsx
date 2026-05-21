// src/admin/screens/stats/RitmoCard.jsx
// Banner adaptativo verde/azul/rojo según delta vs esperado.

import React from 'react';
import Icon from '../../components/Icon';
import { theme } from '../../theme';

export default function RitmoCard({ ritmo, real, expected }) {
  const palette = {
    good: { bg: theme.successBg, fg: theme.successFg, ink: '#063D1F' },
    ok:   { bg: theme.infoBg,    fg: theme.infoFg,    ink: '#0A2459' },
    bad:  { bg: theme.dangerBg,  fg: theme.dangerFg,  ink: '#5C1E11' },
  }[ritmo.tone];

  return (
    <div style={{
      background: palette.bg, border: `1px solid ${palette.fg}33`,
      borderRadius: 16, padding: 14,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: palette.fg, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0, boxShadow: `0 6px 14px ${palette.fg}55`,
      }}>
        <Icon name={ritmo.icon} size={20} strokeWidth={2.2}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 9.5, fontFamily: "'Manrope', sans-serif",
          letterSpacing: 1.4, color: palette.fg, textTransform: 'uppercase',
          fontWeight: 800,
        }}>Análisis de ritmo</div>
        <div style={{
          fontSize: 15, fontWeight: 800, color: palette.ink, letterSpacing: -0.3,
          marginTop: 1,
        }}>{ritmo.label}</div>
        <div style={{ fontSize: 11.5, color: palette.ink, opacity: 0.7, marginTop: 1 }}>
          {ritmo.sub}
        </div>
        <div style={{
          display: 'inline-flex', gap: 10, marginTop: 6,
          fontSize: 11, fontFamily: "'Manrope', sans-serif",
          color: palette.ink,
        }}>
          <span>Esperado: <strong>{expected}%</strong></span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>Real: <strong>{real}%</strong></span>
        </div>
      </div>
    </div>
  );
}
