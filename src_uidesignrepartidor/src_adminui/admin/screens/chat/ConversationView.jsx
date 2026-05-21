// src/admin/screens/chat/ConversationView.jsx
// Vista de conversación abierta.
// El botón de megáfono inserta una burbuja de tipo "announcement".

import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon';
import MessageBubble from './MessageBubble';
import { theme } from '../../theme';
import { ADMIN_MESSAGES } from '../../data';

const drawerIconBtn = () => ({
  width: 38, height: 38, borderRadius: 12,
  background: theme.surface, border: `1px solid ${theme.border}`,
  color: theme.ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
});

export default function ConversationView({ conv, onBack }) {
  const seed = ADMIN_MESSAGES[conv.id] || [];
  const [messages, setMessages] = useState(seed);
  const [draft, setDraft] = useState('');
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [conv.id, messages.length]);

  const send = () => {
    const v = draft.trim();
    if (!v) return;
    setMessages(m => [...m, { kind: 'me', text: v, time: 'ahora', read: false }]);
    setDraft('');
  };

  const sendAnnouncement = () => {
    const text = window.prompt('Texto del anuncio:');
    if (!text) return;
    setMessages(m => [...m, { kind: 'announcement', text, time: 'ahora' }]);
  };

  return (
    <>
      <div style={{
        padding: '6px 14px 12px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `1px solid ${theme.border}`, background: theme.canvas,
      }}>
        <button onClick={onBack} aria-label="Volver" style={drawerIconBtn()}>
          <Icon name="arrow-left" size={18} strokeWidth={2.2}/>
        </button>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 21,
            background: conv.color, color: theme.ink,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700, letterSpacing: -0.3,
            fontFamily: "'Manrope', sans-serif",
          }}>{conv.tag}</div>
          {conv.online && (
            <div style={{
              position: 'absolute', bottom: -2, right: -2,
              width: 13, height: 13, borderRadius: 7,
              background: theme.successFg, border: `2.5px solid ${theme.canvas}`,
            }}/>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 800, letterSpacing: -0.2, color: theme.ink,
            textTransform: 'uppercase',
          }}>{conv.name}</div>
          <div style={{
            fontSize: 10.5, fontFamily: "'Manrope', sans-serif",
            letterSpacing: 0.6, textTransform: 'uppercase',
            color: conv.online ? theme.successFg : theme.muted,
            marginTop: 1, display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <Icon name={conv.online ? 'wifi' : 'wifi-off'} size={10}/>
            {conv.online ? 'En línea' : 'Modo ahorro'}
          </div>
        </div>
        {conv.phone && (
          <button aria-label="Llamar" style={drawerIconBtn()}>
            <Icon name="phone" size={16}/>
          </button>
        )}
        <button onClick={sendAnnouncement} aria-label="Enviar anuncio" style={drawerIconBtn()}>
          <Icon name="megaphone" size={16}/>
        </button>
      </div>

      <div ref={listRef} style={{
        flex: 1, overflowY: 'auto', padding: '14px 16px',
        display: 'flex', flexDirection: 'column', gap: 8,
        background: theme.canvas,
      }}>
        <div style={{
          alignSelf: 'center', fontSize: 10.5, color: theme.muted,
          letterSpacing: 1.2, textTransform: 'uppercase',
          fontFamily: "'Manrope', sans-serif",
          padding: '4px 10px', borderRadius: 999,
          background: theme.surface, border: `1px solid ${theme.border}`,
          marginBottom: 4,
        }}>Hoy</div>
        {messages.map((m, i) => <MessageBubble key={i} m={m} conv={conv}/>)}
      </div>

      <div style={{
        padding: '8px 14px 4px',
        display: 'flex', alignItems: 'center', gap: 8,
        background: theme.canvas, borderTop: `1px solid ${theme.border}`,
      }}>
        <button aria-label="Adjuntar" style={drawerIconBtn()}>
          <Icon name="paperclip" size={16}/>
        </button>
        <div style={{
          flex: 1, background: theme.surface, borderRadius: 22,
          border: `1px solid ${theme.border}`,
          display: 'flex', alignItems: 'center', padding: '6px 12px', gap: 6,
        }}>
          <input type="text" value={draft}
                 onChange={(e) => setDraft(e.target.value)}
                 onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
                 placeholder="Escribe un mensaje…"
                 style={{
                   flex: 1, border: 'none', outline: 'none', background: 'transparent',
                   fontFamily: "'Manrope', sans-serif", fontSize: 13.5, color: theme.ink,
                   padding: '8px 0',
                 }}/>
        </div>
        <button onClick={send} aria-label="Enviar" style={{
          width: 42, height: 42, borderRadius: 21,
          background: theme.accent, color: theme.ink, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
          boxShadow: '0 6px 14px rgba(0,0,0,0.12)',
        }}>
          <Icon name="send" size={16} strokeWidth={2.4}/>
        </button>
      </div>
    </>
  );
}
