// src/admin/screens/stats/TopRepRow.jsx
// Card de top repartidor con medalla (oro/plata/bronce) por rank.

import React from 'react';
import CountUp from '../../components/CountUp';
import { theme } from '../../theme';

export default function TopRepRow({ rank, r, delay = 0 }) {
  const medal = ['#E8B547', '#B5BEC7', '#C58A56'][rank - 1] || theme.muted;
  return (
    <div className="card-anim" style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 0', animationDelay: `${delay}ms`,
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 14,
        background: medal, color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 800,
        fontFamily: "'Manrope', sans-serif", flexShrink: 0,
        boxShadow: `0 4px 10px ${medal}66`,
      }}>{rank}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 13.5, fontWeight: 700, color: theme.ink, letterSpacing: -0.2,
        }}>{r.name}</div>
        <div style={{
          fontSize: 11, color: theme.muted, marginTop: 1,
          fontFamily: "'Manrope', sans-serif",
        }}><CountUp value={r.delivered}/> entregas hoy</div>
      </div>
      <div style={{
        fontSize: 18, fontWeight: 800, color: theme.successFg,
        fontFamily: "'Manrope', sans-serif", letterSpacing: -0.4,
      }}><CountUp value={r.pct}/>%</div>
    </div>
  );
}
