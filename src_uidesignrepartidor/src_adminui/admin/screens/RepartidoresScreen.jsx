// src/admin/screens/RepartidoresScreen.jsx
// Pantalla 03 — Lista de repartidores con filtros + 3 acciones por card.

import React, { useState } from 'react';
import SectionShell from '../components/SectionShell';
import AdminBadge from '../components/AdminBadge';
import Icon from '../components/Icon';
import { theme } from '../theme';
import { REPARTIDORES } from '../data';

export default function RepartidoresScreen({ onCallTap, onChatTap }) {
  const [filter, setFilter] = useState('todos');
  const withRoutes = REPARTIDORES.filter(r => r.routes.length > 0).length;
  const counts = {
    todos:    REPARTIDORES.length,
    ruta:     REPARTIDORES.filter(r => r.status === 'enRuta').length,
    libre:    REPARTIDORES.filter(r => r.status === 'libre').length,
    descanso: REPARTIDORES.filter(r => r.status === 'descanso').length,
  };
  const filtered = REPARTIDORES.filter(r => {
    if (filter === 'todos')    return true;
    if (filter === 'ruta')     return r.status === 'enRuta';
    if (filter === 'libre')    return r.status === 'libre';
    if (filter === 'descanso') return r.status === 'descanso';
  });

  return (
    <SectionShell bg={theme.canvas} label="03 Repartidores">
      <div style={{
        padding: '6px 18px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
      }}>
        <div>
          <AdminBadge/>
          <div style={{
            fontSize: 11, fontFamily: "'Manrope', sans-serif",
            letterSpacing: 1.4, color: theme.muted, textTransform: 'uppercase', marginTop: 8,
          }}>03 — Equipo</div>
          <div style={{
            fontSize: 28, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.05,
            marginTop: 2, color: theme.ink,
          }}>Repartidores</div>
        </div>
        <button aria-label="Anuncio masivo" style={{
          width: 38, height: 38, borderRadius: 12,
          background: theme.ink, color: theme.canvas, border: 'none',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', boxShadow: '0 6px 14px rgba(0,0,0,0.18)',
        }}>
          <Icon name="megaphone" size={17}/>
        </button>
      </div>

      {/* Stats */}
      <div style={{
        margin: '14px 18px 0', display: 'grid',
        gridTemplateColumns: '1fr 1fr', gap: 8,
      }}>
        <BigStat kicker="Total"     value={REPARTIDORES.length} fg={theme.ink}/>
        <BigStat kicker="Con rutas" value={withRoutes}          fg={theme.accent}/>
      </div>

      {/* Filters */}
      <div className="chips" style={{
        display: 'flex', gap: 6, padding: '14px 18px 12px', overflowX: 'auto',
      }}>
        {[
          ['todos','Todos', counts.todos],
          ['ruta','En ruta', counts.ruta],
          ['libre','Libres', counts.libre],
          ['descanso','Descanso', counts.descanso],
        ].map(([k, label, n]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            cursor: 'pointer', padding: '7px 12px', borderRadius: 999,
            background: filter === k ? theme.ink : theme.surface,
            color: filter === k ? theme.canvas : theme.ink,
            fontSize: 12, fontWeight: 600,
            display: 'inline-flex', gap: 6, alignItems: 'center',
            whiteSpace: 'nowrap',
            border: filter === k ? `1px solid ${theme.ink}` : `1px solid ${theme.border}`,
            fontFamily: "'Montserrat', sans-serif",
          }}>
            {label}
            <span style={{
              fontSize: 10, fontFamily: "'Manrope', sans-serif", opacity: 0.75,
            }}>{String(n).padStart(2,'0')}</span>
          </button>
        ))}
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', padding: '0 18px 30px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {filtered.map(r => (
          <RepartidorRow key={r.id} r={r}
                         onCall={() => onCallTap(r)}
                         onChat={(e) => onChatTap(r, e)}/>
        ))}
      </div>
    </SectionShell>
  );
}

const BigStat = ({ kicker, value, fg }) => (
  <div style={{
    background: theme.surface, border: `1px solid ${theme.border}`,
    borderRadius: 14, padding: '14px 16px',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  }}>
    <div>
      <div style={{
        fontSize: 10, fontFamily: "'Manrope', sans-serif",
        letterSpacing: 1.4, color: theme.muted, textTransform: 'uppercase',
      }}>{kicker}</div>
      <div style={{
        fontSize: 36, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1,
        marginTop: 4, color: fg, fontFamily: "'Manrope', sans-serif",
      }}>{value}</div>
    </div>
  </div>
);

function RepartidorRow({ r, onCall, onChat }) {
  return (
    <div style={{
      background: theme.surface, border: `1px solid ${theme.border}`,
      borderRadius: 18, padding: 14,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          width: 46, height: 46, borderRadius: 23, flexShrink: 0,
          background: r.color, color: theme.ink,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 700, letterSpacing: -0.3,
          fontFamily: "'Manrope', sans-serif",
          position: 'relative',
        }}>
          {r.tag}
          {r.online && (
            <span style={{
              position: 'absolute', bottom: -2, right: -2,
              width: 13, height: 13, borderRadius: 7,
              background: theme.successFg, border: `2.5px solid ${theme.surface}`,
            }}/>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 15, fontWeight: 800, letterSpacing: -0.2,
            textTransform: 'uppercase', color: theme.ink,
          }}>{r.name}</div>
          <div style={{
            fontSize: 12, color: theme.muted, marginTop: 4,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Icon name="phone" size={11}/>
            {r.phone || <span style={{ fontStyle: 'italic' }}>Sin teléfono</span>}
          </div>
          <div style={{
            fontSize: 12, color: theme.muted, marginTop: 2,
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <Icon name="truck" size={11}/>
            {r.routes.length
              ? <span style={{ fontFamily: "'Manrope', sans-serif" }}>{r.routes.join(', ')}</span>
              : <span style={{ fontStyle: 'italic' }}>Sin rutas asignadas</span>}
          </div>
        </div>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '40px 1fr 1fr', gap: 8, marginTop: 12,
      }}>
        <button aria-label="Editar" style={{
          background: theme.canvas, border: `1px solid ${theme.border}`,
          borderRadius: 12, padding: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: theme.muted,
        }}>
          <Icon name="square-pen" size={16}/>
        </button>
        <button onClick={onCall} disabled={!r.phone} style={{
          background: r.phone ? theme.successFg : theme.surface,
          border: r.phone ? 'none' : `1px solid ${theme.border}`,
          color: r.phone ? '#fff' : theme.muted,
          borderRadius: 12, padding: '8px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          cursor: r.phone ? 'pointer' : 'not-allowed',
          fontSize: 13, fontWeight: 700, letterSpacing: -0.1,
          fontFamily: "'Montserrat', sans-serif",
          opacity: r.phone ? 1 : 0.5,
        }}>
          <Icon name="phone" size={14} strokeWidth={2.4}/> Llamar
        </button>
        <button onClick={onChat} style={{
          background: theme.ink, color: theme.canvas, border: 'none',
          borderRadius: 12, padding: '8px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          cursor: 'pointer',
          fontSize: 13, fontWeight: 700, letterSpacing: -0.1,
          fontFamily: "'Montserrat', sans-serif",
        }}>
          <Icon name="message-circle" size={14} strokeWidth={2.4}/> Chat
        </button>
      </div>
    </div>
  );
}
