// src/screens/chat/MessageBubble.jsx
// Burbuja individual de mensaje. 4 tipos según m.kind:
//   - 'system'       → chip centrado
//   - 'announcement' → tarjeta amarilla con megáfono
//   - 'them'         → burbuja gris izquierda
//   - 'me'           → burbuja oscura derecha con checks de lectura

import React from 'react';
import Icon from '../../components/Icon';

export default function MessageBubble({ m, theme, conv }) {
  if (m.kind === 'system') {
    return (
      <div style={{
        alignSelf: 'center', fontSize: 11, color: theme.muted,
        padding: '4px 12px', borderRadius: 999,
        background: theme.surface, border: `1px dashed ${theme.border}`,
      }}>
        {m.text} · {m.time}
      </div>
    );
  }
  if (m.kind === 'announcement') {
    return (
      <div style={{
        alignSelf: 'stretch', padding: 12,
        background: theme.warnBg, color: theme.ink,
        border: `1px solid ${theme.warnBorder}`, borderRadius: 16,
        display: 'flex', gap: 10, alignItems: 'flex-start',
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: 9,
          background: theme.ink, color: theme.warnBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name="megaphone" size={13}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 9.5, fontFamily: "'Manrope', sans-serif",
            letterSpacing: 1, textTransform: 'uppercase', opacity: 0.65,
          }}>Anuncio · {conv.name} · {m.time}</div>
          <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2, lineHeight: 1.35 }}>
            {m.text}
          </div>
        </div>
      </div>
    );
  }

  const me = m.kind === 'me';
  return (
    <div style={{
      alignSelf: me ? 'flex-end' : 'flex-start',
      maxWidth: '78%',
      background: me ? theme.ink : theme.surface,
      color: me ? theme.canvas : theme.ink,
      padding: '10px 12px',
      borderRadius: 18,
      borderBottomRightRadius: me ? 6 : 18,
      borderBottomLeftRadius: me ? 18 : 6,
      border: me ? 'none' : `1px solid ${theme.border}`,
      boxShadow: me ? '0 6px 14px rgba(0,0,0,0.10)' : 'none',
    }}>
      <div style={{ fontSize: 13.5, lineHeight: 1.35, letterSpacing: -0.1 }}>{m.text}</div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        justifyContent: me ? 'flex-end' : 'flex-start',
        fontSize: 10, fontFamily: "'Manrope', sans-serif",
        opacity: 0.55, marginTop: 4,
      }}>
        <span>{m.time}</span>
        {me && <Icon name={m.read ? 'check-check' : 'check'} size={11} strokeWidth={2.4}/>}
      </div>
    </div>
  );
}
