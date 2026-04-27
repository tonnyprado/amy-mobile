import React from 'react';
import { View } from 'react-native';
import LottieView from 'lottie-react-native';

/**
 * Componente de icono animado con Lottie
 *
 * @param {Object} props
 * @param {string} props.source - URL del archivo JSON de Lottie
 * @param {number} props.size - Tamaño del icono (default: 100)
 * @param {boolean} props.autoPlay - Reproducir automáticamente (default: true)
 * @param {boolean} props.loop - Repetir en loop (default: true)
 */
export default function AnimatedIcon({
  source,
  size = 100,
  autoPlay = true,
  loop = true,
  style
}) {
  return (
    <View style={[{ width: size, height: size }, style]}>
      <LottieView
        source={source}
        autoPlay={autoPlay}
        loop={loop}
        style={{ width: '100%', height: '100%' }}
      />
    </View>
  );
}

/**
 * Iconos predefinidos usando las animaciones de lord-icon
 */
export const ANIMATED_ICONS = {
  signature: 'https://cdn.lordicon.com/tobsqthh.json',
  camera: 'https://cdn.lordicon.com/czcsywgo.json',
  phone: 'https://cdn.lordicon.com/ksdvxnxn.json',
};
