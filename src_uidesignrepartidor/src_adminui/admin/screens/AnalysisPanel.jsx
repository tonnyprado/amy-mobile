// src/admin/screens/AnalysisPanel.jsx
// Panel narrow (85%) que se desliza desde la derecha.
// Contiene acciones recomendadas + tabla de detalles.

import React from 'react';
import Icon from '../components/Icon';
import { theme } from '../theme';

export default function AnalysisPanel({ onClose }) {
  return (
    <>
      <div style={{
        padding: '20px 20px 14px',
        display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `1px solid ${theme.border}`,
      }}>
        <Icon name="bar-chart-3" size={18}/>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 700, letterSpacing: -0.3 }}>
          Análisis y sugerencias
        </div>
        <button onClick={onClose} aria-label="Cerrar" style={{
          width: 32, height: 32, borderRadius: 16,
          background: theme.surface, border: `1px solid ${theme.border}`,
          color: theme.ink, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="x" size={15}/>
        </button>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', padding: '14px 20px 30px',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div>
          <div style={{
            fontSize: 11, fontFamily: "'Manrope', sans-serif",
            letterSpacing: 1.4, color: theme.muted, textTransform: 'uppercase',
            marginBottom: 8,
          }}>Acciones recomendadas</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <ActionCard tone="danger" title="Contactar repartidores para acelerar entregas"
                        cta="Llamar ahora" icon="phone"/>
            <ActionCard tone="info" title="2 repartidor(es) sin pedidos asignados"
                        cta="Asignar rutas" icon="user-plus"/>
            <ActionCard tone="warn" title="Revisar 3 incidencias pendientes"
                        cta="Ver detalle" icon="alert-octagon"/>
          </div>
        </div>
        <div>
          <div style={{
            fontSize: 11, fontFamily: "'Manrope', sans-serif",
            letterSpacing: 1.4, color: theme.muted, textTransform: 'uppercase',
            marginBottom: 8,
          }}>Detalles</div>
          <div style={{
            background: theme.surface, border: `1px solid ${theme.border}`,
            borderRadius: 14, padding: 12,
          }}>
            {[
              ['Total pedidos',       '144', theme.ink],
              ['En ruta',             '12',  theme.infoFg],
              ['Pendientes',          '20',  '#A86A12'],
              ['Incidencias',         '23',  theme.dangerFg],
              ['Promedio repartidor', '16 entregas', theme.ink],
            ].map(([label, value, color], i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 0',
                borderTop: i ? `1px solid ${theme.border}` : 'none',
              }}>
                <span style={{ fontSize: 13, color: theme.muted }}>{label}</span>
                <span style={{
                  fontSize: 14, fontWeight: 800, color,
                  fontFamily: "'Manrope', sans-serif",
                }}>{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

function ActionCard({ tone, title, cta, icon }) {
  const tones = {
    danger: { bg: theme.dangerBg, fg: theme.dangerFg, border: `${theme.dangerFg}33` },
    warn:   { bg: theme.warnBg,   fg: '#8E5F11',      border: theme.warnBorder },
    info:   { bg: theme.infoBg,   fg: theme.infoFg,   border: `${theme.infoFg}33` },
  };
  const t = tones[tone];
  return (
    <div style={{
      background: t.bg, border: `1px solid ${t.border}`,
      borderRadius: 12, padding: '10px 12px',
      display: 'flex', gap: 10, alignItems: 'flex-start',
    }}>
      <div style={{
        width: 28, height: 28, borderRadius: 8,
        background: theme.surface, color: t.fg,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon name={icon} size={13}/>
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, fontWeight: 600, color: theme.ink, lineHeight: 1.3 }}>
          {title}
        </div>
        <button style={{
          marginTop: 4, background: 'transparent', border: 'none',
          color: t.fg, fontSize: 12, fontWeight: 700, padding: 0, cursor: 'pointer',
          fontFamily: "'Montserrat', sans-serif",
          textDecoration: 'underline', textUnderlineOffset: 2,
        }}>{cta}</button>
      </div>
    </div>
  );
}
