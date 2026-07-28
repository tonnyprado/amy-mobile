// src/components/DriverWarningBanner.js
// Banner de advertencia para repartidores sobre manejo de paquetes

import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { AlertTriangle, X, Package, Shield, Camera } from 'lucide-react-native';
import { getTheme, FONTS } from '../theme/repartidorTheme';
import * as Haptics from 'expo-haptics';

const theme = getTheme('violet');

/**
 * Banner de advertencia prominente para repartidores
 * Muestra reglas importantes sobre el manejo de paquetes
 */
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
    if (onDismiss) {
      onDismiss();
    }
  };

  if (isDismissed) {
    return null;
  }

  return (
    <>
      <View style={styles.banner}>
        <View style={styles.bannerIcon}>
          <AlertTriangle size={24} color="#DC2626" strokeWidth={2.5} />
        </View>

        <View style={styles.bannerContent}>
          <Text style={styles.bannerTitle}>⚠️ Recordatorio Importante</Text>
          <Text style={styles.bannerText}>
            Manejo cuidadoso de paquetes requerido
          </Text>

          <TouchableOpacity style={styles.detailsButton} onPress={handleShowDetails}>
            <Text style={styles.detailsButtonText}>Ver detalles</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
          <X size={20} color={theme.muted} />
        </TouchableOpacity>
      </View>

      {/* Modal con detalles completos */}
      <Modal
        visible={showDetails}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDetails(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <AlertTriangle size={28} color="#DC2626" strokeWidth={2.5} />
              <Text style={styles.modalTitle}>Normas de Manejo de Paquetes</Text>
              <TouchableOpacity
                style={styles.modalClose}
                onPress={() => setShowDetails(false)}
              >
                <X size={24} color={theme.ink} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <WarningItem
                icon={Package}
                title="Manejo Cuidadoso"
                description="NO golpees, arrojes o maltrates los paquetes. Cada pedido debe tratarse con cuidado."
                severity="high"
              />

              <WarningItem
                icon={Shield}
                title="Responsabilidad"
                description="Eres responsable de cada paquete desde que lo recibes hasta que lo entregas. Cualquier daño será tu responsabilidad."
                severity="high"
              />

              <WarningItem
                icon={Camera}
                title="Evidencia Fotográfica"
                description="Todas las entregas y avisos requieren evidencia fotográfica. Toma fotos claras de cada intento."
                severity="medium"
              />

              <View style={styles.rulesBox}>
                <Text style={styles.rulesTitle}>📋 Reglas Básicas:</Text>
                <Text style={styles.ruleText}>✓ Carga y descarga con cuidado</Text>
                <Text style={styles.ruleText}>✓ No apiles paquetes pesados sobre otros</Text>
                <Text style={styles.ruleText}>✓ Mantén los paquetes secos y protegidos</Text>
                <Text style={styles.ruleText}>✓ Reporta cualquier daño inmediatamente</Text>
                <Text style={styles.ruleText}>✓ Sigue todas las instrucciones especiales</Text>
              </View>

              <View style={styles.consequencesBox}>
                <Text style={styles.consequencesTitle}>⚠️ Consecuencias:</Text>
                <Text style={styles.consequencesText}>
                  El maltrato de paquetes, pérdida de mercancía o negligencia puede resultar en:
                </Text>
                <Text style={styles.consequenceItem}>• Descuentos de nómina</Text>
                <Text style={styles.consequenceItem}>• Suspensión temporal</Text>
                <Text style={styles.consequenceItem}>• Terminación de contrato</Text>
              </View>

              <TouchableOpacity
                style={styles.understoodButton}
                onPress={() => {
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  setShowDetails(false);
                }}
              >
                <Text style={styles.understoodButtonText}>He Leído y Entendido</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

/**
 * Item individual de advertencia
 */
function WarningItem({ icon: Icon, title, description, severity = 'medium' }) {
  const severityColors = {
    high: '#DC2626',
    medium: '#F59E0B',
    low: '#3B82F6',
  };

  const color = severityColors[severity];

  return (
    <View style={styles.warningItem}>
      <View style={[styles.warningIcon, { backgroundColor: color + '20' }]}>
        <Icon size={24} color={color} strokeWidth={2.5} />
      </View>
      <View style={styles.warningContent}>
        <Text style={styles.warningTitle}>{title}</Text>
        <Text style={styles.warningDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 2,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    gap: 12,
  },
  bannerIcon: {
    marginTop: 2,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
    fontFamily: FONTS.bodySemiBold,
    marginBottom: 4,
  },
  bannerText: {
    fontSize: 14,
    color: '#7F1D1D',
    fontFamily: FONTS.bodyRegular,
    lineHeight: 20,
    marginBottom: 8,
  },
  detailsButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#DC2626',
    borderRadius: 6,
  },
  detailsButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    fontFamily: FONTS.bodySemiBold,
  },
  dismissButton: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: theme.ink,
    fontFamily: FONTS.display,
  },
  modalClose: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  warningItem: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
    padding: 12,
    backgroundColor: theme.canvas,
    borderRadius: 12,
  },
  warningIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.ink,
    fontFamily: FONTS.bodySemiBold,
    marginBottom: 4,
  },
  warningDescription: {
    fontSize: 13,
    color: theme.muted,
    fontFamily: FONTS.bodyRegular,
    lineHeight: 18,
  },
  rulesBox: {
    backgroundColor: '#EFF6FF',
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
    marginBottom: 16,
  },
  rulesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E40AF',
    fontFamily: FONTS.bodySemiBold,
    marginBottom: 12,
  },
  ruleText: {
    fontSize: 13,
    color: '#1F2937',
    fontFamily: FONTS.bodyRegular,
    marginBottom: 6,
    lineHeight: 18,
  },
  consequencesBox: {
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#DC2626',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  consequencesTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#991B1B',
    fontFamily: FONTS.bodySemiBold,
    marginBottom: 8,
  },
  consequencesText: {
    fontSize: 13,
    color: '#7F1D1D',
    fontFamily: FONTS.bodyRegular,
    marginBottom: 8,
    lineHeight: 18,
  },
  consequenceItem: {
    fontSize: 13,
    color: '#7F1D1D',
    fontFamily: FONTS.bodyRegular,
    marginBottom: 4,
    paddingLeft: 8,
  },
  understoodButton: {
    backgroundColor: theme.successFg,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  understoodButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    fontFamily: FONTS.bodySemiBold,
  },
});
