// src/screens/auth/components/TruckMark.js
// Logo de Mendiola Logistics — square con gradiente del accent + ícono de camión.
// Se usa tanto en el onboarding como en el header del login.

import React from 'react';
import { View, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Circle } from 'react-native-svg';

export default function TruckMark({ size = 64, theme }) {
  const iconSize = size * 0.6;
  const borderRadius = size * 0.26;

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius,
        overflow: 'hidden',
        shadowColor: theme.accent,
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.4,
        shadowRadius: 22,
        elevation: 12,
      }}
    >
      <LinearGradient
        colors={[theme.accent, theme.accentDk]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={{
          width: '100%',
          height: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="none">
          <Path
            d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M15 18H9"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Path
            d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle
            cx="17"
            cy="18"
            r="2"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle
            cx="7"
            cy="18"
            r="2"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </LinearGradient>
    </View>
  );
}
