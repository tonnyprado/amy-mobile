// src/admin/screens/monitoreo/MetricCard.jsx
// Card compacta de métrica con barra opcional.

import React from 'react';
import { theme } from '../../theme';

export default function MetricCard({ kicker, value, sub, progress }) {
  return (
    <div style={{
      background: theme.surface, border: `1px solid ${theme.border}`,
      borderRadius: 14, padding: 12,
    }}>
      <div style={{
        fontSize: 9.5, fontFamily: "'Manrope', sans-serif",
        letterSpacing: 1.2, color: theme.muted, textTransform: 'uppercase',
      }}>{kicker}</div>
      <div style={{
        fontSize: 24, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1,
        marginTop: 4, color: theme.ink, fontFamily: "'Manrope', sans-serif",
      }}>{value}</div>
      {sub != null && (
        <div style={{
          fontSize: 10, color: theme.muted, marginTop: 3,
          fontFamily: "'Manrope', sans-serif",
        }}>{sub}</div>
      )}
      {progress != null && (
        <div style={{
          height: 4, background: theme.border, borderRadius: 2,
          marginTop: 7, overflow: 'hidden',
        }}>
          <div style={{
            width: `${progress}%`, height: '100%',
            background: progress < 50 ? theme.dangerFg : theme.accent,
            borderRadius: 2,
          }}/>
        </div>
      )}
    </div>
  );
}
