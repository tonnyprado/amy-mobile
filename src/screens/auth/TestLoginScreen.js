// Componente de test simple
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';

export default function TestLoginScreen({ theme, onSubmit }) {
  const [user, setUser] = useState('');
  const [pwd, setPwd] = useState('');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1, backgroundColor: theme.canvas, justifyContent: 'center', padding: 24 }}
    >
      <Text style={{ fontSize: 24, marginBottom: 20, textAlign: 'center' }}>Test Login</Text>

      <Text style={{ marginBottom: 5 }}>Usuario:</Text>
      <TextInput
        value={user}
        onChangeText={setUser}
        placeholder="Usuario"
        style={{
          height: 50,
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          paddingHorizontal: 12,
          marginBottom: 15,
          backgroundColor: '#fff'
        }}
      />

      <Text style={{ marginBottom: 5 }}>Contraseña:</Text>
      <TextInput
        value={pwd}
        onChangeText={setPwd}
        placeholder="Contraseña"
        secureTextEntry
        style={{
          height: 50,
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          paddingHorizontal: 12,
          marginBottom: 20,
          backgroundColor: '#fff'
        }}
      />

      <TouchableOpacity
        onPress={() => onSubmit?.(user, pwd)}
        style={{
          height: 50,
          backgroundColor: '#FF7849',
          borderRadius: 8,
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
          Iniciar Sesión
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
