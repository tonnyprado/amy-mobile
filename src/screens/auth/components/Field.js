// src/screens/auth/components/Field.js
// Input pill con label, ícono interno y slot trailing (para el toggle de
// mostrar contraseña, por ejemplo). Estado focused se eleva visualmente.

import React from 'react';
import { View, Text, TextInput, StyleSheet, Animated } from 'react-native';
import Svg, { Rect, Path, Circle, Line } from 'react-native-svg';

function FieldIcon({ name, color }) {
  const props = {
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  if (name === 'mail') {
    return (
      <Svg {...props}>
        <Rect width="20" height="16" x="2" y="4" rx="2" />
        <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
      </Svg>
    );
  }

  if (name === 'lock') {
    return (
      <Svg {...props}>
        <Rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <Path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </Svg>
    );
  }

  return null;
}

export default function Field({
  theme,
  label,
  icon,
  value,
  onChange,
  placeholder,
  focused,
  onFocus,
  onBlur,
  type,
  trailing,
}) {
  const isPassword = type === 'password';
  const isEmail = type === 'email';

  return (
    <View>
      <Text
        style={{
          marginBottom: 6,
          fontFamily: 'Manrope_700Bold',
          fontSize: 12,
          color: theme.ink,
          letterSpacing: 0.1,
        }}
      >
        {label}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          paddingHorizontal: 12,
          height: 50,
          borderRadius: 13,
          backgroundColor: focused ? theme.surface : '#F3F2F8',
          borderWidth: 1.5,
          borderColor: focused ? theme.accent : 'transparent',
          ...(focused && {
            shadowColor: theme.accent,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
          }),
        }}
      >
        <FieldIcon name={icon} color={focused ? theme.accent : theme.muted} />
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={placeholder}
          onFocus={onFocus}
          onBlur={onBlur}
          secureTextEntry={isPassword}
          keyboardType={isEmail ? 'email-address' : 'default'}
          autoCapitalize="none"
          autoCorrect={false}
          style={{
            flex: 1,
            height: '100%',
            fontFamily: 'Manrope_500Medium',
            fontSize: 14.5,
            color: theme.ink,
            paddingVertical: 0,
          }}
          placeholderTextColor={theme.muted}
        />
        {trailing}
      </View>
    </View>
  );
}
