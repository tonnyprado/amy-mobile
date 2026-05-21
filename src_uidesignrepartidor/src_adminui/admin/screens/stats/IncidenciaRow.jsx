// src/admin/screens/stats/IncidenciaRow.jsx
// Fila individual de incidencia. Soporta tema oscuro (dark prop).
// La barra usa .bar-anim con delay propio para efecto cascada.

import React from 'react';
import Icon from '../../components/Icon';
import { theme } from '../../theme';

export default function IncidenciaRow({ inc, max, dark, delay = 0 }) {
  const pct = max ? (inc.value / max) * 100 : 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: dark ? 'rgba(255,255,255,0.08)' : theme.canvas,
        color: dark ? theme.canvas : theme.ink,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={inc.icon} size={13} strokeWidth={2.2}/>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4,
        }}>
          <span style={{
            fontSize: 12.5, color: dark ? 'rgba(255,255,255,0.85)' : theme.ink, fontWeight: 600,
          }}>{inc.label}</span>
          <span style={{
            fontSize: 13, fontWeight: 800,
            color: dark ? theme.accent : theme.ink,
            fontFamily: "'Manrope', sans-serif",
          }}>{inc.value}</span>
        </div>
        <div style={{
          height: 4,
          background: dark ? 'rgba(255,255,255,0.08)' : '#EEF0F2',
          borderRadius: 2, overflow: 'hidden',
        }}>
          <div className="bar-anim" style={{
            width: `${pct}%`, height: '100%',
            background: dark ? theme.accent : theme.ink,
            borderRadius: 2,
            animationDelay: `${delay}ms`,
          }}/>
        </div>
      </div>
    </div>
  );
}
