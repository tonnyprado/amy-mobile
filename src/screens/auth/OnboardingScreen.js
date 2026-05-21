// src/screens/auth/OnboardingScreen.js
// Una slide del onboarding. Recibe `slideIndex` y se vuelve a montar cada
// vez que cambia (key) para disparar la animación de entrada.

import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import Animated, { FadeInRight } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { SLIDES, LOTTIE_SLIDES, LOTTIE_LOGIN } from './slides.js';
import TruckMark from './components/TruckMark.js';
import Lottie from './components/Lottie.js';
import SoftBackdrop from './components/SoftBackdrop.js';

export default function OnboardingScreen({
  theme,
  slideIndex,
  total,
  onNext,
  onBack,
  onSkip,
  backdrop = 'circle',
}) {
  const slide = SLIDES[slideIndex];
  const canBack = slideIndex > 0;
  const isLast = slideIndex === total - 1;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: theme.canvas,
        position: 'relative',
      }}
    >
      <SoftBackdrop theme={theme} variant={backdrop} />

      {/* Top bar: back/brand + skip */}
      <View
        style={{
          position: 'relative',
          zIndex: 2,
          paddingTop: 24,
          paddingHorizontal: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 88,
        }}
      >
        {canBack ? (
          <TouchableOpacity
            onPress={onBack}
            accessibilityLabel="Atrás"
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              backgroundColor: 'rgba(0,0,0,0.04)',
              borderWidth: 1,
              borderColor: theme.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <Path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke={theme.ink}
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TruckMark size={32} theme={theme} />
            <Text
              style={{
                fontFamily: 'Montserrat_800ExtraBold',
                fontSize: 15,
                color: theme.ink,
                letterSpacing: -0.2,
              }}
            >
              AMY
            </Text>
          </View>
        )}
        {!isLast ? (
          <TouchableOpacity onPress={onSkip} style={{ padding: 4 }}>
            <Text
              style={{
                fontFamily: 'Manrope_600SemiBold',
                fontSize: 14,
                color: theme.muted,
              }}
            >
              Saltar
            </Text>
          </TouchableOpacity>
        ) : (
          <View />
        )}
      </View>

      {/* Hero (Lottie) + copy — animado al cambiar de slide */}
      <View
        style={{
          flex: 1,
          minHeight: 0,
          position: 'relative',
          zIndex: 2,
        }}
      >
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 12,
            paddingTop: 12,
            minHeight: 0,
          }}
        >
          <Animated.View
            key={`lottie-${slideIndex}`}
            entering={FadeInRight.duration(420)}
            style={{
              width: '100%',
              maxWidth: 320,
              aspectRatio: 1,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: '8%',
                left: '8%',
                right: '8%',
                bottom: '8%',
                borderRadius: 1000,
                backgroundColor: theme.accentSoft,
              }}
            />
            <Lottie
              key={`anim-${slideIndex}`}
              size="100%"
              src={LOTTIE_SLIDES[slideIndex] || LOTTIE_LOGIN}
              animationType={`slide${slideIndex + 1}`}
              style={{ position: 'relative', zIndex: 1 }}
            />
          </Animated.View>
        </View>

        <Animated.View
          key={`text-${slideIndex}`}
          entering={FadeInRight.duration(420).delay(100)}
          style={{ paddingHorizontal: 28 }}
        >
          <Text
            style={{
              fontFamily: 'Montserrat_800ExtraBold',
              fontSize: 34,
              lineHeight: 37,
              color: theme.ink,
              letterSpacing: -0.8,
            }}
          >
            {slide.title}
          </Text>
          <Text
            style={{
              marginTop: 14,
              fontFamily: 'Manrope_400Regular',
              fontSize: 15,
              lineHeight: 22.5,
              color: theme.muted,
            }}
          >
            {slide.body}
          </Text>
        </Animated.View>
      </View>

      {/* Dots + CTA */}
      <View
        style={{
          position: 'relative',
          zIndex: 2,
          paddingTop: 28,
          paddingBottom: 44,
          paddingHorizontal: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}
      >
        <View style={{ flexDirection: 'row', gap: 7 }}>
          {Array.from({ length: total }).map((_, i) => (
            <Animated.View
              key={i}
              style={{
                width: i === slideIndex ? 24 : 7,
                height: 7,
                borderRadius: 4,
                backgroundColor:
                  i === slideIndex ? theme.accent : 'rgba(27,30,54,0.18)',
              }}
            />
          ))}
        </View>

        {isLast ? (
          <TouchableOpacity
            onPress={onNext}
            style={{
              flex: 1,
              height: 52,
              borderRadius: 14,
              backgroundColor: theme.accent,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Text
              style={{
                fontFamily: 'Montserrat_700Bold',
                fontSize: 15,
                color: '#fff',
                letterSpacing: -0.1,
              }}
            >
              {slide.cta}
            </Text>
            <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 12h14M13 5l7 7-7 7"
                stroke="white"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={onNext}
            accessibilityLabel="Siguiente"
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: theme.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <Path
                d="M5 12h14M13 5l7 7-7 7"
                stroke="white"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}
