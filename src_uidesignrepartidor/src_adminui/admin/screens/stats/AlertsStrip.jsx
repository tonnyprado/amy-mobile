// src/admin/screens/stats/AlertsStrip.jsx
// Pill centrado con conteo de alertas (rojo si hay altas, ámbar si solo medias).

import React from 'react';
import Icon from '../../components/Icon';
import CountUp from '../../components/CountUp';
import { theme } from '../../theme';

export default function AlertsStrip({ high, mid, onTap }) {
  const total = high + mid;
  const tone = high > 0
    ? { bg: theme.dangerBg, fg: theme.dangerFg, ico: 'siren'    }
    : { bg: theme.warnBg,   fg: '#A86A12',     ico: 'bell-ring' };

  return (
    <button onClick={onTap} style={{
      background: tone.bg, border: `1px solid ${tone.fg}33`,
      borderRadius: 14, padding: '10px 18px',
      display: 'inline-flex', alignItems: 'center', gap: 12,
      cursor: 'pointer', textAlign: 'center',
      fontFamily: "'Montserrat', sans-serif",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: tone.fg, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={tone.ico} size={16} strokeWidth={2.2}/>
      </div>
      <div style={{ textAlign: 'left' }}>
        <div style={{
          fontSize: 10, fontFamily: "'Manrope', sans-serif",
          letterSpacing: 1.4, color: tone.fg, textTransform: 'uppercase',
          fontWeight: 800,
        }}>Alertas activas · {total} en total</div>
        <div style={{
          fontSize: 13.5, fontWeight: 700, color: theme.ink, letterSpacing: -0.2,
        }}>
          <CountUp value={high}/> alta · <CountUp value={mid}/> media
        </div>
      </div>
    </button>
  );
}
