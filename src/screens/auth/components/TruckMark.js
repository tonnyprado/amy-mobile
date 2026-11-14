// src/screens/auth/components/TruckMark.js
// Logo de Mendiola Logistics — imagotipo del camión.
// Se usa tanto en el onboarding como en el header del login.

import React from 'react';
import { View, Image } from 'react-native';

export default function TruckMark({ size = 64, theme }) {
  return (
    <View
      style={{
        width: size,
        height: size,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
      }}
    >
      <Image
        source={require('../../../../assets/imagotipo.png')}
        style={{
          width: size,
          height: size,
          resizeMode: 'contain',
        }}
      />
    </View>
  );
}
