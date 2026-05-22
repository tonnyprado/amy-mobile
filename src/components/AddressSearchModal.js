import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { X, Search, MapPin, Check, Package, Navigation } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { geocodificarYActualizarPedido } from '../services/geocodingApi';
import { getTheme, FONTS } from '../theme/repartidorTheme';

const theme = getTheme('violet');

export default function AddressSearchModal({ visible, onClose, pedido, onSuccess }) {
  const [calle, setCalle] = useState('');
  const [numero, setNumero] = useState('');
  const [colonia, setColonia] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [ciudad, setCiudad] = useState('');

  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const handleBuscar = async () => {
    const tieneDatos = calle.trim() || numero.trim() || colonia.trim() ||
                       codigoPostal.trim() || municipio.trim() || ciudad.trim();

    if (!tieneDatos) {
      Alert.alert('Error', 'Ingresa al menos un campo de la dirección');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setLoading(true);
    setResultado(null);

    try {
      const result = await geocodificarYActualizarPedido(
        pedido.id,
        {
          calle: calle.trim() || undefined,
          numero: numero.trim() || undefined,
          colonia: colonia.trim() || undefined,
          codigoPostal: codigoPostal.trim() || undefined,
          municipio: municipio.trim() || undefined,
          ciudad: ciudad.trim() || undefined,
        },
        'Monterrey, Nuevo León, México'
      );

      setResultado(result);

      if (result.exitoso) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          'Dirección encontrada',
          `${result.direccionFormateada}\n\nConfianza: ${Math.round((result.confianza || 0) * 100)}%`,
          [
            {
              text: 'Usar esta dirección',
              onPress: () => {
                onSuccess && onSuccess(result);
                handleCerrar();
              }
            },
            { text: 'Buscar otra', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('No encontrada', result.mensajeError || 'No se pudo encontrar la dirección');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo buscar la dirección');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    setCalle('');
    setNumero('');
    setColonia('');
    setCodigoPostal('');
    setMunicipio('');
    setCiudad('');
    setResultado(null);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={handleCerrar}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIcon}>
              <MapPin size={20} color={theme.accent} strokeWidth={2.5} />
            </View>
            <Text style={styles.title}>Corregir Dirección</Text>
            <TouchableOpacity onPress={handleCerrar} style={styles.closeButton}>
              <X size={22} color={theme.muted} strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Contenido */}
          <ScrollView
            style={styles.content}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Info del pedido */}
            <View style={styles.pedidoCard}>
              <Package size={16} color={theme.accent} />
              <View style={styles.pedidoInfo}>
                <Text style={styles.pedidoCode}>{pedido?.numeroGuia}</Text>
                <Text style={styles.pedidoName}>{pedido?.destinatario}</Text>
              </View>
            </View>

            {/* Dirección original */}
            <View style={styles.direccionOriginal}>
              <Text style={styles.direccionLabel}>Dirección registrada</Text>
              <Text style={styles.direccionText}>{pedido?.direccion}</Text>
            </View>

            {/* Dirección corregida anterior */}
            {pedido?.direccionCorregida && (
              <View style={styles.direccionCorregida}>
                <Check size={14} color={theme.successFg} />
                <View style={styles.direccionCorregidaContent}>
                  <Text style={styles.direccionCorregidaLabel}>Última corrección</Text>
                  <Text style={styles.direccionCorregidaText}>{pedido.direccionCorregida}</Text>
                </View>
              </View>
            )}

            {/* Formulario */}
            <View style={styles.form}>
              <Text style={styles.formTitle}>Nueva dirección</Text>
              <Text style={styles.formHint}>Llena los campos que conozcas</Text>

              <View style={styles.formRow}>
                <View style={styles.formFieldLarge}>
                  <Text style={styles.fieldLabel}>Calle</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={calle}
                    onChangeText={setCalle}
                    placeholder="Ej: Av. Universidad"
                    placeholderTextColor={theme.muted}
                  />
                </View>
                <View style={styles.formFieldSmall}>
                  <Text style={styles.fieldLabel}>Núm.</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={numero}
                    onChangeText={setNumero}
                    placeholder="125"
                    placeholderTextColor={theme.muted}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formFieldLarge}>
                  <Text style={styles.fieldLabel}>Colonia</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={colonia}
                    onChangeText={setColonia}
                    placeholder="Ej: Valencia"
                    placeholderTextColor={theme.muted}
                  />
                </View>
                <View style={styles.formFieldSmall}>
                  <Text style={styles.fieldLabel}>C.P.</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={codigoPostal}
                    onChangeText={setCodigoPostal}
                    placeholder="67140"
                    placeholderTextColor={theme.muted}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.fieldLabel}>Municipio</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={municipio}
                    onChangeText={setMunicipio}
                    placeholder="San Pedro"
                    placeholderTextColor={theme.muted}
                  />
                </View>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.fieldLabel}>Ciudad</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={ciudad}
                    onChangeText={setCiudad}
                    placeholder="Monterrey"
                    placeholderTextColor={theme.muted}
                  />
                </View>
              </View>
            </View>

            {/* Resultado */}
            {resultado && resultado.exitoso && (
              <View style={styles.resultado}>
                <View style={styles.resultadoHeader}>
                  <Navigation size={18} color={theme.successFg} />
                  <Text style={styles.resultadoTitle}>Ubicación encontrada</Text>
                </View>
                <Text style={styles.resultadoDireccion}>{resultado.direccionFormateada}</Text>
                <View style={styles.resultadoStats}>
                  <Text style={styles.resultadoConfianza}>
                    Confianza: {Math.round((resultado.confianza || 0) * 100)}%
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Botones */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.buttonSecondary} onPress={handleCerrar}>
              <Text style={styles.buttonSecondaryText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.buttonPrimary, loading && styles.buttonDisabled]}
              onPress={handleBuscar}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <>
                  <Search size={18} color="#ffffff" strokeWidth={2.5} />
                  <Text style={styles.buttonPrimaryText}>Buscar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: theme.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '75%',
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 12,
  },
  headerIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.canvas,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: theme.ink,
    fontFamily: FONTS.display,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: theme.canvas,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 20,
  },
  pedidoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.canvas,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  pedidoInfo: {
    flex: 1,
  },
  pedidoCode: {
    fontSize: 12,
    color: theme.muted,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 0.5,
  },
  pedidoName: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.ink,
    fontFamily: FONTS.bodySemiBold,
    marginTop: 2,
  },
  direccionOriginal: {
    backgroundColor: theme.canvas,
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  direccionLabel: {
    fontSize: 11,
    color: theme.muted,
    fontFamily: FONTS.bodyBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  direccionText: {
    fontSize: 14,
    color: theme.ink,
    fontFamily: FONTS.bodyRegular,
    lineHeight: 20,
  },
  direccionCorregida: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: theme.successBg,
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    gap: 10,
  },
  direccionCorregidaContent: {
    flex: 1,
  },
  direccionCorregidaLabel: {
    fontSize: 11,
    color: theme.successFg,
    fontFamily: FONTS.bodyBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  direccionCorregidaText: {
    fontSize: 13,
    color: theme.successFg,
    fontFamily: FONTS.bodySemiBold,
  },
  form: {
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.ink,
    fontFamily: FONTS.bodySemiBold,
    marginBottom: 4,
  },
  formHint: {
    fontSize: 12,
    color: theme.muted,
    fontFamily: FONTS.bodyRegular,
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  formFieldLarge: {
    flex: 2,
  },
  formFieldSmall: {
    flex: 1,
  },
  formFieldHalf: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    color: theme.muted,
    fontFamily: FONTS.bodyBold,
    marginBottom: 6,
  },
  fieldInput: {
    backgroundColor: theme.canvas,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    color: theme.ink,
    fontFamily: FONTS.bodyRegular,
  },
  resultado: {
    backgroundColor: theme.successBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
  },
  resultadoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  resultadoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.successFg,
    fontFamily: FONTS.bodySemiBold,
  },
  resultadoDireccion: {
    fontSize: 13,
    color: theme.successFg,
    fontFamily: FONTS.bodyRegular,
    marginBottom: 8,
  },
  resultadoStats: {
    flexDirection: 'row',
  },
  resultadoConfianza: {
    fontSize: 12,
    color: theme.successFg,
    fontFamily: FONTS.bodyBold,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  buttonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.accent,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  buttonPrimaryText: {
    color: theme.accentInk,
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FONTS.bodySemiBold,
  },
  buttonSecondary: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.canvas,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  buttonSecondaryText: {
    color: theme.ink,
    fontSize: 15,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
