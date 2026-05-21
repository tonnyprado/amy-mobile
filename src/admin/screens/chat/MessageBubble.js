/**
 * MessageBubble - Burbuja de mensaje
 * 4 tipos: system, them, me, announcement
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check, Megaphone } from 'lucide-react-native';
import { theme, FONTS, FONT_SIZES, SPACING, RADIUS } from '../../theme';

export default function MessageBubble({ message }) {
  const { type, text, time, read } = message;

  // System message (centered, gray)
  if (type === 'system') {
    return (
      <View style={styles.systemContainer}>
        <View style={styles.systemBubble}>
          <Text style={styles.systemText}>{text}</Text>
        </View>
      </View>
    );
  }

  // Announcement message (yellow with megaphone)
  if (type === 'announcement') {
    return (
      <View style={styles.announcementContainer}>
        <View style={styles.announcementBubble}>
          <View style={styles.announcementHeader}>
            <View style={styles.megaphoneIcon}>
              <Megaphone size={14} color="#8B5A00" strokeWidth={2.2} />
            </View>
            <Text style={styles.announcementLabel}>ANUNCIO</Text>
          </View>
          <Text style={styles.announcementText}>{text}</Text>
          {time && <Text style={styles.announcementTime}>{time}</Text>}
        </View>
      </View>
    );
  }

  // Them message (left, gray background)
  if (type === 'them') {
    return (
      <View style={styles.themContainer}>
        <View style={styles.themBubble}>
          <Text style={styles.themText}>{text}</Text>
          {time && <Text style={styles.themTime}>{time}</Text>}
        </View>
      </View>
    );
  }

  // Me message (right, blue background, checkmark)
  if (type === 'me') {
    return (
      <View style={styles.meContainer}>
        <View style={styles.meBubble}>
          <Text style={styles.meText}>{text}</Text>
          <View style={styles.meFooter}>
            {time && <Text style={styles.meTime}>{time}</Text>}
            <Check
              size={14}
              color={read ? theme.infoFg : 'rgba(255, 255, 255, 0.6)'}
              strokeWidth={2.5}
            />
          </View>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  // System message styles
  systemContainer: {
    alignItems: 'center',
    marginVertical: SPACING.md,
  },
  systemBubble: {
    backgroundColor: theme.canvas,
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  systemText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.xs,
    color: theme.muted,
    textAlign: 'center',
  },

  // Announcement message styles
  announcementContainer: {
    marginVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  announcementBubble: {
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#F5D547',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
  },
  announcementHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  megaphoneIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFE999',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.xs,
  },
  announcementLabel: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.xs,
    color: '#8B5A00',
    letterSpacing: 0.8,
  },
  announcementText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: '#5C4A00',
    lineHeight: 20,
  },
  announcementTime: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.xs,
    color: '#8B7000',
    marginTop: SPACING.xs,
  },

  // Them message styles (left-aligned)
  themContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  themBubble: {
    backgroundColor: theme.canvas,
    borderRadius: RADIUS.md,
    borderBottomLeftRadius: 4,
    padding: SPACING.md,
    maxWidth: '75%',
  },
  themText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: theme.ink,
    lineHeight: 20,
  },
  themTime: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.xs,
    color: theme.muted,
    marginTop: 4,
  },

  // Me message styles (right-aligned, blue)
  meContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: SPACING.xs,
    paddingHorizontal: SPACING.md,
  },
  meBubble: {
    backgroundColor: theme.infoFg,
    borderRadius: RADIUS.md,
    borderBottomRightRadius: 4,
    padding: SPACING.md,
    maxWidth: '75%',
  },
  meText: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: theme.surface,
    lineHeight: 20,
  },
  meFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 4,
    gap: 4,
  },
  meTime: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.xs,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
