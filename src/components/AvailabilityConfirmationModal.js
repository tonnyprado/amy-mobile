// src/components/AvailabilityConfirmationModal.js
// Modal para que repartidores confirmen disponibilidad pre-campaña

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Calendar, Check, X, AlertCircle } from 'lucide-react-native';
import { getTheme, FONTS } from '../theme/repartidorTheme';
import * as Haptics from 'expo-haptics';

const theme = getTheme('violet');

/**
 * Modal para confirmar disponibilidad del repartidor para una campaña
 */
export default function AvailabilityConfirmationModal({
  visible,
  onClose,
  campanaInfo,
  onConfirm,
}) {
  const [disponible, setDisponible] = useState(null);
  const [observaciones, setObservaciones] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirmar = async () => {
    if (disponible === null) {
      Alert.alert('Selección requerida', 'Por favor indica si estarás disponible');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);

    try {
      await onConfirm({
        disponible,
        observaciones: observaciones.trim() || null,
      });

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDisponible(null);
      setObservaciones('');
      onClose();
    } catch (error) {
      console.error('Error al confirmar disponibilidad:', error);
      Alert.alert('Error', 'No se pudo confirmar la disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = async (value) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDisponible(value);
  };

  if (!campanaInfo) return null;

  const formatFecha = (fecha) => {
    if (!fecha) return '';
    const d = new Date(fecha);
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Calendar size={28} color={theme.accent} strokeWidth={2.5} />
            <Text style={styles.modalTitle}>Confirma tu Disponibilidad</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={theme.ink} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <View style={styles.campanaInfo}>
              <Text style={styles.campanaLabel}>Campaña</Text>
              <Text style={styles.campanaNombre}>{campanaInfo.campana}</Text>

              <View style={styles.fechasRow}>
                <View style={styles.fechaItem}>
                  <Text style={styles.fechaLabel}>Inicio</Text>
                  <Text style={styles.fechaValue}>
                    {formatFecha(campanaInfo.fechaInicioCampana)}
                  </Text>
                </View>
                <View style={styles.fechaItem}>
                  <Text style={styles.fechaLabel}>Fin</Text>
                  <Text style={styles.fechaValue}>
                    {formatFecha(campanaInfo.fechaFinCampana)}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.pregunta}>¿Estarás disponible para esta campaña?</Text>

            <View style={styles.optionsContainer}>
              <TouchableOpacity
                style={[
                  styles.optionButton,
                  disponible === true && styles.optionButtonSelectedYes,
                ]}
                onPress={() => handleSelectOption(true)}
                disabled={loading}
              >
                <Check
                  size={24}
                  color={disponible === true ? '#FFF' : theme.successFg}
                  strokeWidth={2.5}
                />
                <Text
                  style={[
                    styles.optionText,
                    disponible === true && styles.optionTextSelected,
                  ]}
                >
                  Sí, Disponible
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.optionButton,
                  disponible === false && styles.optionButtonSelectedNo,
                ]}
                onPress={() => handleSelectOption(false)}
                disabled={loading}
              >
                <X
                  size={24}
                  color={disponible === false ? '#FFF' : '#DC2626'}
                  strokeWidth={2.5}
                />
                <Text
                  style={[
                    styles.optionText,
                    disponible === false && styles.optionTextSelected,
                  ]}
                >
                  No, No Disponible
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>
                Observaciones {disponible === false && '(motivo)'}
              </Text>
              <TextInput
                style={styles.textInput}
                value={observaciones}
                onChangeText={setObservaciones}
                placeholder={
                  disponible === false
                    ? 'Explica por qué no estarás disponible...'
                    : 'Comentarios adicionales (opcional)'
                }
                placeholderTextColor={theme.muted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                editable={!loading}
              />
            </View>

            {disponible === false && (
              <View style={styles.warningBox}>
                <AlertCircle size={20} color="#F59E0B" />
                <Text style={styles.warningText}>
                  Tu supervisor será notificado de tu no disponibilidad
                </Text>
              </View>
            )}
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.button, styles.buttonCancel]}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.buttonCancelText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonConfirm,
                (loading || disponible === null) && styles.buttonDisabled,
              ]}
              onPress={handleConfirmar}
              disabled={loading || disponible === null}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.buttonConfirmText}>Confirmar</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
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
    borderBottomColor: theme.border,
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: theme.ink,
    fontFamily: FONTS.display,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  campanaInfo: {
    backgroundColor: theme.canvas,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  campanaLabel: {
    fontSize: 12,
    color: theme.muted,
    fontFamily: FONTS.bodyBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  campanaNombre: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.accent,
    fontFamily: FONTS.display,
    marginBottom: 12,
  },
  fechasRow: {
    flexDirection: 'row',
    gap: 16,
  },
  fechaItem: {
    flex: 1,
  },
  fechaLabel: {
    fontSize: 11,
    color: theme.muted,
    fontFamily: FONTS.bodyBold,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  fechaValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.ink,
    fontFamily: FONTS.bodySemiBold,
  },
  pregunta: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.ink,
    fontFamily: FONTS.bodySemiBold,
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.border,
    backgroundColor: theme.surface,
  },
  optionButtonSelectedYes: {
    backgroundColor: theme.successFg,
    borderColor: theme.successFg,
  },
  optionButtonSelectedNo: {
    backgroundColor: '#DC2626',
    borderColor: '#DC2626',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.ink,
    fontFamily: FONTS.bodySemiBold,
  },
  optionTextSelected: {
    color: '#FFF',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.ink,
    fontFamily: FONTS.bodySemiBold,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.canvas,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    color: theme.ink,
    fontFamily: FONTS.bodyRegular,
    minHeight: 80,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    padding: 12,
    borderRadius: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: '#92400E',
    fontFamily: FONTS.bodyRegular,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonCancel: {
    backgroundColor: theme.canvas,
    borderWidth: 1,
    borderColor: theme.border,
  },
  buttonCancelText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.ink,
    fontFamily: FONTS.bodySemiBold,
  },
  buttonConfirm: {
    backgroundColor: theme.accent,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonConfirmText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.ink,
    fontFamily: FONTS.bodySemiBold,
  },
});
