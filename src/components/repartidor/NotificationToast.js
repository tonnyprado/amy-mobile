// src/components/repartidor/NotificationToast.js
// Burbuja de notificación que entra desde arriba

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FONTS } from '../../theme/repartidorTheme';

export default function NotificationToast({ toast, theme, onPress }) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (toast?.shown) {
      Animated.spring(translateY, {
        toValue: insets.top + 10,
        damping: 18,
        useNativeDriver: true,
      }).start();

      // Auto-dismiss after 5s
      const timeout = setTimeout(() => {
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start();
      }, 5000);

      return () => clearTimeout(timeout);
    } else {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [toast?.shown]);

  if (!toast) return null;

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: theme.surface,
          transform: [{ translateY }],
          shadowColor: toast.color || theme.ink,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.toastContent}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View
          style={[
            styles.avatar,
            { backgroundColor: toast.color || theme.accent },
          ]}
        >
          <Text style={[styles.avatarText, { color: theme.surface }]}>
            {toast.tag}
          </Text>
        </View>
        <View style={styles.toastBody}>
          <View style={styles.toastHeader}>
            <Text style={[styles.toastName, { color: theme.ink }]}>
              {toast.name}
            </Text>
            <View
              style={[
                styles.toastDot,
                { backgroundColor: theme.accent },
              ]}
            />
          </View>
          <Text
            style={[styles.toastMessage, { color: theme.muted }]}
            numberOfLines={1}
          >
            {toast.message}
          </Text>
        </View>
        <Text style={[styles.toastTime, { color: theme.muted }]}>
          ahora
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    top: 0,
    left: 20,
    right: 20,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 8,
    zIndex: 200,
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FONTS.bodyBold,
  },
  toastBody: {
    flex: 1,
    minWidth: 0,
  },
  toastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  toastName: {
    fontSize: 13,
    fontWeight: '700',
    fontFamily: FONTS.bodyBold,
  },
  toastDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  toastMessage: {
    fontSize: 12,
  },
  toastTime: {
    fontSize: 11,
  },
});
