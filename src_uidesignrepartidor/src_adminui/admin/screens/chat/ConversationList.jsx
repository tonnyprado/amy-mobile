// src/admin/screens/chat/ConversationList.jsx
// Lista de repartidores con online status + banner "Mensaje masivo".
// onOpenConv recibe (conv, ev) para que el padre calcule el origen del reveal.

import React from 'react';
import Icon from '../../components/Icon';
import { theme } from '../../theme';
import { REPARTIDORES } from '../../data';

const drawerIconBtn = () => ({
  width: 38, height: 38, borderRadius: 12,
  background: theme.surface, border: `1px solid ${theme.border}`,
  color: theme.ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', flexShrink: 0,
});

export default function ConversationList({ onClose, onOpenConv, unreadByConv = {} }) {
  return (
    <>
      <div style={{ padding: '6px 16px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onClose} aria-label="Cerrar chat" style={drawerIconBtn()}>
          <Icon name="chevron-right" size={18} strokeWidth={2.2}/>
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 10.5, fontFamily: "'Manrope', sans-serif",
            letterSpacing: 1.4, color: theme.muted, textTransform: 'uppercase',
          }}>Panel admin</div>
          <div style={{
            fontSize: 22, fontWeight: 700, letterSpacing: -0.6,
            lineHeight: 1.1, marginTop: 2, color: theme.ink,
          }}>Chat con repartidores</div>
        </div>
        <button aria-label="Anuncio" style={drawerIconBtn()}>
          <Icon name="megaphone" size={17}/>
        </button>
      </div>

      {/* Mensaje masivo */}
      <div style={{
        margin: '14px 18px 0', padding: 12,
        background: theme.ink, color: theme.canvas,
        borderRadius: 16,
        display: 'flex', gap: 10, alignItems: 'center',
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: theme.accent, color: theme.ink,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon name="megaphone" size={14}/>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: 10, fontFamily: "'Manrope', sans-serif",
            letterSpacing: 1, textTransform: 'uppercase', opacity: 0.6,
          }}>Mensaje masivo</div>
          <div style={{ fontSize: 12.5, fontWeight: 600, marginTop: 2 }}>
            Enviar anuncio a todos los repartidores
          </div>
        </div>
        <Icon name="chevron-right" size={16} color={theme.accent}/>
      </div>

      <div style={{
        padding: '14px 18px 6px',
        fontSize: 10.5, fontFamily: "'Manrope', sans-serif",
        letterSpacing: 1.4, color: theme.muted, textTransform: 'uppercase',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>Repartidores</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            width: 6, height: 6, borderRadius: 3, background: theme.successFg,
            boxShadow: `0 0 0 3px ${theme.successFg}33`,
          }}/>
          <span style={{ color: theme.successFg }}>
            {REPARTIDORES.filter(r => r.online).length} en línea
          </span>
        </span>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', padding: '0 18px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {REPARTIDORES.map((r) => (
          <div key={r.id}
               onClick={(e) => onOpenConv(r, e)}
               style={{
                 background: theme.surface, color: theme.ink,
                 borderRadius: 16, padding: 12,
                 border: `1px solid ${theme.border}`,
                 display: 'flex', gap: 12, alignItems: 'center',
                 cursor: 'pointer', transition: 'transform 0.12s',
               }}
               onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
               onMouseUp={(e) => e.currentTarget.style.transform = ''}
               onMouseLeave={(e) => e.currentTarget.style.transform = ''}>
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 22,
                background: r.color, color: theme.ink,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700, letterSpacing: -0.3,
                fontFamily: "'Manrope', sans-serif",
              }}>{r.tag}</div>
              {r.online && (
                <div style={{
                  position: 'absolute', bottom: -2, right: -2,
                  width: 12, height: 12, borderRadius: 6,
                  background: theme.successFg, border: `2.5px solid ${theme.surface}`,
                }}/>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 14, fontWeight: 800, letterSpacing: -0.2, textTransform: 'uppercase',
              }}>{r.name}</div>
              <div style={{
                fontSize: 10, fontFamily: "'Manrope', sans-serif",
                letterSpacing: 0.6, textTransform: 'uppercase',
                color: r.online ? theme.successFg : theme.muted, marginTop: 1,
                display: 'inline-flex', alignItems: 'center', gap: 4,
              }}>
                <Icon name={r.online ? 'wifi' : 'wifi-off'} size={10}/>
                {r.online ? 'En línea' : 'Modo ahorro'}
              </div>
              <div style={{ fontSize: 11.5, color: theme.muted, marginTop: 4 }}>
                {r.routes.length
                  ? `Rutas: ${r.routes.slice(0, 3).join(', ')}${r.routes.length > 3 ? '…' : ''}`
                  : 'Sin rutas asignadas'}
              </div>
            </div>
            {(unreadByConv[r.id] || 0) > 0 && (
              <div style={{
                minWidth: 20, height: 20, borderRadius: 10, padding: '0 6px',
                background: theme.accent, color: theme.ink,
                fontSize: 10.5, fontWeight: 700,
                fontFamily: "'Manrope', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>{unreadByConv[r.id]}</div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
