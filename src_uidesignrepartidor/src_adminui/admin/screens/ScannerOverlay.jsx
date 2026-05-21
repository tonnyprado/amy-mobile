// src/admin/screens/ScannerOverlay.jsx
// Overlay full-screen oscuro que se desliza desde abajo.
// Estado placeholder hasta que se habilite Vision Camera.

import React from 'react';
import Icon from '../components/Icon';
import { theme } from '../theme';

export default function ScannerOverlay({ open, onClose }) {
  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 120,
      background: '#0F1A2E', color: '#fff',
      transform: open ? 'translateY(0%)' : 'translateY(100%)',
      transition: 'transform 0.42s cubic-bezier(0.22, 1, 0.36, 1)',
      display: 'flex', flexDirection: 'column',
      paddingTop: 56, paddingBottom: 30,
    }}>
      <div style={{
        padding: '6px 18px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <span style={{
          fontSize: 10, fontFamily: "'Manrope', sans-serif",
          letterSpacing: 1.4, opacity: 0.55, textTransform: 'uppercase',
        }}>Panel Admin · Escáner</span>
        <button onClick={onClose} aria-label="Cerrar" style={{
          width: 36, height: 36, borderRadius: 18,
          background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon name="x" size={17}/>
        </button>
      </div>

      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 28px', textAlign: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: 'rotate(-6deg)',
          }}><Icon name="package" size={28} color="#FF7849" strokeWidth={2}/></div>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transform: 'rotate(6deg)',
          }}><Icon name="camera" size={28} color="#7CEAA5" strokeWidth={2}/></div>
        </div>
        <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: -0.6, fontFamily: "'Montserrat', sans-serif" }}>
          Escáner de Cajas
        </div>
        <div style={{ fontSize: 14, opacity: 0.6, marginTop: 6 }}>No disponible en Expo Go</div>

        <div style={{
          marginTop: 28, padding: 16,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, width: '100%', textAlign: 'left',
        }}>
          <div style={{ fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>
            Esta funcionalidad requiere un <strong>Custom Development Client</strong> porque usa Vision Camera (OCR en tiempo real).
          </div>
          <div style={{
            fontSize: 11, fontFamily: "'Manrope', sans-serif",
            letterSpacing: 1.2, textTransform: 'uppercase', opacity: 0.55,
            marginTop: 14, marginBottom: 6,
          }}>Para habilitar</div>
          <pre style={{
            background: 'rgba(0,0,0,0.3)', borderRadius: 10,
            padding: '10px 12px', margin: 0,
            fontFamily: "'Manrope', monospace", fontSize: 12,
            color: '#7CEAA5', lineHeight: 1.5,
          }}>{`npx expo prebuild
npx expo run:ios`}</pre>
        </div>

        <button onClick={onClose} style={{
          marginTop: 22, padding: '10px 22px', borderRadius: 14,
          background: theme.accent, color: theme.ink, border: 'none',
          fontSize: 14, fontWeight: 700, cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontFamily: "'Montserrat', sans-serif",
        }}>
          <Icon name="arrow-left" size={14} strokeWidth={2.4}/> Volver
        </button>
      </div>
    </div>
  );
}
