/**
 * IncidenciaRow - Fila con barra animada para cada tipo de incidencia
 * Muestra icono, label, valor y barra de progreso
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { theme, FONTS, FONT_SIZES, SPACING } from '../../theme';
import * as Icons from 'lucide-react-native';

const iconMap = {
  'door-closed': 'DoorClosed',
  'map-pin-off': 'MapPinOff',
  'alert-octagon': 'AlertOctagon',
  'repeat-2': 'Repeat2',
  'circle-x': 'CircleX',
  'circle-help': 'CircleHelp',
};

export default function IncidenciaRow({ icon, label, value, maxValue, delay = 0 }) {
  const barWidth = useRef(new Animated.Value(0)).current;
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  useEffect(() => {
    // Animar barra con delay
    Animated.timing(barWidth, {
      toValue: percentage,
      duration: 1400,
      delay,
      useNativeDriver: false,
    }).start();
  }, [percentage, delay]);

  const IconComponent = Icons[iconMap[icon]] || Icons.Circle;

  return (
    <View style={styles.row}>
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          <IconComponent size={16} color={theme.surface} strokeWidth={2.2} />
          <Text style={styles.label}>{label}</Text>
        </View>
        <Text style={styles.value}>{value}</Text>
      </View>

      {/* Barra animada */}
      <View style={styles.barContainer}>
        <Animated.View
          style={[
            styles.bar,
            {
              width: barWidth.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  label: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: theme.surface,
  },
  value: {
    fontFamily: FONTS.displayBlack,
    fontSize: FONT_SIZES.lg,
    color: theme.surface,
  },
  barContainer: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: theme.accent,
    borderRadius: 3,
  },
});
