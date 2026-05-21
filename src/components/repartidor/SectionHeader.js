// src/components/repartidor/SectionHeader.js
// Cabecera de pantalla con kicker + título + subtítulo + slot derecho

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS } from '../../theme/repartidorTheme';

export default function SectionHeader({ kicker, title, sub, theme, right, dark }) {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Text
          style={[
            styles.kicker,
            { color: dark ? 'rgba(255,255,255,0.5)' : theme.muted },
          ]}
        >
          {kicker}
        </Text>
        <Text
          style={[
            styles.title,
            { color: dark ? theme.canvas : theme.ink },
          ]}
        >
          {title}
        </Text>
        {sub && (
          <Text
            style={[
              styles.subtitle,
              { color: dark ? 'rgba(255,255,255,0.7)' : theme.muted },
            ]}
          >
            {sub}
          </Text>
        )}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 6,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: {
    flex: 1,
  },
  kicker: {
    fontSize: 10.5,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.8,
    lineHeight: 29,
    marginTop: 2,
    fontFamily: FONTS.display,
  },
  subtitle: {
    fontSize: 12.5,
    marginTop: 4,
    maxWidth: 280,
  },
});
