// src/admin/components/primitives.jsx
// Bloques compartidos por las pantallas de Estadísticas / Monitoreo.

import React from 'react';
import Icon from './Icon';
import CountUp from './CountUp';
import { theme } from '../theme';

/* ─── Block ────────────────────────────────────────────────
 * Card genérica con header (icon + title + opcional badge).
 * Props bg/fg/accent permiten variar entre claro/oscuro/tinted.
 * delay (ms) controla el animation-delay del card-anim.
 */
export function Block({ icon, title, badge, children, delay = 0, bg, fg, accent }) {
  const bgC  = bg  || theme.surface;
  const fgC  = fg  || theme.ink;
  const accC = accent || theme.canvas;
  const dark = !!bg && bg !== theme.surface && bg.toLowerCase().includes('0e'); // ink
  return (
    <div className="card-anim" style={{
      background: bgC, color: fgC,
      border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : theme.border}`,
      borderRadius: 16, padding: 14,
      animationDelay: `${delay}ms`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 24, height: 24, borderRadius: 7,
          background: dark ? 'rgba(255,255,255,0.08)' : accC, color: fgC,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name={icon} size={13} strokeWidth={2.2}/>
        </div>
        <div style={{
          fontSize: 11.5, fontWeight: 800, letterSpacing: 0.8,
          color: fgC, textTransform: 'uppercase',
          fontFamily: "'Manrope', sans-serif", flex: 1,
        }}>{title}</div>
        {badge != null && (
          <div style={{
            minWidth: 24, height: 22, padding: '0 8px', borderRadius: 11,
            background: dark ? theme.accent : theme.ink,
            color: dark ? theme.ink : theme.canvas,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700,
            fontFamily: "'Manrope', sans-serif",
          }}>{badge}</div>
        )}
      </div>
      {children}
    </div>
  );
}

/* ─── HeroStat ─────────────────────────────────────────────
 * Card alto-impacto. value puede ser string ("82%") o número.
 * animateNum: si está, usa CountUp.
 * bg: override background; pasar theme.ink para card oscuro.
 */
export function HeroStat({ kicker, value, sub, icon, tone, delay = 0, animateNum, bg }) {
  const bgC = bg || theme.surface;
  const dark = bg === theme.ink;
  return (
    <div className="card-anim" style={{
      background: bgC,
      border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : theme.border}`,
      borderRadius: 14, padding: 12,
      display: 'flex', flexDirection: 'column', gap: 6,
      animationDelay: `${delay}ms`,
      boxShadow: dark ? '0 8px 18px rgba(0,0,0,0.18)' : 'none',
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 8,
        background: dark ? 'rgba(255,255,255,0.1)' : `${tone}26`, color: tone,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name={icon} size={14} strokeWidth={2.2}/>
      </div>
      <div style={{
        fontSize: 22, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1,
        color: tone, fontFamily: "'Manrope', sans-serif",
      }}>
        {animateNum != null
          ? <><CountUp value={animateNum}/>{typeof value === 'string' && value.endsWith('%') ? '%' : ''}</>
          : value}
      </div>
      <div>
        <div style={{
          fontSize: 9.5, fontFamily: "'Manrope', sans-serif",
          letterSpacing: 1.2, color: dark ? 'rgba(255,255,255,0.6)' : theme.muted,
          textTransform: 'uppercase', fontWeight: 700,
        }}>{kicker}</div>
        {sub && <div style={{
          fontSize: 10, color: dark ? 'rgba(255,255,255,0.5)' : theme.muted,
          marginTop: 2, fontFamily: "'Manrope', sans-serif",
        }}>{sub}</div>}
      </div>
    </div>
  );
}

/* ─── MiniBox · IntentoBox · SmallMetric ─────────────────── */
export function MiniBox({ label, value, fg, bg }) {
  return (
    <div style={{ background: bg, padding: '8px 10px', borderRadius: 10, textAlign: 'center' }}>
      <div style={{
        fontSize: 18, fontWeight: 800, color: fg, lineHeight: 1,
        fontFamily: "'Manrope', sans-serif", letterSpacing: -0.4,
      }}><CountUp value={value}/></div>
      <div style={{
        fontSize: 9.5, color: fg, opacity: 0.8, marginTop: 4,
        fontFamily: "'Manrope', sans-serif", letterSpacing: 0.8,
        textTransform: 'uppercase', fontWeight: 700,
      }}>{label}</div>
    </div>
  );
}

export function IntentoBox({ label, value, fg }) {
  return (
    <div style={{
      background: theme.canvas, padding: 10, borderRadius: 10, textAlign: 'center',
      border: `1px solid ${theme.border}`,
    }}>
      <div style={{
        fontSize: 20, fontWeight: 800, color: fg, lineHeight: 1,
        fontFamily: "'Manrope', sans-serif", letterSpacing: -0.5,
      }}><CountUp value={value}/></div>
      <div style={{
        fontSize: 9.5, color: theme.muted, marginTop: 4,
        fontFamily: "'Manrope', sans-serif", letterSpacing: 0.6,
        textTransform: 'uppercase', fontWeight: 700,
      }}>{label}</div>
    </div>
  );
}

export function SmallMetric({ label, value, fg }) {
  return (
    <div style={{
      background: theme.canvas, padding: 10, borderRadius: 10,
      border: `1px solid ${theme.border}`,
    }}>
      <div style={{
        fontSize: 9.5, fontFamily: "'Manrope', sans-serif",
        letterSpacing: 1.2, color: theme.muted, textTransform: 'uppercase',
        fontWeight: 700,
      }}>{label}</div>
      <div style={{
        fontSize: 22, fontWeight: 800, color: fg, lineHeight: 1,
        fontFamily: "'Manrope', sans-serif", letterSpacing: -0.6,
        marginTop: 4,
      }}><CountUp value={value}/></div>
    </div>
  );
}
