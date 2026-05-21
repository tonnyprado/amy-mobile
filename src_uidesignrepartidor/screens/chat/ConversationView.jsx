// src/screens/chat/ConversationView.jsx
// Vista de una conversación abierta. Renderiza:
//   - header (avatar, nombre, status, llamada, menú)
//   - lista de mensajes (auto-scroll al final)
//   - indicador "escribiendo…"
//   - input + botón enviar (Enter o tap)

import React, { useState, useEffect, useRef } from 'react';
import Icon from '../../components/Icon';
import MessageBubble from './MessageBubble';
import { MESSAGES_BY_CONV } from '../../data';

const drawerIconBtn = (theme) => ({
  width: 38, height: 38, borderRadius: 12,
  background: theme.surface, border: `1px solid ${theme.border}`,
  color: theme.ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
});

export default function ConversationView({ theme, conv, onBack }) {
  const seed = MESSAGES_BY_CONV[conv.id] || [];
  const [messages, setMessages] = useState(seed);
  const [draft, setDraft] = useState('');
  const [typing, setTyping] = useState(false);
  const listRef = useRef(null);

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [conv.id, messages.length]);

  useEffect(() => {
    const t1 = setTimeout(() => setTyping(true), 2000);
    const t2 = setTimeout(() => setTyping(false), 5000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [conv.id]);

  const send = () => {
    const v = draft.trim();
    if (!v) return;
    setMessages(m => [...m, { kind: 'me', text: v, time: 'ahora', read: false }]);
    setDraft('');
  };

  return (
    <>
      <Header theme={theme} conv={conv} onBack={onBack}/>
      <div ref={listRef} style={{
        flex: 1, overflowY: 'auto',
        padding: '14px 16px 14px',
        display: 'flex', flexDirection: 'column', gap: 8,
        background: theme.canvas,
      }}>
        <DayDivider theme={theme} label="Hoy"/>
        {messages.map((m, i) => (
          <MessageBubble key={i} m={m} theme={theme} conv={conv}/>
        ))}
        {typing && <TypingIndicator theme={theme}/>}
      </div>
      <InputBar
        theme={theme}
        draft={draft}
        onChange={setDraft}
        onSend={send}
      />
    </>
  );
}

function Header({ theme, conv, onBack }) {
  return (
    <div style={{
      padding: '6px 14px 12px',
      display: 'flex', alignItems: 'center', gap: 10,
      borderBottom: `1px solid ${theme.border}`, background: theme.canvas,
    }}>
      <button onClick={onBack} aria-label="Volver" style={drawerIconBtn(theme)}>
        <Icon name="arrow-left" size={18} strokeWidth={2.2}/>
      </button>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 42, height: 42, borderRadius: 21,
          background: conv.color, color: '#0F0F0F',
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
          fontSize: 15, fontWeight: 700, letterSpacing: -0.2, color: theme.ink,
        }}>{conv.name}</div>
        <div style={{
          fontSize: 10.5, fontFamily: "'Manrope', sans-serif",
          letterSpacing: 0.6, textTransform: 'uppercase', color: theme.muted,
          marginTop: 1, display: 'inline-flex', alignItems: 'center', gap: 5,
        }}>
          {conv.online ? (
            <>
              <span style={{ width: 5, height: 5, borderRadius: 3, background: theme.successFg }}/>
              En línea · {conv.role}
            </>
          ) : (
            <>Visto hace 2 hr · {conv.role}</>
          )}
        </div>
      </div>
      <button aria-label="Llamar" style={drawerIconBtn(theme)}>
        <Icon name="phone" size={16}/>
      </button>
      <button aria-label="Más" style={drawerIconBtn(theme)}>
        <Icon name="more-vertical" size={17}/>
      </button>
    </div>
  );
}

function DayDivider({ theme, label }) {
  return (
    <div style={{
      alignSelf: 'center', fontSize: 10.5, color: theme.muted,
      letterSpacing: 1.2, textTransform: 'uppercase',
      fontFamily: "'Manrope', sans-serif",
      padding: '4px 10px', borderRadius: 999,
      background: theme.surface, border: `1px solid ${theme.border}`,
      marginBottom: 4,
    }}>{label}</div>
  );
}

function TypingIndicator({ theme }) {
  return (
    <div style={{
      alignSelf: 'flex-start', display: 'flex', gap: 6, padding: '8px 14px',
      background: theme.surface, borderRadius: 16, border: `1px solid ${theme.border}`,
    }}>
      {[0,1,2].map(i => (
        <span key={i} style={{
          width: 6, height: 6, borderRadius: 3, background: theme.muted,
          animation: `typing 1.2s ${i * 0.2}s ease-in-out infinite`,
        }}/>
      ))}
    </div>
  );
}

function InputBar({ theme, draft, onChange, onSend }) {
  return (
    <div style={{
      padding: '8px 14px 4px',
      display: 'flex', alignItems: 'center', gap: 8,
      background: theme.canvas, borderTop: `1px solid ${theme.border}`,
    }}>
      <button aria-label="Adjuntar" style={drawerIconBtn(theme)}>
        <Icon name="paperclip" size={16}/>
      </button>
      <div style={{
        flex: 1, background: theme.surface, borderRadius: 22,
        border: `1px solid ${theme.border}`,
        display: 'flex', alignItems: 'center', padding: '6px 12px', gap: 6,
      }}>
        <input
          type="text"
          value={draft}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') onSend(); }}
          placeholder="Escribe un mensaje…"
          style={{
            flex: 1, border: 'none', outline: 'none', background: 'transparent',
            fontFamily: "'Manrope', sans-serif", fontSize: 13.5, color: theme.ink,
            padding: '8px 0',
          }}
        />
        <button aria-label="Emoji" style={{
          background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
          color: theme.muted, display: 'flex',
        }}>
          <Icon name="smile" size={17}/>
        </button>
      </div>
      <button onClick={onSend} aria-label="Enviar" style={{
        width: 42, height: 42, borderRadius: 21,
        background: theme.accent, color: '#0F0F0F', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
        boxShadow: '0 6px 14px rgba(0,0,0,0.12)',
      }}>
        <Icon name="send" size={16} strokeWidth={2.4}/>
      </button>
    </div>
  );
}
