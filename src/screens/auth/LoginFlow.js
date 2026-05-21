// src/screens/auth/LoginFlow.js
// Controlador: maneja el step entre onboarding y login.
// Llama a `onAuthenticated(user, password)` cuando el formulario se envía
// y resuelve OK — ese es tu punto de integración con el backend.

import React, { useState } from 'react';
import { View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SLIDES } from './slides.js';
import { THEMES, DEFAULT_PALETTE } from './theme.js';
import OnboardingScreen from './OnboardingScreen.js';
import NewLoginScreen from './NewLoginScreen.js';
import TestLoginScreen from './TestLoginScreen.js';

export default function LoginFlow({
  palette = DEFAULT_PALETTE,
  onboardingSlides = SLIDES.length,
  skipOnboarding = false,
  backdrop = 'circle',
  loginAnimSize = 260,
  onAuthenticated, // (user, password) => Promise resolved on success
}) {
  const theme = THEMES[palette] || THEMES[DEFAULT_PALETTE];
  const slides = skipOnboarding ? 0 : onboardingSlides;
  const [step, setStep] = useState(0);

  const onLogin = step >= slides;

  return (
    <View style={{ flex: 1, backgroundColor: theme.canvas }}>
      <StatusBar style="dark" />
      {!onLogin ? (
        <OnboardingScreen
          key="onboarding"
          theme={theme}
          slideIndex={step}
          total={slides}
          onNext={() => setStep((s) => s + 1)}
          onBack={() => setStep((s) => Math.max(0, s - 1))}
          onSkip={() => setStep(slides)}
          backdrop={backdrop}
        />
      ) : (
        <NewLoginScreen
          key="login"
          theme={theme}
          showBack={slides > 0}
          onBack={() => setStep(Math.max(0, slides - 1))}
          lottieSize={loginAnimSize}
          onSubmit={onAuthenticated}
        />
      )}
    </View>
  );
}
