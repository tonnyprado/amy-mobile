// src/admin/components/SectionShell.jsx
// Pantalla con padding para status bar (top) y home indicator (bottom).
// En Expo usa SafeAreaView.

import React from 'react';
import { theme } from '../theme';

export default function SectionShell({ children, bg, label }) {
  return (
    <section data-screen-label={label} style={{
      minHeight: '100%', height: '100%', width: '100%',
      background: bg, color: theme.ink, position: 'relative',
      display: 'flex', flexDirection: 'column',
      paddingTop: 56, paddingBottom: 30, overflow: 'hidden',
    }}>{children}</section>
  );
}
