// src/screens/PaqueteDetalleScreen.js
// Pantalla de detalle de paquete con diseño del sistema repartidor

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Platform
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';
import {
  Package,
  Phone,
  ChevronLeft,
  Camera,
  User,
  Users,
  UserCheck,
  Check,
  X,
  MessageSquare,
  AlertCircle,
  Navigation,
  Edit3
} from 'lucide-react-native';
import { getTheme, FONTS } from '../theme/repartidorTheme';
import AddressSearchModal from '../components/AddressSearchModal';
import { registrarIntentoEntrega, obtenerDetallePedido } from '../services/repartidorApi';
import { subirMultiplesFotos } from '../services/uploadService';
import { optimizarImagenLocal } from '../utils/fileHelpers';

const theme = getTheme('violet');

const ESTADOS_CONFIG = {
  PENDIENTE: { label: 'Pendiente', bg: theme.canvas, fg: theme.muted },
  EN_RUTA: { label: 'En ruta', bg: theme.accent, fg: theme.ink },
  ENTREGADO: { label: 'Entregado', bg: theme.successBg, fg: theme.successFg },
  NO_ENTREGADO: { label: 'No entregado', bg: '#FECACA', fg: '#DC2626' }
};

const RECIBIDO_POR_OPTIONS = [
  { key: 'TITULAR', label: 'Titular', icon: User },
  { key: 'CONSULTORA', label: 'Consultora', icon: UserCheck },
  { key: 'FAMILIAR', label: 'Familiar', icon: Users },
  { key: 'LIDER', label: 'Líder', icon: UserCheck },
  { key: 'GZ', label: 'G.Z.', icon: User },
  { key: 'VECINO', label: 'Vecino', icon: Users },
];

