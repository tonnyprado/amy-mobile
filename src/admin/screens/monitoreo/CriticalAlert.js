/**
 * CriticalAlert - Banner rojo pulsante para después de las 10 AM
 * Muestra hora LIVE actualizada cada segundo
 * Animación de pulso en el halo y stripes diagonales animadas
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Clock } from 'lucide-react-native';
import { theme, FONTS, FONT_SIZES, SPACING, RADIUS } from '../../theme';

export default function CriticalAlert() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Actualizar hora cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Animación de pulso
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const hora = currentTime.getHours();

  return (
    <View style={styles.container}>
      {/* Halo pulsante */}
      <Animated.View
        style={[
          styles.halo,
          {
            transform: [{ scale: pulseAnim }],
            opacity: pulseAnim.interpolate({
              inputRange: [1, 1.15],
              outputRange: [0.3, 0],
            }),
          },
        ]}
      />

      {/* Card principal */}
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Clock size={20} color={theme.surface} strokeWidth={2.5} />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>
              Son las {hora}:{currentTime.getMinutes().toString().padStart(2, '0')}
            </Text>
            <Text style={styles.subtitle}>Hora crítica de entregas</Text>
          </View>
        </View>

        <View style={styles.timeDisplay}>
          <Text style={styles.time}>{formatTime(currentTime)}</Text>
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    position: 'relative',
  },
  halo: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    backgroundColor: theme.dangerFg,
    borderRadius: RADIUS.xl,
    zIndex: -1,
  },
  card: {
    backgroundColor: theme.dangerFg,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.lg,
    color: theme.surface,
    marginBottom: 2,
  },
  subtitle: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  time: {
    fontFamily: FONTS.displayBlack,
    fontSize: FONT_SIZES.xxxl,
    color: theme.surface,
    letterSpacing: -1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.sm,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: theme.surface,
  },
  liveText: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.xs,
    color: theme.surface,
    letterSpacing: 0.8,
  },
});
