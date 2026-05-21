// src/screens/auth/components/LottieWithFallback.js
// Wrapper de animaciones con fallback a placeholder

import React from 'react';
import { View, Text } from 'react-native';
import LottieView from 'lottie-react-native';

// Si tienes las animaciones descargadas como .json, colócalas en assets/lottie/
// y descomenta las siguientes líneas:
// const loginAnimation = require('../../../assets/lottie/login.json');
// const slide1Animation = require('../../../assets/lottie/slide1.json');
// const slide2Animation = require('../../../assets/lottie/slide2.json');
// const slide3Animation = require('../../../assets/lottie/slide3.json');

export default function Lottie({ size = 240, src, style, animationType = 'login' }) {
  const sizeStyle = typeof size === 'number' ? { width: size, height: size } : {};

  // Placeholder temporal - reemplazar cuando tengas las animaciones .json
  const useAnimation = false; // Cambiar a true cuando tengas las animaciones

  if (useAnimation) {
    // Si tienes las animaciones locales, usa esto:
    // const animation = animationType === 'login' ? loginAnimation : slide1Animation;
    // return (
    //   <View style={[sizeStyle, style]}>
    //     <LottieView
    //       source={animation}
    //       autoPlay
    //       loop
    //       style={{ width: '100%', height: '100%' }}
    //     />
    //   </View>
    // );
  }

  // Placeholder con emoji
  const emoji = animationType === 'login' ? '🚚' : ['📦', '🗺️', '👥'][Math.floor(Math.random() * 3)];

  return (
    <View style={[sizeStyle, style, { alignItems: 'center', justifyContent: 'center' }]}>
      <View
        style={{
          width: '80%',
          height: '80%',
          borderRadius: 999,
          backgroundColor: 'rgba(255, 120, 73, 0.1)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ fontSize: size === '100%' ? 80 : size * 0.3 }}>{emoji}</Text>
      </View>
    </View>
  );
}
