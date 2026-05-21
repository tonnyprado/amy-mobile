// src/admin/components/AdminBadge.jsx
// Badge consistente que aparece en el header de cada pantalla del Admin.
// Diferencia visualmente la app del repartidor.

import React from 'react';
import Icon from './Icon';
import { theme } from '../theme';

export default function AdminBadge() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 8px', borderRadius: 6,
      background: theme.ink, color: theme.accent,
      fontSize: 9, fontWeight: 800, letterSpacing: 1.4,
      fontFamily: "'Manrope', sans-serif",
      textTransform: 'uppercase',
    }}>
      <Icon name="shield" size={9} strokeWidth={3}/>
      PANEL ADMIN
    </span>
  );
}
