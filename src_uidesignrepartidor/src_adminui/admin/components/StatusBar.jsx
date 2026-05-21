// src/admin/components/StatusBar.jsx
// Solo para la maqueta web (frame iPhone). En RN usa expo-status-bar.

import React from 'react';

export default function StatusBar({ color = '#000' }) {
  return (
    <div className="status-bar" style={{ color }}>
      <span className="t" style={{ color }}>9:41</span>
      <div className="icons">
        <svg width="18" height="12" viewBox="0 0 18 12" fill={color}>
          <rect x="0" y="7.5" width="3" height="4.5" rx="0.6"/>
          <rect x="4.5" y="5" width="3" height="7" rx="0.6"/>
          <rect x="9" y="2.5" width="3" height="9.5" rx="0.6"/>
          <rect x="13.5" y="0" width="3" height="12" rx="0.6"/>
        </svg>
        <svg width="25" height="12" viewBox="0 0 27 13">
          <rect x="0.5" y="0.5" width="23" height="12" rx="3.5" stroke={color} strokeOpacity="0.45" fill="none"/>
          <rect x="2" y="2" width="20" height="9" rx="2" fill={color}/>
        </svg>
      </div>
    </div>
  );
}
