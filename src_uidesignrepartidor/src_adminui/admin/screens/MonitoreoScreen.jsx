// src/admin/screens/MonitoreoScreen.jsx
// Pantalla 02 — Monitoreo en tiempo real.
// Header con saludo + alerta crítica con hora live + 3 cards + lista de progreso.

import React from 'react';
import SectionShell from '../components/SectionShell';
import AdminBadge from '../components/AdminBadge';
import Icon from '../components/Icon';
import CountUp from '../components/CountUp';
import CriticalAlert from './monitoreo/CriticalAlert';
import MetricCard from './monitoreo/MetricCard';
import ProgressCard from './monitoreo/ProgressCard';
import { theme } from '../theme';
import { REPARTIDORES } from '../data';

export default function MonitoreoScreen({ onOpenAnalysis }) {
  const active = REPARTIDORES.filter(r => r.status === 'enRuta');
  const totalAssigned = REPARTIDORES.reduce((a, r) => a + r.progress.total, 0);
  const totalDone     = REPARTIDORES.reduce((a, r) => a + r.progress.done,  0);
  const pct = totalAssigned ? Math.round((totalDone / totalAssigned) * 100) : 0;
  const expectedPct = 61;
  const lagging = pct < expectedPct - 10;

  return (
    <SectionShell bg={theme.canvas} label="02 Monitoreo">
      {/* Header */}
      <div style={{
        padding: '6px 18px 0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
      }}>
        <div>
          <AdminBadge/>
          <div style={{
            fontSize: 11, fontFamily: "'Manrope', sans-serif",
            letterSpacing: 1.4, color: theme.muted, textTransform: 'uppercase',
            marginTop: 8,
          }}>Hoy · monitoreo</div>
          <div style={{
            fontSize: 26, fontWeight: 700, letterSpacing: -0.6, lineHeight: 1.1,
            marginTop: 2, color: theme.ink,
            display: 'inline-flex', alignItems: 'center', gap: 8,
          }}>
            Hola, Tony
            <Icon name="hand" size={22} color={theme.accent} strokeWidth={2.2}/>
          </div>
          <div style={{ fontSize: 12.5, color: theme.muted, marginTop: 2 }}>
            Monitoreo en tiempo real
          </div>
        </div>
      </div>

      <CriticalAlert/>

      <div style={{
        padding: '14px 18px 0',
        display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8,
      }}>
        <MetricCard kicker="Completado" value={`${pct}%`} progress={pct}/>
        <MetricCard kicker="Entregados" value={totalDone} sub={`de ${totalAssigned}`}/>
        <MetricCard kicker="Activos"    value={active.length} sub={`de ${REPARTIDORES.length}`}/>
      </div>

      {lagging && (
        <div style={{
          margin: '12px 18px 0', padding: '12px 14px',
          background: theme.ink, color: theme.canvas,
          borderRadius: 14,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            background: theme.dangerBg, color: theme.dangerFg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon name="zap-off" size={16}/>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: 9.5, fontFamily: "'Manrope', sans-serif",
              letterSpacing: 1.4, opacity: 0.55, textTransform: 'uppercase',
            }}>Ritmo · {pct}% vs {expectedPct}% esperado</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 1 }}>
              Equipo retrasado — contactar repartidores
            </div>
          </div>
          <Icon name="chevron-right" size={16} color={theme.accent}/>
        </div>
      )}

      <div style={{
        padding: '14px 18px 6px',
        fontSize: 10.5, fontFamily: "'Manrope', sans-serif",
        letterSpacing: 1.4, color: theme.muted, textTransform: 'uppercase',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <span>Repartidores activos</span>
        <span style={{ color: theme.muted }}>{active.length} en línea</span>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', padding: '0 18px 30px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {REPARTIDORES.map(r => <ProgressCard key={r.id} r={r}/>)}
      </div>
    </SectionShell>
  );
}
