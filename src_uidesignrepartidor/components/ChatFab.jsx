// src/components/ChatFab.jsx
// Botón flotante de chat. Adapta su color al fondo de la pantalla activa:
//  - Sobre canvas (mapa, pedidos): fondo = theme.accent, icono oscuro
//  - Sobre accent (stats): fondo = theme.ink, icono claro
//
// Incluye badge con contador y halo de pulso animado.
//
// RN: usa Animated.View para el pulso (escala + opacidad en loop).

import React from 'react';
import Icon from './Icon';

export default function ChatFab({ theme, onAccentBg, unreadCount, onPress, hidden }) {
  const fabBg   = onAccentBg ? theme.ink : theme.accent;
  const fabFg   = onAccentBg ? theme.canvas : theme.ink;
  const badgeBg = onAccentBg ? theme.accent : theme.ink;
  const badgeFg = onAccentBg ? theme.ink : theme.canvas;
  const pulseRgba = onAccentBg
    ? 'rgba(15,15,15,0.45)'
    : 'rgba(255,120,73,0.55)';

  return (
    <button
      className="chat-fab"
      onClick={onPress}
      aria-label="Abrir chat"
      style={{
        background: fabBg, color: fabFg,
        boxShadow: `0 14px 32px ${onAccentBg ? 'rgba(0,0,0,0.32)' : 'rgba(0,0,0,0.18)'}, 0 0 0 1px rgba(0,0,0,0.06) inset`,
        opacity: hidden ? 0 : 1,
        pointerEvents: hidden ? 'none' : 'auto',
        ['--pulse-color']: pulseRgba,
      }}
    >
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
