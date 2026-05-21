// src/components/repartidor/SectionShell.js
// Contenedor de pantalla con SafeArea

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SectionShell({ children, bg, label, theme, padded = true }) {
  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: bg },
      ]}
      edges={padded ? ['top', 'bottom'] : []}
    >
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
});
