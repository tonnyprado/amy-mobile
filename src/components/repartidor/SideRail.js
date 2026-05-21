// src/components/repartidor/SideRail.js
// Indicador de puntos a la derecha (navegación entre secciones)

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { FONTS } from '../../theme/repartidorTheme';

export default function SideRail({ sections, activeSection, onGoTo, hidden, dark, theme }) {
  if (hidden) return null;

  return (
    <View style={styles.rail}>
      {sections.map((s, i) => {
        const isActive = activeSection === i;
        const isDarkSection = i === 2; // Stats screen has dark background

        return (
          <TouchableOpacity
            key={s.id}
            style={styles.railButton}
            onPress={() => onGoTo(i)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: isActive
                    ? (isDarkSection ? theme.ink : theme.accent)
                    : 'transparent',
                  borderColor: isDarkSection ? theme.ink : theme.ink,
                  borderWidth: isActive ? 0 : 1.5,
                },
              ]}
            />
            {isActive && (
              <Text
                style={[
                  styles.label,
                  {
                    color: isDarkSection ? theme.ink : theme.ink,
                  },
                ]}
              >
                {s.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  rail: {
    position: 'absolute',
    right: 8,
    top: '40%',
    transform: [{ translateY: -50 }],
    zIndex: 10,
    gap: 12,
  },
  railButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: FONTS.bodyBold,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
});
