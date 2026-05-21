// src/admin/components/ChatFab.jsx
// FAB que invierte colores según el fondo activo:
//   - canvas (estadísticas en su sub-sección, monitoreo, repartidores)
//   - accent (estadísticas en sección principal coral)

import React from 'react';
import Icon from './Icon';
import { theme } from '../theme';

export default function ChatFab({ onAccentBg, unreadCount, hidden, onPress }) {
  const fabBg   = onAccentBg ? theme.ink : theme.accent;
  const fabFg   = onAccentBg ? theme.canvas : theme.ink;
  const badgeBg = onAccentBg ? theme.accent : theme.ink;
  const badgeFg = onAccentBg ? theme.ink : theme.canvas;
  const pulse   = onAccentBg ? 'rgba(15,15,15,0.45)' : 'rgba(255,120,73,0.55)';

  return (
    <button onClick={onPress} aria-label="Chat" className="chat-fab" style={{
      background: fabBg, color: fabFg,
      boxShadow: `0 14px 32px ${onAccentBg ? 'rgba(0,0,0,0.32)' : 'rgba(0,0,0,0.18)'}`,
      opacity: hidden ? 0 : 1,
      pointerEvents: hidden ? 'none' : 'auto',
      ['--pulse-color']: pulse,
    }}>
      <Icon name="message-circle" size={24} strokeWidth={2.2}/>
      {unreadCount > 0 && (
        <span className="badge" style={{
          background: badgeBg, color: badgeFg, borderColor: fabBg,
        }}>{unreadCount}</span>
      )}
      <span className="pulse"/>
    </button>
  );
}
