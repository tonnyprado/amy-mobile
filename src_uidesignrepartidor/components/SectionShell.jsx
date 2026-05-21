// src/components/SectionShell.jsx
// Contenedor de pantalla con padding para status bar + home indicator.
// En Expo usa SafeAreaView de react-native-safe-area-context.

import React from 'react';

export default function SectionShell({ children, bg, label, theme, padded = true }) {
  return (
    <section
      data-screen-label={label}
      style={{
        minHeight: '100%', height: '100%', width: '100%',
        background: bg, color: theme.ink, position: 'relative',
        display: 'flex', flexDirection: 'column',
        paddingTop: padded ? 56 : 0,    // status bar (iOS = ~54px)
        paddingBottom: 30,              // home indicator
        overflow: 'hidden',
      }}
    >{children}</section>
  );
}
