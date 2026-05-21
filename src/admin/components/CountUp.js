/**
 * CountUp - Número que cuenta de 0 → valor con animación
 * Usado en estadísticas para efecto visual
 */

import React, { useEffect, useRef } from 'react';
import { Text, Animated, Easing } from 'react-native';

export default function CountUp({ value, duration = 1200, style, suffix = '' }) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const displayValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Reset y animar
    animatedValue.setValue(0);
    displayValue.setValue(0);

    const listener = animatedValue.addListener(({ value: v }) => {
      displayValue.setValue(v);
    });

    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false, // Necesario para interpolación de números
    }).start();

    return () => {
      animatedValue.removeListener(listener);
    };
  }, [value, duration]);

  return (
    <Animated.Text style={style}>
      {displayValue.__getValue().toFixed(0)}
      {suffix}
    </Animated.Text>
  );
}
