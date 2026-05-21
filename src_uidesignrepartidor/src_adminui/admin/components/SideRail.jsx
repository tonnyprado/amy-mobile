// src/admin/components/SideRail.jsx
// Indicador de puntos (scroll snap vertical entre pantallas).
// Tap para saltar a una sección.

import React from 'react';

export default function SideRail({ sections, activeSection, onGoTo, hidden, dark }) {
  return (
    <div className={`rail ${dark ? 'dark' : ''}`} style={{
      opacity: hidden ? 0 : 1,
      transition: 'opacity 0.2s',
      pointerEvents: hidden ? 'none' : 'auto',
    }}>
      {sections.map((s, i) => (
        <button key={s.id} onClick={() => onGoTo(i)} aria-label={s.label}>
          <span className={`dot ${activeSection === i ? 'active' : ''}`}/>
          <span className="label">{s.label}</span>
        </button>
      ))}
    </div>
  );
}
