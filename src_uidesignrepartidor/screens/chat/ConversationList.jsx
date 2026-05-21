// src/screens/chat/ConversationList.jsx
// Lista de conversaciones (admin / soporte / supervisor).
// Tap a una conversación → dispara onOpenConv(conv, event) en el padre,
// que captura la posición del clic para animar el círculo revelador.

import React from 'react';
import Icon from '../../components/Icon';
import { CONVERSATIONS } from '../../data';

const drawerIconBtn = (theme) => ({
  width: 38, height: 38, borderRadius: 12,
  background: theme.surface, border: `1px solid ${theme.border}`,
  color: theme.ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
});

export default function ConversationList({ theme, onClose, onOpenConv, unreadByConv = {} }) {
  return (
    <>
      <div style={{
        padding: '6px 16px 0', display: 'flex', alignItems: 'center', gap: 12,
      }}>
        {onClose && (
          <button onClick={onClose} aria-label="Cerrar chat" style={drawerIconBtn(theme)}>
            <Icon name="chevron-right" size={18} strokeWidth={2.2}/>
          </button>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 10.5, fontFamily: "'Manrope', sans-serif",
            letterSpacing: 1.4, color: theme.muted, textTransform: 'uppercase',
          }}>Comunicación</div>
          <div style={{
            fontSize: 24, fontWeight: 700, letterSpacing: -0.6,
            lineHeight: 1.1, marginTop: 2, color: theme.ink,
            fontFamily: "'Montserrat', sans-serif",
          }}>Chat operativo</div>
        </div>
        <button aria-label="Buscar" style={drawerIconBtn(theme)}>
          <Icon name="search" size={17}/>
        </button>
      </div>

      <Announcement theme={theme}/>

      <div style={{
        padding: '14px 20px 6px',
        fontSize: 10.5, fontFamily: "'Manrope', sans-serif",
        letterSpacing: 1.4, color: theme.muted, textTransform: 'uppercase',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>Conversaciones</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            width: 6, height: 6, borderRadius: 3, background: theme.successFg,
            boxShadow: `0 0 0 3px ${theme.successFg}33`,
          }}/>
          <span style={{ color: theme.successFg }}>
            {CONVERSATIONS.filter(c => c.online).length} en línea
          </span>
        </span>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', padding: '0 20px 0',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {CONVERSATIONS.map((c, i) => (
          <ConversationRow
            key={c.id} c={c} theme={theme}
            featured={i === 0}
            unread={unreadByConv[c.id] || 0}
            onOpen={(e) => onOpenConv(c, e)}
          />
        ))}
      </div>

      <QuickReply theme={theme}/>
    </>
  );
}

function Announcement({ theme }) {
  return (
    <div style={{
      margin: '14px 20px 0', padding: 12,
      background: theme.warnBg, color: theme.ink,
      borderRadius: 16, border: `1px solid ${theme.warnBorder}`,
      display: 'flex', gap: 10, alignItems: 'flex-start',
    }}>
      <div style={{
        width: 30, height: 30, borderRadius: 10,
        background: theme.ink, color: theme.warnBg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name="megaphone" size={14}/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 10, fontFamily: "'Manrope', sans-serif",
          letterSpacing: 1, textTransform: 'uppercase', opacity: 0.65,
        }}>Anuncio · 12 min</div>
        <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 2, lineHeight: 1.35 }}>
          Reporte de avance cada 2 horas mientras estés en carretera.
        </div>
      </div>
    </div>
  );
}

function ConversationRow({ c, theme, featured, unread, onOpen }) {
  return (
    <div
      onClick={onOpen}
      style={{
        background: featured ? theme.ink : theme.surface,
        color: featured ? theme.canvas : theme.ink,
        borderRadius: 18, padding: 12,
        border: featured ? 'none' : `1px solid ${theme.border}`,
        display: 'flex', gap: 12, alignItems: 'center',
        boxShadow: featured ? '0 12px 26px rgba(0,0,0,0.18)' : 'none',
        cursor: 'pointer', transition: 'transform 0.12s',
      }}
      onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
      onMouseUp={(e) => e.currentTarget.style.transform = ''}
      onMouseLeave={(e) => e.currentTarget.style.transform = ''}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 23,
          background: c.color, color: '#0F0F0F',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, letterSpacing: -0.3,
          fontFamily: "'Manrope', sans-serif",
        }}>{c.tag}</div>
        {c.online && (
          <div style={{
            position: 'absolute', bottom: -2, right: -2,
            width: 13, height: 13, borderRadius: 7,
            background: theme.successFg,
            border: `2.5px solid ${featured ? theme.ink : theme.surface}`,
          }}/>
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: -0.2 }}>{c.name}</div>
          <div style={{
            fontSize: 10, fontFamily: "'Manrope', sans-serif",
            opacity: featured ? 0.6 : 0.5,
          }}>{c.time}</div>
        </div>
        <div style={{
          fontSize: 10, fontFamily: "'Manrope', sans-serif",
          letterSpacing: 0.6, textTransform: 'uppercase',
          opacity: 0.55, marginTop: 1,
        }}>{c.role}</div>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 5, gap: 8,
        }}>
          <div style={{
            fontSize: 12, opacity: featured ? 0.8 : 0.65,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1,
          }}>{c.last}</div>
          {unread > 0 && (
            <div style={{
              minWidth: 20, height: 20, borderRadius: 10, padding: '0 6px',
              background: theme.accent, color: '#0F0F0F',
              fontSize: 10.5, fontWeight: 700,
              fontFamily: "'Manrope', sans-serif",
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>{unread}</div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickReply({ theme }) {
  return (
    <div style={{
      margin: '10px 20px 0', padding: '4px 4px 4px 14px',
      background: theme.surface, borderRadius: 26,
      border: `1px solid ${theme.border}`,
      display: 'flex', alignItems: 'center', gap: 8,
    }}>
      <Icon name="paperclip" size={16} color={theme.muted}/>
      <div style={{ flex: 1, fontSize: 13, color: theme.muted, padding: '12px 0' }}>
        Mensaje rápido…
      </div>
      <button style={{
        width: 38, height: 38, borderRadius: 19,
        background: theme.accent, color: '#0F0F0F', border: 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      }}>
        <Icon name="send" size={15} strokeWidth={2.4}/>
      </button>
    </div>
  );
}
