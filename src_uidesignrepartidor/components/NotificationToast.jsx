// src/components/NotificationToast.jsx
// Burbuja de notificación que entra desde arriba cuando llega un mensaje
// y el chat está cerrado. Tap → abre la conversación.
//
// RN: usa Animated.timing en translateY + opacity.

import React from 'react';

export default function NotificationToast({ toast, theme, onPress }) {
  if (!toast) return null;
  return (
    <div
      className={`toast ${toast.shown ? 'show' : ''}`}
      onClick={onPress}
    >
      <div className="avatar" style={{ background: toast.color }}>{toast.tag}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="name">
          {toast.name}
          <span style={{
            width: 6, height: 6, borderRadius: 4, background: theme.accent,
          }}/>
        </div>
        <div className="msg">{toast.message}</div>
      </div>
      <div className="time">ahora</div>
    </div>
  );
}
