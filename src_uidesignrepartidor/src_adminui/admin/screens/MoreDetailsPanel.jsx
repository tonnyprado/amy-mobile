// src/admin/screens/MoreDetailsPanel.jsx
// Panel que se desliza desde la izquierda al tocar "Ver más detalles".
// Contiene: Incidencias (oscura), Intentos, Pedidos tipo aviso,
// Top repartidores (beige cálida), Métricas generales (azul clara).
//
// Para que las animaciones se repitan cada vez que se abre, el padre
// debe pasar `key={moreOpenKey}` que incrementa cada apertura.

import React from 'react';
import SectionShell from '../components/SectionShell';
import Icon from '../components/Icon';
import { Block, IntentoBox, SmallMetric } from '../components/primitives';
import IncidenciaRow from './stats/IncidenciaRow';
import TopRepRow from './stats/TopRepRow';
import { theme } from '../theme';
import { STATS } from '../data';

export default function MoreDetailsPanel({ onClose, onOpenAnalysis }) {
  const data = STATS;
  const totalIncidencias = data.incidencias.reduce((a, x) => a + x.value, 0);
  const rejectionRate = Math.round((totalIncidencias / data.assigned) * 100);
  const maxInc = Math.max(...data.incidencias.map(i => i.value));

  return (
    <SectionShell bg={theme.canvas} label="Más detalles">
      {/* Header */}
      <div style={{
        padding: '6px 16px 0', display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 10.5, fontFamily: "'Manrope', sans-serif",
            letterSpacing: 1.4, color: theme.muted, textTransform: 'uppercase',
          }}>Estadísticas</div>
          <div style={{
            fontSize: 22, fontWeight: 700, letterSpacing: -0.6,
            lineHeight: 1.1, marginTop: 2, color: theme.ink,
          }}>Más detalles</div>
        </div>
        <button onClick={onClose} aria-label="Volver" style={{
          width: 38, height: 38, borderRadius: 12,
          background: theme.surface, border: `1px solid ${theme.border}`,
          color: theme.ink, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
        }}>
          <Icon name="chevron-left" size={18} strokeWidth={2.2}/>
        </button>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', padding: '14px 18px 30px',
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {/* Incidencias — card oscura (ink) */}
        <Block icon="package-x" title="Incidencias" badge={totalIncidencias}
               bg={theme.ink} fg={theme.canvas} accent="rgba(255,255,255,0.08)"
               delay={0}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.incidencias.map((inc, i) => (
              <IncidenciaRow key={inc.key} inc={inc} max={maxInc} dark delay={50 + i*60}/>
            ))}
          </div>
          <div style={{
            marginTop: 10, paddingTop: 10,
            borderTop: '1px solid rgba(255,255,255,0.08)',
            display: 'flex', justifyContent: 'space-between',
            fontSize: 11.5, fontFamily: "'Manrope', sans-serif",
            color: 'rgba(255,255,255,0.6)',
          }}>
            <span>Rechazados: <strong style={{ color: theme.canvas, fontWeight: 700 }}>{totalIncidencias}</strong></span>
            <span>Tasa rechazo: <strong style={{ color: theme.accent, fontWeight: 700 }}>{rejectionRate}%</strong></span>
          </div>
        </Block>

        <Block icon="rotate-cw" title="Intentos de entrega" delay={120}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 6 }}>
            <IntentoBox label="1er intento" value={data.intentos.uno}  fg={theme.successFg}/>
            <IntentoBox label="2do intento" value={data.intentos.dos}  fg="#A86A12"/>
            <IntentoBox label="3er intento" value={data.intentos.tres} fg={theme.dangerFg}/>
          </div>
        </Block>

        {/* Pedidos tipo aviso */}
        <button onClick={onOpenAnalysis} style={{
          background: theme.surface, border: `1px solid ${theme.border}`,
          borderRadius: 14, padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: 12,
          cursor: 'pointer', textAlign: 'left',
          fontFamily: "'Montserrat', sans-serif",
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: theme.warnBg, color: '#A86A12',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon name="bell-ring" size={16}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 10.5, fontFamily: "'Manrope', sans-serif",
              letterSpacing: 1.2, color: theme.muted, textTransform: 'uppercase',
            }}>Pedidos tipo aviso</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: theme.ink, marginTop: 1 }}>
              Requieren atención especial
            </div>
          </div>
          <div style={{
            fontSize: 22, fontWeight: 800, color: '#A86A12',
            fontFamily: "'Manrope', sans-serif", letterSpacing: -0.5,
          }}>{data.avisos}</div>
          <Icon name="chevron-right" size={16} color={theme.muted}/>
        </button>

        {/* Top repartidores — beige cálida */}
        <Block icon="trophy" title="Top repartidores" delay={240}
               bg="#FFF6E6" fg={theme.ink} accent="#F4DDA8">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.topReps.map((r, i) => (
              <TopRepRow key={r.name} rank={i + 1} r={r} delay={i * 120}/>
            ))}
          </div>
        </Block>

        {/* Métricas generales — azul muy clara */}
        <Block icon="bar-chart-3" title="Métricas generales" delay={300}
               bg="#ECF1F8" fg={theme.ink} accent="#D8E2EE">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
            <SmallMetric label="Total pedidos"   value={data.metricas.total}      fg={theme.ink}/>
            <SmallMetric label="Promedio / rep." value={data.metricas.promedio}   fg={theme.infoFg}/>
            <SmallMetric label="En ruta"         value={data.metricas.ruta}       fg={theme.accent}/>
            <SmallMetric label="Pendientes"      value={data.metricas.pendientes} fg="#A86A12"/>
          </div>
        </Block>

        {/* CTA Análisis */}
        <button onClick={onOpenAnalysis} className="card-anim" style={{
          padding: '14px 14px',
          background: theme.ink, color: theme.canvas, border: 'none',
          borderRadius: 14,
          display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
          fontFamily: "'Montserrat', sans-serif",
          animationDelay: '360ms',
        }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: theme.accent, color: theme.ink,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="bar-chart-3" size={16}/>
          </div>
          <div style={{ flex: 1, textAlign: 'left' }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: -0.2 }}>
              Análisis y sugerencias
            </div>
            <div style={{ fontSize: 11, opacity: 0.6 }}>
              Acciones recomendadas · detalles · tiempos
            </div>
          </div>
          <Icon name="chevron-right" size={16} color={theme.accent}/>
        </button>
      </div>
    </SectionShell>
  );
}
