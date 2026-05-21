/**
 * ScannerOverlay - Overlay desde abajo (fondo navy)
 * Placeholder: "No disponible en Expo Go"
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import { X, ScanLine } from 'lucide-react-native';
import { theme, FONTS, FONT_SIZES, SPACING, RADIUS } from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ScannerOverlay({ visible, onClose }) {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 20,
        stiffness: 150,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <View style={styles.backdrop}>
      <TouchableOpacity
        style={styles.backdropTouchable}
        activeOpacity={1}
        onPress={onClose}
      />

      <Animated.View
        style={[
          styles.overlay,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Escáner de cajas</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={theme.surface} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <ScanLine size={64} color={theme.accent} strokeWidth={1.5} />
          </View>

          <Text style={styles.message}>No disponible en Expo Go</Text>

          <Text style={styles.description}>
            El escáner de cajas requiere acceso a la cámara con funcionalidades avanzadas.
            {'\n\n'}
            Para usar esta función, necesitas compilar la app con un Custom Development Client.
          </Text>

          <TouchableOpacity style={styles.button} onPress={onClose} activeOpacity={0.8}>
            <Text style={styles.buttonText}>Entendido</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    zIndex: 200,
  },
  backdropTouchable: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0E1116', // Navy oscuro
    borderTopLeftRadius: RADIUS.xxl,
    borderTopRightRadius: RADIUS.xxl,
    maxHeight: SCREEN_HEIGHT * 0.85,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: SPACING.xxl,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZES.xl,
    color: theme.surface,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: SPACING.xxxl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 120, 73, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  message: {
    fontFamily: FONTS.displayBlack,
    fontSize: FONT_SIZES.xxl,
    color: theme.surface,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  description: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.base,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: SPACING.xxxl,
  },
  button: {
    backgroundColor: theme.accent,
    paddingHorizontal: SPACING.xxxl,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.md,
  },
  buttonText: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.base,
    color: theme.surface,
  },
});
