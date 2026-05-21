import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import LottieView from 'lottie-react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function DeliverySuccessScreen({ route, navigation }) {
  const { orderDetails } = route.params || {};
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef(null);

  useEffect(() => {
    // Reproducir sonido de éxito
    playSuccessSound();

    // Vibración de éxito
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Animación de entrada
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Reproducir animación Lottie
    if (lottieRef.current) {
      lottieRef.current.play();
    }
  }, []);

  const playSuccessSound = async () => {
    try {
      // Configurar el modo de audio para reproducir con el dispositivo en silencio
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
      });

      // Intentar cargar y reproducir el sonido
      // NOTA: Debes agregar el archivo success.mp3 en assets/sounds/
      // Ver assets/sounds/README.md para más información
      const { sound } = await Audio.Sound.createAsync(
        require('../../../assets/sounds/success.mp3'),
        { shouldPlay: true, volume: 1.0 }
      );

      // Limpiar el sonido después de reproducirlo
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log('⚠️ No se pudo reproducir el sonido de éxito. Agrega assets/sounds/success.mp3');
      console.log('Ver assets/sounds/README.md para instrucciones');
    }
  };

  const handleDone = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Navegar de regreso a la pantalla principal de paquetes
    // usando popToTop para volver a la raíz del stack
    navigation.popToTop();
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Animación Lottie de fondo */}
      <View style={styles.lottieContainer}>
        <LottieView
          ref={lottieRef}
          source={require('../../../balloons.json')}
          style={styles.lottieAnimation}
          autoPlay={false}
          loop={false}
        />
      </View>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Ícono de check con animación */}
        <View style={styles.checkIconContainer}>
          <View style={styles.checkIconCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>
        </View>

        {/* Título */}
        <Text style={styles.title}>¡Entrega hecha con éxito!</Text>

        {/* Ilustración de paquete */}
        <View style={styles.packageIllustration}>
          <Text style={styles.packageEmoji}>📦</Text>
          <View style={styles.handsContainer}>
            <Text style={styles.handEmoji}>👐</Text>
          </View>
        </View>

        {/* Detalles del pedido */}
        {orderDetails && (
          <View style={styles.orderDetailsCard}>
            <Text style={styles.orderCode}>{orderDetails.orderCode || 'ORD-7F9X2P1LQ84B-ZR19A6T'}</Text>

            <View style={styles.detailsGrid}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Recibió</Text>
                <Text style={styles.detailValue}>{orderDetails.deliveryMan || 'Cliente'}</Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Destinatario</Text>
                <Text style={styles.detailValue}>{orderDetails.recipient || 'Cliente'}</Text>
              </View>
            </View>

            <View style={styles.detailsGrid}>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>De</Text>
                <Text style={styles.detailValue}>{orderDetails.from || 'Almacén'}</Text>
                <Text style={styles.detailAddress}>{orderDetails.fromAddress || 'Centro de distribución'}</Text>
              </View>
              <View style={styles.detailColumn}>
                <Text style={styles.detailLabel}>Para</Text>
                <Text style={styles.detailValue}>{orderDetails.to || 'Destino'}</Text>
                <Text style={styles.detailAddress}>{orderDetails.toAddress || 'Dirección del cliente'}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Botón Listo */}
        <TouchableOpacity
          style={styles.doneButton}
          onPress={handleDone}
          activeOpacity={0.8}
        >
          <Text style={styles.doneButtonText}>Listo</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    position: 'relative',
  },
  lottieContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 0,
  },
  lottieAnimation: {
    width: SCREEN_WIDTH * 1.2,
    height: SCREEN_WIDTH * 1.2,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    zIndex: 1,
  },
  checkIconContainer: {
    marginBottom: 16,
  },
  checkIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#4ADE80',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4ADE80',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  checkIcon: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#000000',
    marginBottom: 32,
    textAlign: 'center',
  },
  packageIllustration: {
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  packageEmoji: {
    fontSize: 120,
  },
  handsContainer: {
    position: 'absolute',
    bottom: -10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  handEmoji: {
    fontSize: 48,
  },
  orderDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    marginBottom: 32,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  orderCode: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 16,
  },
  detailColumn: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
    fontStyle: 'italic',
    marginBottom: 2,
  },
  detailAddress: {
    fontSize: 11,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  doneButton: {
    backgroundColor: '#000000',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 60,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  doneButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
});
