/**
 * NotificationToast - Burbuja de notificación entrante desde arriba
 * Aparece cuando llega un mensaje nuevo de un repartidor
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { theme, FONTS, FONT_SIZES, RADIUS, SHADOWS } from '../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function NotificationToast({ toast, onPress, onDismiss }) {
  const translateY = useRef(new Animated.Value(-140)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast && toast.shown) {
      // Slide in
      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          damping: 18,
          stiffness: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (toast && !toast.shown) {
      // Slide out
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: -140,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [toast?.shown]);

  if (!toast) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          transform: [{ translateY }],
          opacity,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.toastContent}
        onPress={onPress}
        activeOpacity={0.9}
      >
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: toast.color }]}>
          <Text style={styles.avatarText}>{toast.tag}</Text>
        </View>

        {/* Content */}
        <View style={styles.textContainer}>
          <Text style={styles.name} numberOfLines={1}>
            {toast.name}
          </Text>
          <Text style={styles.message} numberOfLines={2}>
            {toast.message}
          </Text>
        </View>

        {/* Close button */}
        <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
          <Text style={styles.closeText}>×</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 64, // Debajo del status bar
    left: 18,
    right: 18,
    zIndex: 999,
  },
  toastContent: {
    backgroundColor: theme.surface,
    borderRadius: RADIUS.lg,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    ...SHADOWS.cardHeavy,
    borderWidth: 1,
    borderColor: theme.border,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.md,
    color: theme.ink,
  },
  textContainer: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.base,
    color: theme.ink,
    marginBottom: 2,
  },
  message: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: theme.muted,
    lineHeight: 18,
  },
  closeButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    fontFamily: FONTS.body,
    fontSize: 28,
    color: theme.muted,
    lineHeight: 28,
  },
});
