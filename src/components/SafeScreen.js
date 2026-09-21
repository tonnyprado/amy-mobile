/**
 * SafeScreen Component
 *
 * Wrapper que combina SafeAreaView con estilos comunes de pantalla.
 * Maneja automáticamente las áreas seguras en iOS (notch, home indicator)
 * y Android (status bar, navigation bar).
 *
 * Uso:
 * <SafeScreen>
 *   <Text>Mi contenido</Text>
 * </SafeScreen>
 *
 * Con opciones:
 * <SafeScreen edges={['top', 'bottom']} style={{ backgroundColor: '#F5F5F5' }}>
 *   <Text>Mi contenido</Text>
 * </SafeScreen>
 */

import React from 'react';
import { StyleSheet, Platform, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SafeScreen = ({
  children,
  style,
  edges = ['top', 'bottom', 'left', 'right'],  // Bordes a proteger
  backgroundColor = '#FFFFFF',
  statusBarStyle = 'dark-content',  // 'dark-content' | 'light-content'
  statusBarColor = '#FFFFFF',  // Color del status bar en Android
  unsafe = false,  // Si true, no usa SafeAreaView (útil para pantallas con fondos custom)
  ...props
}) => {
  // Si unsafe=true, usar View normal en lugar de SafeAreaView
  const Container = unsafe ? View : SafeAreaView;

  return (
    <>
      {/* Status bar (solo visible en Android 6+) */}
      <StatusBar
        barStyle={statusBarStyle}
        backgroundColor={statusBarColor}
        translucent={Platform.OS === 'android'}
      />

      <Container
        edges={unsafe ? undefined : edges}
        style={[
          styles.container,
          { backgroundColor },
          style,
        ]}
        {...props}
      >
        {children}
      </Container>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default SafeScreen;
