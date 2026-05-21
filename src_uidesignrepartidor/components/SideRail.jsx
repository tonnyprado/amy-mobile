// src/components/SideRail.jsx
// Indicador de puntos a la derecha (scroll snap entre secciones).
// Tap a un punto navega a esa sección.
//
// En RN: en lugar de scroll-snap CSS usa FlatList con pagingEnabled
// o react-native-snap-carousel, y este componente solo refleja el índice.

import React from 'react';

export default function SideRail({ sections, activeSection, onGoTo, hidden, dark }) {
  return (
    <div
      className={`rail ${dark ? 'dark' : ''}`}
      style={{
        opacity: hidden ? 0 : 1,
        transition: 'opacity 0.2s',
        pointerEvents: hidden ? 'none' : 'auto',
      }}
    >
      {sections.map((s, i) => (
        <button key={s.id} onClick={() => onGoTo(i)} aria-label={s.label}>
          <span className={`dot ${activeSection === i ? 'active' : ''}`}/>
          <span className="label">{s.label}</span>
        </button>
      ))}
    </div>
  );
}
