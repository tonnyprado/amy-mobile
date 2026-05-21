/**
 * Splash - Pantalla de carga Pinterest-style
 * Se muestra al iniciar la app (primer mount) y se desvanece a 1.7s
 * Logo pulsa con escala 1 → 1.08
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { theme, FONTS, FONT_SIZES } from '../theme';

const { width, height } = Dimensions.get('window');

export default function Splash({ hidden, onHidden }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Logo pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.08,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    if (hidden) {
      // Fade out
      Animated.timing(opacity, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }).start(() => {
        if (onHidden) onHidden();
      });
    }
  }, [hidden]);

  if (hidden && opacity.__getValue() === 0) return null;

  return (
    <Animated.View style={[styles.splash, { opacity }]}>
      <Animated.View style={[styles.logoContainer, { transform: [{ scale }] }]}>
        <Text style={styles.logo}>AMY</Text>
        <Text style={styles.subtitle}>Panel Administrativo</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splash: {
    position: 'absolute',
    top: 0,
    left: 0,
    width,
    height,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    fontFamily: FONTS.displayBlack,
    fontSize: 56,
    color: theme.accent,
    letterSpacing: 4,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: FONTS.bodySemibold,
    fontSize: FONT_SIZES.base,
    color: theme.muted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
