// src/admin/screens/chat/MessageBubble.jsx
// 4 tipos: system | them | me | announcement.
// El "announcement" se renderiza alineado a la derecha porque es algo
// que el ADMIN manda (mensaje masivo o aviso operativo).

import React from 'react';
import Icon from '../../components/Icon';
import { theme } from '../../theme';

export default function MessageBubble({ m, conv }) {
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
        alignSelf: 'flex-end', maxWidth: '85%',
        padding: 12, background: theme.warnBorder, color: theme.ink,
        borderRadius: 16, borderBottomRightRadius: 6,
        display: 'flex', gap: 8, alignItems: 'flex-start',
        boxShadow: '0 4px 12px rgba(240,190,92,0.3)',
      }}>
        <Icon name="megaphone" size={14} style={{ marginTop: 3, flexShrink: 0 }}/>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 9.5, fontFamily: "'Manrope', sans-serif",
            letterSpacing: 1, textTransform: 'uppercase', opacity: 0.7,
          }}>Anuncio · {m.time}</div>
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
      <div style={{ fontSize: 13.5, lineHeight: 1.35 }}>{m.text}</div>
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
