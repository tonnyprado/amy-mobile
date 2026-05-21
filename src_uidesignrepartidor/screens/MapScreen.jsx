// src/screens/MapScreen.jsx
// Pantalla 1 — Mapa de ruta del día.
// Layout:
//  - Header (saludo + iconos buscar/notificaciones)
//  - Mapa fullscreen (placeholder SVG; en Expo usa react-native-maps)
//  - Timeline vertical de paradas a la izquierda
//  - FABs a la derecha (zoom, recenter, capas)
//  - Card de progreso + card "Próxima parada" abajo

import React from 'react';
import SectionShell from '../components/SectionShell';
import Pill from '../components/Pill';
import Icon from '../components/Icon';
import { STOPS } from '../data';

const iconBtn = (theme, accent) => ({
  width: 38, height: 38, borderRadius: 12,
  background: accent ? theme.ink : theme.surface,
  border: accent ? 'none' : `1px solid ${theme.border}`,
  color: accent ? theme.canvas : theme.ink,
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer',
  boxShadow: accent ? '0 6px 14px rgba(0,0,0,0.18)' : '0 1px 3px rgba(0,0,0,0.05)',
});

export default function MapScreen({ theme }) {
  const stops = STOPS;

  return (
    <SectionShell bg={theme.canvas} label="01 Mapa" theme={theme}>
      <div style={{ position: 'absolute', inset: 0, background: theme.mapBg, zIndex: 0 }}>
        <MapSVG accent={theme.accent} muted={theme.mapLine} bg={theme.mapBg} />
      </div>

      {/* Header overlay */}
      <div style={{
        position: 'absolute', top: 54, left: 0, right: 0, zIndex: 5,
        padding: '10px 20px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      }}>
        <div>
          <div style={{
            fontSize: 10.5, fontFamily: "'Manrope', sans-serif",
            letterSpacing: 1.4, color: theme.muted, textTransform: 'uppercase',
          }}>Mié · 20 Mayo</div>
          <div style={{
            fontSize: 26, fontWeight: 700, marginTop: 2, letterSpacing: -0.6,
            color: theme.ink, fontFamily: "'Montserrat', sans-serif",
          }}>Hola, Abigail</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={iconBtn(theme)} aria-label="Buscar">
            <Icon name="search" size={17}/>
          </button>
          <button style={iconBtn(theme)} aria-label="Notificaciones">
            <Icon name="bell" size={17}/>
          </button>
        </div>
      </div>

      {/* Left route timeline */}
      <div style={{
        position: 'absolute', left: 16, top: 130,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, zIndex: 4,
      }}>
        {stops.map((s, i) => (
          <React.Fragment key={s.id}>
            <div style={{
              width: 26, height: 26, borderRadius: 13,
              background: s.status === 'done' ? theme.ink
                : s.status === 'current' ? theme.accent
                : theme.surface,
              border: s.status === 'next' ? `1.5px solid ${theme.ink}` : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: s.status === 'done' ? theme.canvas : theme.ink,
              fontSize: 11, fontWeight: 700, fontFamily: "'Manrope', sans-serif",
              boxShadow: s.status === 'current' ? `0 0 0 5px ${theme.accent}55` : '0 2px 6px rgba(0,0,0,0.10)',
            }}>
              {s.status === 'done' ? <Icon name="check" size={13} strokeWidth={3}/> : i + 1}
            </div>
            {i < stops.length - 1 && (
              <div style={{
                width: 2, height: 18,
                background: s.status === 'done'
                  ? theme.ink
                  : `repeating-linear-gradient(180deg, ${theme.ink} 0 3px, transparent 3px 6px)`,
                opacity: s.status === 'done' ? 1 : 0.45,
              }}/>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Right FABs */}
      <div style={{
        position: 'absolute', right: 16, top: 130,
        display: 'flex', flexDirection: 'column', gap: 8, zIndex: 4,
      }}>
        <button style={iconBtn(theme)}><Icon name="plus"  size={16}/></button>
        <button style={iconBtn(theme)}><Icon name="minus" size={16}/></button>
        <div style={{ height: 6 }}/>
        <button style={iconBtn(theme, true)}><Icon name="locate-fixed" size={16}/></button>
        <button style={iconBtn(theme)}><Icon name="layers" size={16}/></button>
      </div>

      {/* Bottom cards */}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 50, zIndex: 5 }}>
        <ProgressCard theme={theme}/>
        <NextStopCard theme={theme}/>
      </div>
    </SectionShell>
  );
}

function ProgressCard({ theme }) {
  return (
    <div style={{
      background: theme.surface, borderRadius: 16,
      padding: '12px 14px', marginBottom: 10,
      boxShadow: '0 8px 22px rgba(0,0,0,0.10)',
      border: `1px solid ${theme.border}`,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 8,
      }}>
        <span style={{
          fontSize: 10.5, fontFamily: "'Manrope', sans-serif",
          letterSpacing: 1.2, color: theme.muted, textTransform: 'uppercase',
          display: 'inline-flex', alignItems: 'center', gap: 6,
        }}>
          <Icon name="route" size={12}/> Ruta · 2 de 5 completas
        </span>
        <span style={{
          fontSize: 11, fontFamily: "'Manrope', sans-serif",
          color: theme.ink, fontWeight: 700,
        }}>40%</span>
      </div>
      <div style={{ height: 6, background: theme.border, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: '40%', height: '100%', background: theme.accent, borderRadius: 3 }}/>
      </div>
    </div>
  );
}

function NextStopCard({ theme }) {
  return (
    <div style={{
      background: theme.ink, color: theme.canvas, borderRadius: 22,
      padding: 18, position: 'relative', overflow: 'hidden',
      boxShadow: '0 18px 40px rgba(0,0,0,0.22)',
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
        marginBottom: 12,
      }}>
        <Pill bg={theme.accent} color={theme.ink}>
          <Icon name="map-pin" size={11}/> Próxima parada
        </Pill>
        <div style={{
          fontSize: 11, fontFamily: "'Manrope', sans-serif",
          opacity: 0.55, letterSpacing: 1,
        }}>#A-4821</div>
      </div>
      <div style={{
        fontSize: 22, fontWeight: 700, letterSpacing: -0.4, lineHeight: 1.15,
      }}>10 Calle Morelos</div>
      <div style={{ fontSize: 12.5, opacity: 0.6, marginTop: 2 }}>
        Col. Centro · Mariana López · 1.2 kg
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, marginTop: 14,
        paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.1)',
      }}>
        <Stat label="ETA"       value="4 min"/>
        <Stat label="Distancia" value="1.8 km"/>
        <button style={{
          background: theme.accent, color: theme.ink, border: 'none',
          padding: '10px 14px', borderRadius: 14,
          fontSize: 13, fontWeight: 700, letterSpacing: -0.2,
          display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
          fontFamily: "'Manrope', sans-serif",
        }}>
          Navegar
          <Icon name="navigation" size={13} strokeWidth={2.4}/>
        </button>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div style={{ flex: 1 }}>
      <div style={{
        fontSize: 9.5, opacity: 0.5, letterSpacing: 1,
        textTransform: 'uppercase', fontFamily: "'Manrope', sans-serif",
      }}>{label}</div>
      <div style={{
        fontSize: 17, fontWeight: 700, marginTop: 1,
        fontFamily: "'Manrope', sans-serif",
      }}>{value}</div>
    </div>
  );
}

// Placeholder SVG del mapa — sustituir por react-native-maps en Expo.
function MapSVG({ accent, muted, bg }) {
  return (
    <svg viewBox="0 0 390 844" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
      <defs>
        <pattern id="grid" width="22" height="22" patternUnits="userSpaceOnUse">
          <path d="M22 0H0V22" fill="none" stroke={muted} strokeWidth="0.5" opacity="0.4"/>
        </pattern>
      </defs>
      <rect width="390" height="844" fill={bg}/>
      <rect width="390" height="844" fill="url(#grid)"/>
      <g stroke={muted} strokeWidth="14" fill="none" strokeLinecap="round" opacity="0.5">
        <path d="M-20 220 Q150 200 230 280 T 440 320"/>
        <path d="M 60 -20 Q 80 200 200 380 T 280 700"/>
        <path d="M 0 600 Q 200 580 300 640 T 440 700"/>
        <path d="M 320 0 L 240 220 L 380 460"/>
      </g>
      <path d="M 90 780 Q 140 680 130 580 Q 120 460 200 380 Q 270 300 250 220 Q 230 140 130 110"
            stroke={accent} strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M 130 110 Q 220 70 320 90"
            stroke={accent} strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray="2 8" opacity="0.55"/>
      <g transform="translate(130 110)"><circle r="14" fill="#1a1a1a"/><circle r="6" fill={accent}/></g>
      <g transform="translate(200 380)"><circle r="20" fill="#fff" stroke="#1a1a1a" strokeWidth="2"/>
        <path d="M-6 4 L0 -8 L6 4 L0 1 Z" fill="#1a1a1a"/></g>
      <g transform="translate(90 780)"><circle r="11" fill={accent}/><circle r="4" fill="#1a1a1a"/></g>
    </svg>
  );
}
