// src/screens/auth/NewLoginScreen.js
// Formulario de credenciales con TextInputs simples

import React, { useState, useCallback, memo } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, TextInput, Linking, Alert } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { LOTTIE_LOGIN } from './slides.js';
import TruckMark from './components/TruckMark.js';
import Lottie from './components/Lottie.js';
import SoftBackdrop from './components/SoftBackdrop.js';

// Memoizar el Lottie para evitar re-renders
const MemoizedLottie = memo(Lottie);

// Iconos SVG simples
const MailIcon = ({ color }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Rect width="20" height="16" x="2" y="4" rx="2" stroke={color} strokeWidth={2} />
    <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

const LockIcon = ({ color }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Rect width="18" height="11" x="3" y="11" rx="2" ry="2" stroke={color} strokeWidth={2} />
    <Path d="M7 11V7a5 5 0 0 1 10 0v4" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
  </Svg>
);

export default function NewLoginScreen({
  theme,
  onBack,
  showBack = true,
  lottieSize = 260,
  onSubmit, // (user, password) => Promise
}) {
  const [user, setUser] = useState('');
  const [pwd, setPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const [loading, setLoading] = useState(false);

  const buttonScale = useSharedValue(1);

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const handleSubmit = useCallback(async () => {
    if (loading) return;

    // Validar campos vacíos
    if (!user.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa tu usuario', [{ text: 'OK' }]);
      return;
    }

    if (!pwd.trim()) {
      Alert.alert('Campo requerido', 'Por favor ingresa tu contraseña', [{ text: 'OK' }]);
      return;
    }

    buttonScale.value = withTiming(0.985, { duration: 100 });
    setLoading(true);

    console.log('Intentando login con usuario:', user);

    try {
      if (onSubmit) {
        await onSubmit(user, pwd);
        console.log('Login exitoso');
      } else {
        await new Promise((res) => setTimeout(res, 2200)); // demo
      }
    } catch (error) {
      console.error('Error de login:', error);
      Alert.alert(
        'Error de autenticación',
        error.message || 'Usuario o contraseña incorrectos. Por favor, verifica tus credenciales e intenta de nuevo.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      buttonScale.value = withTiming(1, { duration: 100 });
    }
  }, [loading, onSubmit, user, pwd]);

  const toggleShowPwd = useCallback(() => setShowPwd(v => !v), []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.canvas }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <View style={{ flex: 1, position: 'relative' }}>
            <SoftBackdrop theme={theme} variant="circle" intensity={0.7} />

        {/* Top: back + wordmark */}
        <View
          style={{
            position: 'relative',
            zIndex: 2,
            paddingTop: 50,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 50,
          }}
        >
          {showBack ? (
            <TouchableOpacity
              onPress={onBack}
              accessibilityLabel="Atrás"
              style={{
                width: 38,
                height: 38,
                borderRadius: 12,
                backgroundColor: theme.surface,
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
            <View />
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TruckMark size={26} theme={theme} />
            <Text
              style={{
                fontFamily: 'Montserrat_800ExtraBold',
                fontSize: 13,
                color: theme.ink,
                letterSpacing: -0.1,
              }}
            >
              Mendiola Logistics
            </Text>
          </View>
        </View>

        {/* Hero animation */}
        <View
          style={{
            position: 'relative',
            zIndex: 2,
            alignItems: 'center',
            justifyContent: 'center',
            paddingHorizontal: 12,
            paddingTop: 40,
            paddingBottom: 20,
          }}
        >
          <View
            style={{
              width: 340,
              height: 340,
              position: 'relative',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: '10%',
                left: '10%',
                right: '10%',
                bottom: '10%',
                borderRadius: 1000,
                backgroundColor: theme.accentSoft,
              }}
            />
            <MemoizedLottie size="100%" src={LOTTIE_LOGIN} animationType="login" style={{ position: 'relative', zIndex: 1 }} />
          </View>
        </View>

        {/* Form — sin card, flotando */}
        <View
          style={{
            position: 'relative',
            zIndex: 2,
            marginHorizontal: 24,
            paddingTop: 10,
          }}
        >
          <Text
            style={{
              fontFamily: 'Montserrat_800ExtraBold',
              fontSize: 24,
              color: theme.ink,
              letterSpacing: -0.5,
            }}
          >
            Hola de nuevo
          </Text>
          <Text
            style={{
              marginTop: 6,
              marginBottom: 20,
              fontFamily: 'Manrope_400Regular',
              fontSize: 14,
              color: theme.muted,
            }}
          >
            Ingresa tus credenciales para continuar
          </Text>

          {/* Campo Usuario */}
          <View>
            <Text style={{ marginBottom: 6, fontFamily: 'Manrope_700Bold', fontSize: 12, color: theme.ink }}>
              Usuario
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              height: 50,
              borderRadius: 13,
              backgroundColor: focusedField === 'user' ? theme.surface : '#F3F2F8',
              borderWidth: 1.5,
              borderColor: focusedField === 'user' ? theme.accent : 'transparent',
            }}>
              <MailIcon color={focusedField === 'user' ? theme.accent : theme.muted} />
              <TextInput
                value={user}
                onChangeText={setUser}
                placeholder="tucorreo@empresa.com"
                onFocus={() => setFocusedField('user')}
                onBlur={() => setFocusedField('')}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  flex: 1,
                  marginLeft: 10,
                  fontFamily: 'Manrope_500Medium',
                  fontSize: 14.5,
                  color: theme.ink,
                }}
                placeholderTextColor={theme.muted}
              />
            </View>
          </View>

          <View style={{ height: 16 }} />

          {/* Campo Contraseña */}
          <View>
            <Text style={{ marginBottom: 6, fontFamily: 'Manrope_700Bold', fontSize: 12, color: theme.ink }}>
              Contraseña
            </Text>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 12,
              height: 50,
              borderRadius: 13,
              backgroundColor: focusedField === 'pwd' ? theme.surface : '#F3F2F8',
              borderWidth: 1.5,
              borderColor: focusedField === 'pwd' ? theme.accent : 'transparent',
            }}>
              <LockIcon color={focusedField === 'pwd' ? theme.accent : theme.muted} />
              <TextInput
                value={pwd}
                onChangeText={setPwd}
                placeholder="••••••••"
                onFocus={() => setFocusedField('pwd')}
                onBlur={() => setFocusedField('')}
                secureTextEntry={!showPwd}
                autoCapitalize="none"
                autoCorrect={false}
                style={{
                  flex: 1,
                  marginLeft: 10,
                  fontFamily: 'Manrope_500Medium',
                  fontSize: 14.5,
                  color: theme.ink,
                }}
                placeholderTextColor={theme.muted}
              />
              <TouchableOpacity onPress={toggleShowPwd} style={{ padding: 4 }}>
                <Svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  {showPwd ? (
                    <>
                      <Path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" stroke={theme.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <Path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" stroke={theme.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <Path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" stroke={theme.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <Path d="M2 2L22 22" stroke={theme.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  ) : (
                    <>
                      <Path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" stroke={theme.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <Circle cx="12" cy="12" r="3" stroke={theme.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  )}
                </Svg>
              </TouchableOpacity>
            </View>
          </View>

          {/* Submit */}
          <Animated.View style={buttonStyle}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              style={{
                marginTop: 20,
                width: '100%',
                height: 54,
                borderRadius: 14,
                backgroundColor: theme.accent,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {loading ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <ActivityIndicator size="small" color="#fff" />
                  <Text
                    style={{
                      fontFamily: 'Montserrat_700Bold',
                      fontSize: 15,
                      color: '#fff',
                      letterSpacing: -0.1,
                    }}
                  >
                    Iniciando…
                  </Text>
                </View>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text
                    style={{
                      fontFamily: 'Montserrat_700Bold',
                      fontSize: 15,
                      color: '#fff',
                      letterSpacing: -0.1,
                    }}
                  >
                    Iniciar Sesión
                  </Text>
                  <Svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <Path
                      d="M5 12h14M13 5l7 7-7 7"
                      stroke="white"
                      strokeWidth="2.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        <View
          style={{
            position: 'relative',
            zIndex: 2,
            marginTop: 'auto',
            paddingTop: 20,
            paddingBottom: 20,
            paddingHorizontal: 20,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontFamily: 'Manrope_500Medium',
              fontSize: 11.5,
              color: theme.muted,
              letterSpacing: 0.2,
            }}
          >
            Versión 1.0.0 · Mendiola Logistics Platform
          </Text>

          {/* Legal Links */}
          <View
            style={{
              flexDirection: 'row',
              marginTop: 12,
              gap: 12,
              alignItems: 'center',
            }}
          >
            <TouchableOpacity
              onPress={() => Linking.openURL('https://mendiolalogistics.com/privacy-policy')}
            >
              <Text
                style={{
                  fontFamily: 'Manrope_600SemiBold',
                  fontSize: 10.5,
                  color: theme.muted,
                  textDecorationLine: 'underline',
                }}
              >
                Privacidad
              </Text>
            </TouchableOpacity>

            <Text style={{ color: theme.muted, fontSize: 10 }}>•</Text>

            <TouchableOpacity
              onPress={() => Linking.openURL('https://mendiolalogistics.com/terms-of-service')}
            >
              <Text
                style={{
                  fontFamily: 'Manrope_600SemiBold',
                  fontSize: 10.5,
                  color: theme.muted,
                  textDecorationLine: 'underline',
                }}
              >
                Términos
              </Text>
            </TouchableOpacity>
          </View>
        </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
