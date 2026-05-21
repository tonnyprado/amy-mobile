// src/screens/StatsScreen.jsx
// Pantalla 3 — Estadísticas semanales (fondo de color acento).

import React from 'react';
import SectionShell from '../components/SectionShell';
import Pill from '../components/Pill';
import Icon from '../components/Icon';
import { STATS } from '../data';

export default function StatsScreen({ theme }) {
  return (
    <SectionShell bg={theme.accent} label="03 Estadísticas" theme={theme}>
      <div style={{ padding: '6px 20px 0' }}>
        <div style={{
          fontSize: 10.5, fontFamily: "'Manrope', sans-serif",
          letterSpacing: 1.4, color: theme.ink, opacity: 0.55, textTransform: 'uppercase',
        }}>03 — Tu desempeño</div>
        <div style={{
          fontSize: 28, fontWeight: 700, letterSpacing: -0.8, lineHeight: 1.05,
          marginTop: 2, color: theme.ink, fontFamily: "'Montserrat', sans-serif",
        }}>Esta semana</div>
      </div>

      <HeroCard theme={theme}/>
      <StatGrid theme={theme}/>
      <AchievementStrip theme={theme}/>
    </SectionShell>
  );
}

function HeroCard({ theme }) {
  const { deliveriesToday, assignedToday, weekBars, weekDays } = STATS;
  const maxB = Math.max(...weekBars);
  const lastIdx = weekBars.length - 1;

  return (
    <div style={{ padding: '14px 20px 0' }}>
      <div style={{
        background: theme.ink, color: theme.canvas, borderRadius: 22,
        padding: 18, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
          marginBottom: 8,
        }}>
          <div style={{
            fontSize: 10, fontFamily: "'Manrope', sans-serif",
            letterSpacing: 1.4, opacity: 0.6, textTransform: 'uppercase',
            display: 'inline-flex', alignItems: 'center', gap: 5,
          }}>
            <Icon name="package-check" size={11}/> Entregas hoy
          </div>
          <Pill bg={theme.accent} color={theme.ink}>
            <Icon name="trending-up" size={10} strokeWidth={2.4}/> +12%
          </Pill>
        </div>
        <div style={{
          fontSize: 92, fontWeight: 700, letterSpacing: -4, lineHeight: 0.85,
          fontFamily: "'Montserrat', sans-serif", marginTop: 4,
        }}>{deliveriesToday}</div>
        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>
          de {assignedToday} asignadas · {assignedToday - deliveriesToday} pendientes
        </div>

        <div style={{ marginTop: 16, position: 'relative' }}>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6,
            alignItems: 'flex-end', height: 64,
          }}>
            {weekBars.map((b, i) => (
              <div key={i} style={{
                height: `${(b / maxB) * 100}%`,
                background: i === lastIdx ? theme.accent : 'rgba(255,255,255,0.22)',
                borderRadius: 4, position: 'relative',
              }}>
                {i === lastIdx && (
                  <div style={{
                    position: 'absolute', top: -16, left: '50%', transform: 'translateX(-50%)',
                    fontSize: 10, fontFamily: "'Manrope', sans-serif",
                    color: theme.accent, fontWeight: 700,
                  }}>{b}</div>
                )}
              </div>
            ))}
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 6, marginTop: 6,
          }}>
            {weekDays.map((d, i) => (
              <div key={i} style={{
                fontSize: 9.5, fontFamily: "'Manrope', sans-serif",
                color: 'rgba(255,255,255,0.45)', textAlign: 'center',
                fontWeight: i === lastIdx ? 700 : 400,
              }}>{d}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatGrid({ theme }) {
  const cells = [
    { k: 'Distancia',    v: STATS.distance,   u: 'km',  sub: '6 hr 40 min en ruta',     icon: 'map'      },
    { k: 'Calificación', v: STATS.rating,     u: '/5',  sub: '37 reseñas esta semana',  icon: 'star'     },
    { k: 'Eficiencia',   v: STATS.efficiency, u: '%',   sub: 'Optimización de ruta',    icon: 'zap'      },
    { k: 'Ingreso',      v: STATS.income,     u: 'MXN', sub: 'Acumulado de la semana',  icon: 'banknote' },
  ];
  return (
    <div style={{
      padding: '10px 20px 0', display: 'grid',
      gridTemplateColumns: '1fr 1fr', gap: 10,
    }}>
      {cells.map((s) => (
        <div key={s.k} style={{
          background: theme.canvas, color: theme.ink, borderRadius: 16,
          padding: 12, position: 'relative',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{
              fontSize: 10, fontFamily: "'Manrope', sans-serif",
              letterSpacing: 1.2, color: theme.muted, textTransform: 'uppercase',
            }}>{s.k}</div>
            <Icon name={s.icon} size={13} color={theme.muted}/>
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginTop: 6 }}>
            <span style={{
              fontSize: 28, fontWeight: 700, letterSpacing: -1, lineHeight: 1,
              fontFamily: "'Manrope', sans-serif",
            }}>{s.v}</span>
            <span style={{
              fontSize: 12, color: theme.muted, fontWeight: 600,
              fontFamily: "'Manrope', sans-serif",
            }}>{s.u}</span>
          </div>
          <div style={{ fontSize: 10.5, color: theme.muted, marginTop: 4 }}>{s.sub}</div>
        </div>
      ))}
    </div>
  );
}

function AchievementStrip({ theme }) {
  return (
    <div style={{
      margin: '10px 20px 0', padding: '12px 14px',
      background: 'rgba(0,0,0,0.06)', borderRadius: 14,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: theme.ink, color: theme.accent,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon name="award" size={18}/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: theme.ink, letterSpacing: -0.2 }}>
          Racha de 5 días sin incidencias
        </div>
        <div style={{ fontSize: 11, color: theme.ink, opacity: 0.6 }}>
          Sigue así para bono mensual
        </div>
      </div>
      <Icon name="chevron-right" size={16} color={theme.ink}/>
    </div>
  );
}
