// src/admin/components/Splash.jsx
// Splash de carga estilo Pinterest. Se monta al abrir la app y se
// desvanece después de 1.7s. Configurar duración en el padre.
//
// RN: Usa Animated.View con scale loop (pulse) + opacity al final.

import React from 'react';
import Icon from './Icon';

export default function Splash({ hidden, brandName = 'Tu Marca', tag = 'Panel administrador' }) {
  return (
    <div className={`splash ${hidden ? 'hide' : ''}`}>
      <div className="splash-logo">
        <Icon name="package" size={44} strokeWidth={2.2}/>
      </div>
      <div className="splash-wordmark">{brandName}</div>
      <div className="splash-tag">{tag}</div>
    </div>
  );
}
