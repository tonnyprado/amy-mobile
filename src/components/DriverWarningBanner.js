// src/components/DriverWarningBanner.js
// Banner de advertencia para repartidores sobre manejo de paquetes

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { AlertTriangle, X, Package, Shield, Camera, ChevronRight } from 'lucide-react-native';
import { getTheme, FONTS } from '../theme/repartidorTheme';
import * as Haptics from 'expo-haptics';

const theme = getTheme('violet');

export default function DriverWarningBanner({ onDismiss }) {
  const [showDetails, setShowDetails] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleShowDetails = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowDetails(true);
  };

  const handleDismiss = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleUnderstood = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowDetails(false);
  };

  if (isDismissed) return null;

  return (
    <>
      {/* Banner compacto */}
      <TouchableOpacity
        style={styles.banner}
        onPress={handleShowDetails}
        activeOpacity={0.8}
      >
        <View style={styles.bannerIconWrap}>
          <AlertTriangle size={20} color={theme.ink} strokeWidth={2.5} />
        </View>

        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>Recordatorio de manejo</Text>
          <Text style={styles.bannerSubtitle}>Toca para ver las normas</Text>
        </View>

        <ChevronRight size={20} color={theme.muted} />

        <TouchableOpacity
          style={styles.dismissBtn}
          onPress={handleDismiss}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <X size={18} color={theme.muted} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Modal de detalles */}
      <Modal
        visible={showDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            {/* Handle */}
            <View style={styles.sheetHandle} />

            {/* Header */}
            <View style={styles.sheetHeader}>
              <View style={styles.headerIcon}>
                <AlertTriangle size={24} color={theme.accent} strokeWidth={2.5} />
              </View>
              <Text style={styles.sheetTitle}>Normas de entrega</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => setShowDetails(false)}
              >
                <X size={22} color={theme.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.sheetBody}
              showsVerticalScrollIndicator={false}
            >
              {/* Regla 1 */}
              <View style={styles.ruleCard}>
                <View style={styles.ruleIcon}>
                  <Package size={22} color={theme.accent} />
                </View>
                <View style={styles.ruleContent}>
                  <Text style={styles.ruleTitle}>Manejo cuidadoso</Text>
                  <Text style={styles.ruleText}>
                    No golpees ni arrojes los paquetes. Cada pedido debe tratarse con cuidado.
                  </Text>
                </View>
              </View>

              {/* Regla 2 */}
              <View style={styles.ruleCard}>
                <View style={styles.ruleIcon}>
                  <Shield size={22} color={theme.accent} />
                </View>
                <View style={styles.ruleContent}>
                  <Text style={styles.ruleTitle}>Tu responsabilidad</Text>
                  <Text style={styles.ruleText}>
                    Eres responsable de cada paquete desde que lo recibes hasta que lo entregas.
                  </Text>
                </View>
              </View>

              {/* Regla 3 */}
              <View style={styles.ruleCard}>
                <View style={styles.ruleIcon}>
                  <Camera size={22} color={theme.accent} />
                </View>
                <View style={styles.ruleContent}>
                  <Text style={styles.ruleTitle}>Evidencia requerida</Text>
                  <Text style={styles.ruleText}>
                    Todas las entregas y avisos requieren fotos claras como evidencia.
                  </Text>
                </View>
              </View>

              {/* Lista de puntos */}
              <View style={styles.checklistCard}>
                <Text style={styles.checklistTitle}>Checklist</Text>
                <Text style={styles.checklistItem}>Carga y descarga con cuidado</Text>
                <Text style={styles.checklistItem}>No apiles paquetes pesados sobre otros</Text>
                <Text style={styles.checklistItem}>Mantén los paquetes secos</Text>
                <Text style={styles.checklistItem}>Reporta cualquier daño inmediatamente</Text>
              </View>

              {/* Consecuencias */}
              <View style={styles.warningCard}>
                <Text style={styles.warningTitle}>Incumplimiento</Text>
                <Text style={styles.warningText}>
                  El maltrato de paquetes o negligencia puede resultar en descuentos, suspensión o terminación de contrato.
                </Text>
              </View>

              {/* Espaciado extra para el botón */}
              <View style={{ height: 100 }} />
            </ScrollView>

            {/* Botón fijo */}
            <View style={styles.sheetFooter}>
              <TouchableOpacity
                style={styles.understoodBtn}
                onPress={handleUnderstood}
                activeOpacity={0.8}
              >
                <Text style={styles.understoodText}>Entendido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  // Banner
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.warnBg,
    borderRadius: 14,
    padding: 14,
    marginHorizontal: 16,
    marginVertical: 8,
    gap: 12,
  },
  bannerIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.ink,
    fontFamily: FONTS.bodySemiBold,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: theme.muted,
    fontFamily: FONTS.bodyRegular,
    marginTop: 2,
  },
  dismissBtn: {
    padding: 6,
    marginLeft: 4,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 34,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    backgroundColor: theme.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 12,
  },
  headerIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.canvas,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: theme.ink,
    fontFamily: FONTS.display,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.canvas,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sheetBody: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // Rule cards
  ruleCard: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
    padding: 16,
    backgroundColor: theme.canvas,
    borderRadius: 14,
  },
  ruleIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleContent: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.ink,
    fontFamily: FONTS.bodySemiBold,
    marginBottom: 4,
  },
  ruleText: {
    fontSize: 14,
    color: theme.muted,
    fontFamily: FONTS.bodyRegular,
    lineHeight: 20,
  },

  // Checklist
  checklistCard: {
    backgroundColor: theme.canvas,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  checklistTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.ink,
    fontFamily: FONTS.bodySemiBold,
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  checklistItem: {
    fontSize: 14,
    color: theme.ink,
    fontFamily: FONTS.bodyRegular,
    paddingLeft: 12,
    paddingVertical: 6,
    borderLeftWidth: 2,
    borderLeftColor: theme.accent,
    marginBottom: 6,
  },

  // Warning
  warningCard: {
    backgroundColor: theme.warnBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.ink,
    fontFamily: FONTS.bodySemiBold,
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  warningText: {
    fontSize: 14,
    color: theme.ink,
    fontFamily: FONTS.bodyRegular,
    lineHeight: 20,
  },

  // Footer
  sheetFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    paddingBottom: 34,
    backgroundColor: theme.surface,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  understoodBtn: {
    backgroundColor: theme.accent,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
  },
  understoodText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.accentInk,
    fontFamily: FONTS.bodySemiBold,
  },
});
