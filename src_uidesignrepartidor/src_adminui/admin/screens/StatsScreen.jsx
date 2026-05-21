// src/admin/screens/StatsScreen.jsx
// Pantalla 01 — Estadísticas e incidencias. Es la primera por default.
// Fondo coral (theme.accent). Contiene 5 bloques + "Ver más detalles".
//
// Para que las animaciones se repitan al volver a entrar a la pantalla,
// el padre debe pasar un `key` que cambie cada vez que activeSection===0.

import React from 'react';
import SectionShell from '../components/SectionShell';
import AdminBadge from '../components/AdminBadge';
import Icon from '../components/Icon';
import CountUp from '../components/CountUp';
import { Block, HeroStat, MiniBox } from '../components/primitives';
import RitmoCard from './stats/RitmoCard';
import AlertsStrip from './stats/AlertsStrip';
import { theme } from '../theme';
import { STATS } from '../data';

export default function StatsScreen({ onOpenAnalysis, onOpenScanner, onOpenMoreDetails }) {
  const data = STATS;
  const ritmoDelta = data.successRate - data.expectedPct;
  const ritmo = ritmoDelta >= 5  ? { tone: 'good', label: 'Excelente ritmo',      sub: 'Vamos adelante del objetivo', icon: 'rocket' }
              : ritmoDelta >= -5 ? { tone: 'ok',   label: 'Ritmo dentro de meta', sub: 'En línea con lo esperado',    icon: 'activity' }
              :                    { tone: 'bad',  label: 'Ritmo lento',          sub: 'Necesitan acelerar',          icon: 'triangle-alert' };

  return (
    <SectionShell bg={theme.accent} label="01 Estadísticas">
      {/* Header */}
      <div style={{
        padding: '6px 18px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
      }}>
        <div>
          <AdminBadge/>
          <div style={{
            fontSize: 11, fontFamily: "'Manrope', sans-serif",
            letterSpacing: 1.4, color: theme.ink, opacity: 0.55,
            textTransform: 'uppercase', marginTop: 8,
          }}>01 — Operación de hoy</div>
          <div style={{
            fontSize: 26, fontWeight: 700, letterSpacing: -0.7, lineHeight: 1.05,
            marginTop: 2, color: theme.ink,
          }}>Estadísticas<br/>e incidencias</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={onOpenScanner} aria-label="Escáner" style={{
            width: 38, height: 38, borderRadius: 12,
            background: theme.ink, color: theme.canvas, border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', boxShadow: '0 8px 18px rgba(0,0,0,0.18)',
            flexShrink: 0,
          }}>
            <Icon name="scan-line" size={17}/>
          </button>
          <button aria-label="Refrescar" style={{
            width: 38, height: 38, borderRadius: 12,
            background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(4px)',
            color: theme.ink, border: '1px solid rgba(255,255,255,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', flexShrink: 0,
          }}>
            <Icon name="rotate-cw" size={16}/>
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '14px 18px 30px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {/* 3 hero stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          <HeroStat kicker="Éxito" value={`${data.successRate}%`} animateNum={data.successRate}
                    icon="check-check" tone={theme.successFg}
                    bg={theme.successBg} delay={0}/>
          <HeroStat kicker="Entregados" value={data.delivered} animateNum={data.delivered}
                    sub={`de ${data.assigned}`}
                    icon="package-check" tone={theme.canvas}
                    bg={theme.ink} delay={80}/>
          <HeroStat kicker="Activos" value={data.activeDrivers} animateNum={data.activeDrivers}
                    sub={`de ${data.totalDrivers}`}
                    icon="truck" tone={theme.infoFg}
                    bg={theme.infoBg} delay={160}/>
        </div>

        {/* Progreso del día */}
        <Block icon="trending-up" title="Progreso del día" delay={240}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8,
          }}>
            <span style={{
              fontSize: 32, fontWeight: 800, letterSpacing: -1.2, lineHeight: 1,
              fontFamily: "'Manrope', sans-serif", color: theme.ink,
            }}><CountUp value={data.successRate}/>%</span>
            <span style={{
              fontSize: 11, fontFamily: "'Manrope', sans-serif",
              letterSpacing: 1.2, color: theme.muted, textTransform: 'uppercase',
            }}><CountUp value={data.delivered}/> / {data.assigned}</span>
          </div>
          <div style={{ height: 8, background: '#E9ECEF', borderRadius: 4, overflow: 'hidden' }}>
            <div className="bar-anim" style={{
              width: `${data.successRate}%`, height: '100%',
              background: `linear-gradient(90deg, ${theme.successFg}, ${theme.successFg}DD)`,
              borderRadius: 4,
            }}/>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6, marginTop: 12 }}>
            <MiniBox label="Entregados" value={data.delivered} fg={theme.successFg} bg={theme.successBg}/>
            <MiniBox label="En ruta"    value={data.inRoute}   fg={theme.infoFg}    bg={theme.infoBg}/>
            <MiniBox label="Pendientes" value={data.pending}   fg="#A86A12"          bg={theme.warnBg}/>
          </div>
        </Block>

        {/* Análisis de ritmo */}
        <div className="card-anim" style={{ animationDelay: '320ms' }}>
          <RitmoCard ritmo={ritmo} real={data.successRate} expected={data.expectedPct}/>
        </div>

        {/* Alertas activas — centrado */}
        <div className="card-anim" style={{
          animationDelay: '400ms', display: 'flex', justifyContent: 'center',
        }}>
          <AlertsStrip high={data.alerts.high} mid={data.alerts.mid} onTap={onOpenAnalysis}/>
        </div>

        {/* CTA — Ver más detalles (dispara circle reveal) */}
        <button onClick={(e) => onOpenMoreDetails(e)} className="card-anim" style={{
          padding: '14px 14px',
          background: theme.ink, color: theme.canvas, border: 'none',
          borderRadius: 14,
          display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
          fontFamily: "'Montserrat', sans-serif",
          animationDelay: '480ms',
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: theme.accent, color: theme.ink,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="layout-dashboard" size={16}/>
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: -0.2 }}>
              Ver más detalles
            </div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>
              Incidencias · Intentos · Top repartidores · Métricas
            </div>
          </div>
          <Icon name="chevron-left" size={16} color={theme.accent}/>
        </button>
      </div>
    </SectionShell>
  );
}
