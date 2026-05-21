// src/screens/OrdersScreen.jsx
// Pantalla 2 — Lista de pedidos del día con filtros y stats.

import React, { useState, useMemo } from 'react';
import SectionShell from '../components/SectionShell';
import SectionHeader from '../components/SectionHeader';
import PkgPlaceholder from '../components/PkgPlaceholder';
import Icon from '../components/Icon';
import { ORDERS } from '../data';

export default function OrdersScreen({ theme }) {
  const statusMap = {
    delivered: { label: 'Entregado', bg: theme.successBg, fg: theme.successFg, icon: 'check-check' },
    enRoute:   { label: 'En ruta',   bg: theme.accent,    fg: theme.ink,         icon: 'navigation' },
    pending:   { label: 'Pendiente', bg: theme.canvas,    fg: theme.muted,       icon: 'clock' },
  };
  const counts = {
    todos: ORDERS.length,
    entregados: ORDERS.filter(o => o.status === 'delivered').length,
    ruta: ORDERS.filter(o => o.status === 'enRoute').length,
    pendientes: ORDERS.filter(o => o.status === 'pending').length,
  };
  const [filter, setFilter] = useState('todos');
  const filtered = useMemo(() => {
    if (filter === 'todos') return ORDERS;
    const map = { entregados: 'delivered', ruta: 'enRoute', pendientes: 'pending' };
    return ORDERS.filter(o => o.status === map[filter]);
  }, [filter]);

  return (
    <SectionShell bg={theme.canvas} label="02 Pedidos" theme={theme}>
      <SectionHeader
        theme={theme}
        kicker="02 — Hoy, 5 paquetes"
        title={<>Pedidos<br/>del día</>}
        right={
          <div style={{ textAlign: 'right' }}>
            <div style={{
              fontSize: 10.5, fontFamily: "'Manrope', sans-serif",
              letterSpacing: 1.4, color: theme.muted, textTransform: 'uppercase',
            }}>Carrito</div>
            <div style={{
              fontSize: 32, fontWeight: 700,
              fontFamily: "'Manrope', sans-serif", lineHeight: 1, color: theme.ink,
            }}>05</div>
          </div>
        }
      />

      <StatStrip theme={theme} counts={counts}/>
      <Filters theme={theme} counts={counts} filter={filter} setFilter={setFilter}/>

      <div style={{
        flex: 1, overflowY: 'auto', padding: '0 20px 30px',
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {filtered.map((o) => (
          <OrderCard key={o.id} order={o} theme={theme} statusMeta={statusMap[o.status]}/>
        ))}
      </div>
    </SectionShell>
  );
}

function StatStrip({ theme, counts }) {
  const cells = [
    { k: 'Total',      v: counts.todos,      c: theme.ink,       icon: 'package' },
    { k: 'Entregados', v: counts.entregados, c: theme.successFg, icon: 'check-circle-2' },
    { k: 'En ruta',    v: counts.ruta,       c: theme.accentInk, icon: 'truck' },
    { k: 'Pendientes', v: counts.pendientes, c: theme.muted,     icon: 'clock' },
  ];
  return (
    <div style={{
      margin: '16px 20px 12px', display: 'grid',
      gridTemplateColumns: 'repeat(4,1fr)',
      background: theme.surface, borderRadius: 16,
      border: `1px solid ${theme.border}`, overflow: 'hidden',
    }}>
      {cells.map((s, i) => (
        <div key={s.k} style={{
          padding: '12px 6px', textAlign: 'center',
          borderLeft: i ? `1px solid ${theme.border}` : 'none',
        }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4, color: s.c }}>
            <Icon name={s.icon} size={13} strokeWidth={2}/>
          </div>
          <div style={{
            fontSize: 22, fontWeight: 700, color: s.c, lineHeight: 1,
            fontFamily: "'Manrope', sans-serif",
          }}>{String(s.v).padStart(2, '0')}</div>
          <div style={{
            fontSize: 9, marginTop: 4, letterSpacing: 0.8,
            color: theme.muted, textTransform: 'uppercase',
            fontFamily: "'Manrope', sans-serif",
          }}>{s.k}</div>
        </div>
      ))}
    </div>
  );
}

function Filters({ theme, counts, filter, setFilter }) {
  const opts = [
    ['todos','Todos', counts.todos],
    ['ruta','En ruta', counts.ruta],
    ['pendientes','Pendientes', counts.pendientes],
    ['entregados','Entregados', counts.entregados],
  ];
  return (
    <div className="chips" style={{
      display: 'flex', gap: 6, padding: '0 20px 12px', overflowX: 'auto',
    }}>
      {opts.map(([k, label, n]) => (
        <button key={k} onClick={() => setFilter(k)} style={{
          cursor: 'pointer', padding: '7px 12px', borderRadius: 999,
          background: filter === k ? theme.ink : theme.surface,
          color: filter === k ? theme.canvas : theme.ink,
          fontSize: 12, fontWeight: 600, letterSpacing: -0.1,
          display: 'inline-flex', gap: 6, alignItems: 'center',
          whiteSpace: 'nowrap',
          border: filter === k ? `1px solid ${theme.ink}` : `1px solid ${theme.border}`,
          fontFamily: "'Manrope', sans-serif",
        }}>
          {label}
          <span style={{
            fontSize: 10, fontFamily: "'Manrope', sans-serif", opacity: 0.75,
          }}>{String(n).padStart(2, '0')}</span>
        </button>
      ))}
    </div>
  );
}

function OrderCard({ order: o, theme, statusMeta: st }) {
  const isActive = o.status === 'enRoute';
  return (
    <div style={{
      background: isActive ? theme.ink : theme.surface,
      color: isActive ? theme.canvas : theme.ink,
      borderRadius: 18, padding: 14,
      border: isActive ? 'none' : `1px solid ${theme.border}`,
      boxShadow: isActive ? '0 12px 26px rgba(0,0,0,0.20)' : '0 1px 0 rgba(0,0,0,0.02)',
      display: 'flex', gap: 14, alignItems: 'center',
    }}>
      <PkgPlaceholder tone={o.tone} size={62} label={`#${o.id.split('-')[0]}`}/>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 3, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 10, fontFamily: "'Manrope', sans-serif",
            color: isActive ? 'rgba(255,255,255,0.55)' : theme.muted,
            letterSpacing: 1,
          }}>#{o.id}</span>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 7px', borderRadius: 999,
            background: st.bg, color: st.fg,
            fontSize: 9, fontWeight: 700, letterSpacing: 0.4,
            fontFamily: "'Manrope', sans-serif", textTransform: 'uppercase',
          }}>
            <Icon name={st.icon} size={9} strokeWidth={2.4}/>
            {st.label}
          </span>
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3, lineHeight: 1.2 }}>
          {o.addr}
        </div>
        <div style={{
          fontSize: 12, color: isActive ? 'rgba(255,255,255,0.65)' : theme.muted,
          marginTop: 2,
        }}>{o.col} · {o.name}</div>
        <div style={{
          display: 'flex', gap: 12, marginTop: 8,
          fontSize: 11, fontFamily: "'Manrope', sans-serif",
          color: isActive ? 'rgba(255,255,255,0.75)' : theme.muted,
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="clock" size={11}/> {o.time}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Icon name="package" size={11}/> {o.weight}
          </span>
        </div>
      </div>
      <button style={{
        width: 34, height: 34, borderRadius: 12,
        background: isActive ? theme.accent : theme.canvas,
        color: theme.ink,
        border: isActive ? 'none' : `1px solid ${theme.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', flexShrink: 0,
      }}>
        <Icon name="chevron-right" size={14} strokeWidth={2.4}/>
      </button>
    </div>
  );
}
