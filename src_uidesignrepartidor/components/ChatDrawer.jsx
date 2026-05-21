// src/components/ChatDrawer.jsx
// Drawer que entra desde la derecha. Soporta:
//   - Tap al FAB → abre
//   - Swipe horizontal (drag) → abre / cierra en tiempo real
//   - Tap en scrim oscuro → cierra
//
// En RN: usa `react-native-gesture-handler` + `react-native-reanimated`
// (PanGestureHandler con translateX animado) o `react-native-bottom-sheet`
// adaptado para horizontal, o un Stack Navigator con animación de slide.

import React from 'react';

export default function ChatDrawer({
  open, transform, scrimOpacity, dragging, theme,
  onScrimClick, children,
}) {
  return (
    <>
      <div
        className={`drawer-scrim ${open ? 'open' : ''}`}
        style={{
          opacity: scrimOpacity,
          pointerEvents: open ? 'auto' : 'none',
        }}
        onClick={onScrimClick}
      />
      <div
        className={`drawer ${dragging ? 'dragging' : ''} ${open ? 'open' : ''}`}
        style={{ background: theme.canvas, transform }}
      >
        <div className="drawer-handle"/>
        {children}
      </div>
    </>
  );
}
