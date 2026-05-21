/**
 * AnalysisPanel - Panel narrow desde la derecha
 * Muestra análisis y sugerencias basadas en el rendimiento actual
 */

import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Animated,
} from 'react-native';
import {
  X,
  Lightbulb,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Phone,
} from 'lucide-react-native';
import { theme, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { STATS } from '../data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PANEL_WIDTH = SCREEN_WIDTH * 0.85; // 85% del ancho

export default function AnalysisPanel({ visible, onClose }) {
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const data = STATS;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 320,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 320,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  // Generar sugerencias basadas en los datos
  const sugerencias = [];

  const velocidad = data.successRate >= data.expectedPct
    ? 'adelante'
    : data.successRate >= data.expectedPct - 10
    ? 'bien'
    : 'atrasado';

  if (velocidad === 'atrasado') {
    sugerencias.push({
      type: 'urgente',
      icon: AlertTriangle,
      color: theme.dangerFg,
      bg: theme.dangerBg,
      title: 'Ritmo lento detectado',
      message: 'Contactar a los repartidores para acelerar las entregas',
      action: 'Llamar ahora',
    });
  }

  if (data.alerts.high > 0) {
    sugerencias.push({
      type: 'atencion',
      icon: AlertTriangle,
      color: '#f59e0b',
      bg: theme.warnBg,
      title: `${data.alerts.high} alerta${data.alerts.high !== 1 ? 's' : ''} crítica${data.alerts.high !== 1 ? 's' : ''}`,
      message: 'Requieren atención inmediata',
      action: 'Ver alertas',
    });
  }

  if (data.pending > data.inRoute) {
    sugerencias.push({
      type: 'info',
      icon: TrendingUp,
      color: theme.infoFg,
      bg: theme.infoBg,
      title: 'Muchos pedidos pendientes',
      message: `${data.pending} pedidos sin asignar a ruta`,
      action: 'Revisar',
    });
  }

  if (velocidad === 'adelante') {
    sugerencias.push({
      type: 'exito',
      icon: CheckCircle2,
      color: theme.successFg,
      bg: theme.successBg,
      title: '¡Excelente rendimiento!',
      message: 'El equipo va adelante del objetivo',
      action: null,
    });
  }

  return (
    <>
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Panel */}
      <Animated.View
        style={[
          styles.panel,
          {
            width: PANEL_WIDTH,
            transform: [{ translateX: slideAnim }],
          },
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.iconContainer}>
              <Lightbulb size={18} color={theme.accent} strokeWidth={2.2} />
            </View>
            <Text style={styles.title}>Análisis</Text>
          </View>

          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={20} color={theme.muted} strokeWidth={2.2} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Sugerencias</Text>

          {sugerencias.map((sugerencia, index) => {
            const IconComponent = sugerencia.icon;

            return (
              <View key={index} style={[styles.card, { backgroundColor: sugerencia.bg }]}>
                <View style={styles.cardIcon}>
                  <IconComponent size={20} color={sugerencia.color} strokeWidth={2.2} />
                </View>

                <View style={styles.cardContent}>
                  <Text style={[styles.cardTitle, { color: sugerencia.color }]}>
                    {sugerencia.title}
                  </Text>
                  <Text style={styles.cardMessage}>{sugerencia.message}</Text>

                  {sugerencia.action && (
                    <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                      <Text style={[styles.actionButtonText, { color: sugerencia.color }]}>
                        {sugerencia.action}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}

          {sugerencias.length === 0 && (
            <View style={styles.emptyState}>
              <CheckCircle2 size={48} color={theme.successFg} strokeWidth={1.5} />
              <Text style={styles.emptyText}>Todo en orden</Text>
              <Text style={styles.emptySubtext}>
                No hay sugerencias en este momento
              </Text>
            </View>
          )}

          {/* Espacio final */}
          <View style={{ height: SPACING.xxxl }} />
        </ScrollView>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 100,
  },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.surface,
    zIndex: 101,
    ...SHADOWS.cardHeavy,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.xl,
    paddingTop: 64, // Espacio para status bar
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: `${theme.accent}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.lg,
    color: theme.ink,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.full,
    backgroundColor: theme.canvas,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
  },
  sectionTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.sm,
    color: theme.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: SPACING.md,
  },
  card: {
    flexDirection: 'row',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)',
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.base,
    marginBottom: 4,
  },
  cardMessage: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: theme.muted,
    lineHeight: 18,
  },
  actionButton: {
    marginTop: SPACING.sm,
    alignSelf: 'flex-start',
  },
  actionButtonText: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.sm,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl * 2,
  },
  emptyText: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.lg,
    color: theme.ink,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: theme.muted,
  },
});
