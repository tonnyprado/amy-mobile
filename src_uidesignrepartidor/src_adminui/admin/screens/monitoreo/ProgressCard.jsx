// src/admin/screens/monitoreo/ProgressCard.jsx
// Tarjeta de progreso por repartidor en la pantalla de Monitoreo.

import React from 'react';
import { theme } from '../../theme';

export default function ProgressCard({ r }) {
  const statusColor = r.status === 'enRuta'   ? theme.successFg
                   : r.status === 'descanso' ? theme.muted
                   :                            theme.warnBorder;
  return (
    <div style={{
      background: theme.surface, border: `1px solid ${theme.border}`,
      borderRadius: 16, padding: 12,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
          <span style={{
            width: 8, height: 8, borderRadius: 4, background: statusColor, flexShrink: 0,
            boxShadow: r.online ? `0 0 0 3px ${statusColor}33` : 'none',
          }}/>
          <span style={{
            fontSize: 14, fontWeight: 800, letterSpacing: -0.2,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            textTransform: 'uppercase',
          }}>{r.name}</span>
        </div>
        <span style={{
          fontSize: 18, fontWeight: 700,
          color: r.progress.pct < 50 ? theme.dangerFg : theme.successFg,
          fontFamily: "'Manrope', sans-serif", letterSpacing: -0.5,
        }}>{r.progress.pct}%</span>
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
        <MiniStat label="Total"      value={r.progress.total} bg={theme.canvas}    fg={theme.muted}/>
        <MiniStat label="Entregados" value={r.progress.done}  bg={theme.successBg} fg={theme.successFg}/>
        <MiniStat label="En ruta"    value={r.progress.route} bg={theme.infoBg}    fg={theme.infoFg}/>
      </div>

      <div style={{
        height: 4, background: theme.border, borderRadius: 2,
        marginTop: 10, overflow: 'hidden',
      }}>
        <div style={{
          width: `${r.progress.pct}%`, height: '100%',
          background: r.progress.pct < 50 ? theme.dangerFg : theme.successFg,
          borderRadius: 2, transition: 'width 0.4s ease',
        }}/>
      </div>
    </div>
  );
}

const MiniStat = ({ label, value, bg, fg }) => (
  <div style={{
    background: bg, padding: '4px 10px', borderRadius: 8,
    fontSize: 11, color: fg, display: 'flex', gap: 4,
    fontFamily: "'Manrope', sans-serif",
  }}>
    <span style={{ opacity: 0.7 }}>{label}:</span>
    <span style={{ fontWeight: 700 }}>{value}</span>
  </div>
);
