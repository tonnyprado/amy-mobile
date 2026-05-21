/**
 * ChatFab - Botón flotante de chat con badge de no leídos
 * Color adaptativo según fondo (coral invierte a blanco)
 */

import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { MessageCircle } from 'lucide-react-native';
import { theme, FONTS, FONT_SIZES, SHADOWS } from '../theme';

export default function ChatFab({ onPress, unreadCount, isOnCoralBg = false }) {
  const bgColor = isOnCoralBg ? theme.surface : theme.ink;
  const iconColor = isOnCoralBg ? theme.ink : theme.surface;

  return (
    <TouchableOpacity
      style={[styles.fab, { backgroundColor: bgColor }, SHADOWS.fab]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <MessageCircle size={24} color={iconColor} strokeWidth={2.2} />
      {unreadCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 40,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: theme.dangerFg,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: theme.surface,
  },
  badgeText: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.xs,
    color: theme.surface,
  },
});
