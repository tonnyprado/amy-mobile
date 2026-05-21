// src/screens/auth/components/Lottie.js
// Wrapper de animaciones usando lottie-react-native

import React, { useEffect, useRef, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import LottieView from 'lottie-react-native';

// Animaciones locales
const loginAnimation = require('../../../../assets/lottie/login.json');
const slide1Animation = require('../../../../assets/lottie/slide1.json');
const slide2Animation = require('../../../../assets/lottie/slide2.json');
const slide3Animation = require('../../../../assets/lottie/slide3.json');

const animations = {
  login: loginAnimation,
  slide1: slide1Animation,
  slide2: slide2Animation,
  slide3: slide3Animation,
};

export default function Lottie({ size = 240, src, animationType = 'login', style }) {
  const lottieRef = useRef(null);
  const [loading, setLoading] = useState(true);

  // Manejar tanto tamaños numéricos como porcentajes
  const sizeStyle = typeof size === 'number'
    ? { width: size, height: size }
    : { width: '100%', height: '100%', flex: 1 };

  // Determinar qué animación usar basado en el tipo o src
  let animation = animations[animationType];

  // Si src contiene un índice de slide, usar esa animación
  if (typeof src === 'string' && src.includes('lottie.host')) {
    const slideMatch = src.match(/slide(\d)/);
    if (slideMatch) {
      const slideNum = slideMatch[1];
      animation = animations[`slide${slideNum}`];
    }
  }

  useEffect(() => {
    // Reducir tiempo de loading
    const timer = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Forzar reproducción cuando cambia la animación
    if (lottieRef.current && !loading) {
      // Pequeño delay para asegurar que el componente esté montado
      setTimeout(() => {
        lottieRef.current?.reset();
        lottieRef.current?.play();
      }, 50);
    }
  }, [animation, loading]);

  return (
    <View style={[sizeStyle, style, { justifyContent: 'center', alignItems: 'center' }]}>
      {loading && (
        <ActivityIndicator size="large" color="#FF7849" style={{ position: 'absolute' }} />
      )}
      <LottieView
        ref={lottieRef}
        source={animation}
        autoPlay
        loop
        speed={1.5}
        hardwareAccelerationAndroid
        resizeMode="contain"
        style={{ width: '100%', height: '100%', opacity: loading ? 0 : 1 }}
      />
    </View>
  );
}
