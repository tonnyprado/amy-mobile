// src/admin/screens/monitoreo/CriticalAlert.jsx
// Banner con halo pulsante rojo, stripes diagonales animados,
// icono Siren con micro-pulse, hora LIVE actualizada cada segundo.

import React, { useState, useEffect } from 'react';
import Icon from '../../components/Icon';
import { theme } from '../../theme';

export default function CriticalAlert() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const pad = n => String(n).padStart(2, '0');
  const hh = pad(now.getHours());
  const mm = pad(now.getMinutes());
  const ss = pad(now.getSeconds());

  return (
    <div className="critical-alert" style={{
      margin: '14px 18px 0', position: 'relative',
      background: '#fff', color: theme.dangerFg,
      border: `1.5px solid ${theme.dangerFg}`,
      borderRadius: 14, overflow: 'hidden',
      display: 'flex', alignItems: 'stretch',
    }}>
      <div className="stripes" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5,
      }}/>
      <div style={{
        padding: '10px 14px',
        display: 'flex', alignItems: 'center', gap: 12, flex: 1,
        position: 'relative',
      }}>
        <div className="ico" style={{
          width: 36, height: 36, borderRadius: 10,
          background: theme.dangerFg, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, boxShadow: '0 4px 10px rgba(184, 58, 34, 0.35)',
        }}>
          <Icon name="siren" size={18} strokeWidth={2.2}/>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 9.5, fontFamily: "'Manrope', sans-serif",
            letterSpacing: 1.6, fontWeight: 800, textTransform: 'uppercase',
            color: theme.dangerFg, display: 'inline-flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{ width: 5, height: 5, borderRadius: 3, background: theme.dangerFg }}/>
            Hora crítica · Live
          </div>
          <div style={{
            fontSize: 13.5, fontWeight: 800, color: theme.ink, letterSpacing: -0.2, marginTop: 1,
          }}>Pico de entregas activo</div>
        </div>
        <div style={{
          textAlign: 'right', flexShrink: 0,
          fontFamily: "'Manrope', sans-serif", fontFeatureSettings: "'tnum'",
        }}>
          <div style={{
            fontSize: 9.5, letterSpacing: 1.4, color: theme.muted,
            textTransform: 'uppercase', fontWeight: 700,
          }}>Hora local</div>
          <div style={{
            fontSize: 18, fontWeight: 800, color: theme.dangerFg, lineHeight: 1,
            marginTop: 2, letterSpacing: -0.4,
          }}>
            {hh}:{mm}
            <span style={{ fontSize: 11, opacity: 0.5, marginLeft: 2 }}>:{ss}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
