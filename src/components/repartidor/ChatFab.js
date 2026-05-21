// src/components/repartidor/ChatFab.js
// Botón flotante de chat con animación de pulso

import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import Icon from './Icon';
import { FONTS } from '../../theme/repartidorTheme';

export default function ChatFab({ theme, onAccentBg, unreadCount = 0, onPress, hidden }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1100,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  if (hidden) return null;

  const fabBg = onAccentBg ? theme.ink : theme.accent;
  const fabFg = onAccentBg ? theme.canvas : theme.ink;
  const badgeBg = onAccentBg ? theme.accent : theme.ink;
  const badgeFg = onAccentBg ? theme.ink : theme.canvas;

  return (
    <View style={styles.container}>
      {/* Pulse halo */}
      <Animated.View
        style={[
          styles.pulse,
          {
            backgroundColor: fabBg,
            opacity: pulseAnim.interpolate({
              inputRange: [1, 1.3],
              outputRange: [0.5, 0],
            }),
            transform: [{ scale: pulseAnim }],
          },
        ]}
      />

      {/* FAB Button */}
      <TouchableOpacity
        style={[
          styles.fab,
          {
            backgroundColor: fabBg,
            shadowColor: onAccentBg ? '#000' : fabBg,
          },
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Icon name="message-circle" size={24} color={fabFg} strokeWidth={2.2} />

        {/* Badge */}
        {unreadCount > 0 && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: badgeBg,
                borderColor: fabBg,
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: badgeFg }]}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    zIndex: 100,
  },
  pulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    top: 0,
    left: 0,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.18,
    shadowRadius: 32,
    elevation: 10,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: FONTS.bodyBold,
  },
});