export default function PaqueteDetalleScreen({ route, navigation }) {
  const { paquete: paqueteInicial, ubicacion } = route.params;
  const [paquete, setPaquete] = useState(paqueteInicial);
  const [nombreRecibe, setNombreRecibe] = useState(paquete.evidencias?.nombreRecibe || '');
  const [relacionRecibe, setRelacionRecibe] = useState(paquete.evidencias?.relacionRecibe || '');
  const [notasEntrega, setNotasEntrega] = useState(paquete.evidencias?.notasEntrega || '');
  const [motivoNoEntrega, setMotivoNoEntrega] = useState(paquete.evidencias?.motivoNoEntrega || '');
  const [fotos, setFotos] = useState(paquete.evidencias?.fotos || []);
  const [loading, setLoading] = useState(false);
  const [boletaCompleta, setBoletaCompleta] = useState(null);
  const [loadingBoleta, setLoadingBoleta] = useState(false);
  const [showAddressSearch, setShowAddressSearch] = useState(false);

  const estadoConfig = ESTADOS_CONFIG[paquete.estado] || ESTADOS_CONFIG.PENDIENTE;

  useEffect(() => {
    cargarBoletaCompleta();
  }, [paquete.id]);

  const cargarBoletaCompleta = async () => {
    setLoadingBoleta(true);
    try {
      const boleta = await obtenerDetallePedido(paquete.id);
      setBoletaCompleta(boleta);
    } catch (error) {
      console.error('Error al cargar boleta:', error);
    } finally {
      setLoadingBoleta(false);
    }
  };

  const handleLlamar = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`tel:${paquete.telefono}`);
  };

  const handleNavegar = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!paquete.latitud || !paquete.longitud) {
      Alert.alert('Sin coordenadas', 'Este pedido no tiene coordenadas GPS.');
      return;
    }
    const url = Platform.OS === 'ios'
      ? `maps://app?daddr=${paquete.latitud},${paquete.longitud}`
      : `google.navigation:q=${paquete.latitud},${paquete.longitud}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${paquete.latitud},${paquete.longitud}`);
    });
  };

  const handleDireccionEncontrada = (resultado) => {
    setPaquete(prev => ({
      ...prev,
      latitud: resultado.latitud,
      longitud: resultado.longitud,
      direccionCorregida: resultado.direccionOriginal !== prev.direccion ? resultado.direccionOriginal : null
    }));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleTomarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos', 'Se necesitan permisos de cámara');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
      quality: 0.55,
    });

    if (!result.canceled && result.assets[0]) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const optimizedImage = await optimizarImagenLocal(result.assets[0].uri, {
        quality: 0.6,
        maxWidth: 1280,
      });
      setFotos([...fotos, {
        id: Date.now().toString(),
        uri: optimizedImage.uri,
        name: `foto_${Date.now()}.jpg`
      }]);
    }
  };

  const handleCambiarEstado = async (nuevoEstado) => {
    if (nuevoEstado === 'ENTREGADO') {
      if (!nombreRecibe.trim()) {
        Alert.alert('Falta información', 'Ingresa el nombre de quien recibe');
        return;
      }
      if (!relacionRecibe) {
        Alert.alert('Falta información', 'Selecciona quién recibió el pedido');
        return;
      }
    }

    if (nuevoEstado === 'NO_ENTREGADO' && !motivoNoEntrega.trim()) {
      Alert.alert('Falta información', 'Escribe el motivo de no entrega');
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    Alert.alert(
      'Confirmar',
      `¿Marcar pedido como ${ESTADOS_CONFIG[nuevoEstado].label}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            setLoading(true);
            try {
              let fotosUrls = [];
              if (fotos.length > 0) {
                fotosUrls = await subirMultiplesFotos({ fotos, pedidoId: paquete.id });
              }

              await registrarIntentoEntrega({
                pedidoId: paquete.id,
                latitudIntento: ubicacion?.latitud || null,
                longitudIntento: ubicacion?.longitud || null,
                resultado: nuevoEstado,
                motivoFallo: nuevoEstado === 'NO_ENTREGADO' ? 'OTRA_RAZON' : null,
                descripcionFallo: nuevoEstado === 'NO_ENTREGADO' ? motivoNoEntrega : null,
                observaciones: notasEntrega || null,
                fotoEvidenciaUrl: fotosUrls.length > 0 ? fotosUrls[0].url : null,
                firmaUrl: null,
                nombreReceptor: nombreRecibe || null,
                recibidoPor: relacionRecibe || null
              });

              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

              if (nuevoEstado === 'ENTREGADO') {
                navigation.replace('DeliverySuccess', {
                  orderDetails: {
                    orderCode: paquete.numeroGuia || `ORD-${paquete.id}`,
                    deliveryMan: nombreRecibe,
                    recipient: paquete.destinatario,
                    toAddress: paquete.direccion,
                  }
                });
              } else {
                Alert.alert('Listo', `Pedido marcado como ${ESTADOS_CONFIG[nuevoEstado].label}`, [
                  { text: 'OK', onPress: () => navigation.goBack() }
                ]);
              }
            } catch (error) {
              console.error('Error:', error);
              Alert.alert('Error', 'No se pudo actualizar el estado');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header Band */}
        <View style={styles.headerBand}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft size={22} color={theme.ink} strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.headerCode}>#{paquete.numeroPedido || paquete.id}</Text>
            <Text style={styles.headerName}>{paquete.destinatario || 'Cliente'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: estadoConfig.bg }]}>
            <Text style={[styles.statusText, { color: estadoConfig.fg }]}>{estadoConfig.label}</Text>
          </View>
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Info del Cliente */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Package size={18} color={theme.accent} strokeWidth={2.5} />
              <Text style={styles.cardTitle}>Información del Cliente</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Cliente</Text>
              <Text style={styles.infoValue}>{paquete.destinatario || 'Sin nombre'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Teléfono</Text>
              <Text style={styles.infoValue}>{paquete.telefono || 'Sin teléfono'}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Dirección</Text>
              <Text style={styles.infoValue}>{paquete.direccion || 'Sin dirección'}</Text>
            </View>

            {paquete.direccionCorregida && (
              <View style={styles.correctedAddress}>
                <Check size={14} color={theme.successFg} />
                <Text style={styles.correctedAddressText}>{paquete.direccionCorregida}</Text>
              </View>
            )}

            {boletaCompleta && (
              <>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Campaña</Text>
                  <Text style={styles.infoValue}>{boletaCompleta.campana || boletaCompleta.campania || '-'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Total Cajas</Text>
                  <Text style={styles.infoValueHighlight}>{boletaCompleta.totalCajas || paquete.piezas || 0}</Text>
                </View>
              </>
            )}

            {/* Botones de acción */}
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleLlamar}>
                <Phone size={18} color={theme.ink} />
                <Text style={styles.actionBtnText}>Llamar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={handleNavegar}>
                <Navigation size={18} color={theme.ink} />
                <Text style={styles.actionBtnText}>Navegar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={() => setShowAddressSearch(true)}>
                <Edit3 size={18} color={theme.ink} />
                <Text style={styles.actionBtnText}>Corregir</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* AFP's y Productos */}
          {boletaCompleta?.productos?.length > 0 && (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <AlertCircle size={18} color={theme.accent} strokeWidth={2.5} />
                <Text style={styles.cardTitle}>Productos Fuera de Caja</Text>
              </View>
              <View style={styles.alertBox}>
                <Text style={styles.alertText}>
                  Este pedido incluye {boletaCompleta.productos.length} artículo(s) fuera de caja
                </Text>
              </View>
              {boletaCompleta.productos.map((producto, index) => (
                <View key={index} style={styles.productRow}>
                  <Text style={styles.productQty}>{producto.unidades || producto.cantidad || 1}x</Text>
                  <Text style={styles.productName}>{producto.descripcion || '-'}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Quién Recibe */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <UserCheck size={18} color={theme.accent} strokeWidth={2.5} />
              <Text style={styles.cardTitle}>¿Quién recibe?</Text>
            </View>

            <View style={styles.recipientGrid}>
              {RECIBIDO_POR_OPTIONS.map(({ key, label, icon: Icon }) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.recipientOption,
                    relacionRecibe === key && styles.recipientOptionSelected
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setRelacionRecibe(key);
                  }}
                >
                  <Icon size={20} color={relacionRecibe === key ? theme.ink : theme.muted} />
                  <Text style={[
                    styles.recipientLabel,
                    relacionRecibe === key && styles.recipientLabelSelected
                  ]}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Nombre de quien recibe *</Text>
              <View style={styles.input}>
                <TextInput
                  style={styles.inputText}
                  value={nombreRecibe}
                  onChangeText={setNombreRecibe}
                  placeholder="Ej. María García"
                  placeholderTextColor={theme.muted}
                />
              </View>
            </View>
          </View>

          {/* Foto de Evidencia */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Camera size={18} color={theme.accent} strokeWidth={2.5} />
              <Text style={styles.cardTitle}>Evidencia Fotográfica</Text>
              {fotos.length > 0 && (
                <View style={styles.photoCount}>
                  <Text style={styles.photoCountText}>{fotos.length}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.photoButton} onPress={handleTomarFoto}>
              <Camera size={24} color={theme.ink} />
              <Text style={styles.photoButtonText}>Tomar Foto</Text>
            </TouchableOpacity>
          </View>

          {/* Observaciones */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <MessageSquare size={18} color={theme.accent} strokeWidth={2.5} />
              <Text style={styles.cardTitle}>Observaciones</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notas de entrega</Text>
              <View style={[styles.input, styles.inputMultiline]}>
                <TextInput
                  style={[styles.inputText, styles.inputTextMultiline]}
                  value={notasEntrega}
                  onChangeText={setNotasEntrega}
                  placeholder="Detalles de la entrega..."
                  placeholderTextColor={theme.muted}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Motivo de no entrega</Text>
              <View style={[styles.input, styles.inputMultiline]}>
                <TextInput
                  style={[styles.inputText, styles.inputTextMultiline]}
                  value={motivoNoEntrega}
                  onChangeText={setMotivoNoEntrega}
                  placeholder="Solo si no se puede entregar..."
                  placeholderTextColor={theme.muted}
                  multiline
                  numberOfLines={2}
                />
              </View>
            </View>
          </View>

          {/* Botones de Estado */}
          <View style={styles.stateButtons}>
            <TouchableOpacity
              style={[styles.stateBtn, styles.stateBtnEntregado]}
              onPress={() => handleCambiarEstado('ENTREGADO')}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <Check size={20} color="#FFF" />
                  <Text style={[styles.stateBtnText, { color: '#FFF' }]}>Entregado</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.stateBtn, styles.stateBtnNoEntregado]}
              onPress={() => handleCambiarEstado('NO_ENTREGADO')}
              disabled={loading}
            >
              <X size={20} color="#FFF" />
              <Text style={[styles.stateBtnText, { color: '#FFF' }]}>No Entregado</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>

      <AddressSearchModal
        visible={showAddressSearch}
        onClose={() => setShowAddressSearch(false)}
        pedido={paquete}
        onSuccess={handleDireccionEncontrada}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.canvas,
  },
  safeArea: {
    flex: 1,
  },
  headerBand: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    gap: 14,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: theme.canvas,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerCode: {
    fontSize: 12,
    color: theme.muted,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 0.5,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.ink,
    fontFamily: FONTS.display,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: FONTS.bodyBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.ink,
    fontFamily: FONTS.bodySemiBold,
    flex: 1,
  },
  infoRow: {
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 11,
    color: theme.muted,
    fontFamily: FONTS.bodyBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    color: theme.ink,
    fontFamily: FONTS.bodyRegular,
  },
  infoValueHighlight: {
    fontSize: 20,
    color: theme.accent,
    fontWeight: '700',
    fontFamily: FONTS.bodyBold,
  },
  correctedAddress: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: theme.successBg,
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  correctedAddressText: {
    flex: 1,
    fontSize: 13,
    color: theme.successFg,
    fontFamily: FONTS.bodySemiBold,
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: theme.accent,
    paddingVertical: 12,
    borderRadius: 12,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: theme.ink,
    fontFamily: FONTS.bodySemiBold,
  },
  alertBox: {
    backgroundColor: theme.warnBg,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: theme.warnBorder,
    marginBottom: 12,
  },
  alertText: {
    fontSize: 13,
    color: theme.ink,
    fontFamily: FONTS.bodySemiBold,
  },
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  productQty: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.accent,
    fontFamily: FONTS.bodyBold,
    minWidth: 30,
  },
  productName: {
    flex: 1,
    fontSize: 14,
    color: theme.ink,
    fontFamily: FONTS.bodyRegular,
  },
  recipientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  recipientOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: theme.canvas,
    borderWidth: 1,
    borderColor: theme.border,
  },
  recipientOptionSelected: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  recipientLabel: {
    fontSize: 13,
    color: theme.muted,
    fontFamily: FONTS.bodySemiBold,
  },
  recipientLabelSelected: {
    color: theme.ink,
  },
  inputContainer: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 12,
    color: theme.muted,
    fontFamily: FONTS.bodyBold,
    marginBottom: 6,
  },
  input: {
    backgroundColor: theme.canvas,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputMultiline: {
    minHeight: 80,
    paddingTop: 12,
  },
  inputText: {
    fontSize: 15,
    color: theme.ink,
    fontFamily: FONTS.bodyRegular,
  },
  inputTextMultiline: {
    textAlignVertical: 'top',
  },
  photoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.accent,
    paddingVertical: 16,
    borderRadius: 14,
  },
  photoButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.ink,
    fontFamily: FONTS.bodySemiBold,
  },
  photoCount: {
    backgroundColor: theme.accent,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: theme.ink,
    fontFamily: FONTS.bodyBold,
  },
  stateButtons: {
    gap: 10,
    marginTop: 8,
  },
  stateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    borderRadius: 14,
  },
  stateBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.ink,
    fontFamily: FONTS.bodySemiBold,
  },
  stateBtnEntregado: {
    backgroundColor: theme.successFg,
  },
  stateBtnNoEntregado: {
    backgroundColor: '#DC2626',
  },
});
