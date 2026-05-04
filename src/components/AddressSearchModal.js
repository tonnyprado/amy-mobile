import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { geocodificarYActualizarPedido } from '../services/geocodingApi';

/**
 * Modal para buscar y geocodificar direcciones manualmente
 * Permite al repartidor corregir o confirmar direcciones de pedidos sin coordenadas
 */
export default function AddressSearchModal({ visible, onClose, pedido, onSuccess }) {
  // Estados para campos individuales de dirección
  const [calle, setCalle] = useState('');
  const [numero, setNumero] = useState('');
  const [colonia, setColonia] = useState('');
  const [codigoPostal, setCodigoPostal] = useState('');
  const [municipio, setMunicipio] = useState('');
  const [ciudad, setCiudad] = useState('');

  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);

  const handleBuscar = async () => {
    // Validar que al menos haya un campo con información
    const tieneDatos = calle.trim() || numero.trim() || colonia.trim() ||
                       codigoPostal.trim() || municipio.trim() || ciudad.trim();

    if (!tieneDatos) {
      Alert.alert('Error', 'Ingresa al menos un campo de la dirección para buscar');
      return;
    }

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
        Alert.alert(
          'Dirección encontrada',
          `${result.direccionFormateada}\n\nConfianza: ${Math.round((result.confianza || 0) * 100)}%`,
          [
            {
              text: 'Usar esta dirección',
              onPress: () => {
                onSuccess && onSuccess(result);
                onClose();
              }
            },
            {
              text: 'Buscar otra',
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert('No encontrada', result.mensajeError || 'No se pudo encontrar la dirección');
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo buscar la dirección. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCerrar = () => {
    // Limpiar campos
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
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Buscar Dirección</Text>
            <TouchableOpacity onPress={handleCerrar} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#64748b" />
            </TouchableOpacity>
          </View>

          {/* Contenido */}
          <View style={styles.content}>
            {/* Info del pedido */}
            <View style={styles.pedidoInfo}>
              <Text style={styles.pedidoLabel}>Pedido:</Text>
              <Text style={styles.pedidoValue}>{pedido?.numeroGuia}</Text>
              <Text style={styles.pedidoDestinatario}>{pedido?.destinatario}</Text>
            </View>

            {/* Dirección original */}
            <View style={styles.direccionOriginal}>
              <Text style={styles.direccionOriginalLabel}>Dirección original:</Text>
              <Text style={styles.direccionOriginalText}>{pedido?.direccion}</Text>
            </View>

            {/* Dirección corregida anterior (si existe) */}
            {pedido?.direccionCorregida && (
              <View style={styles.direccionCorregidaAnterior}>
                <Text style={styles.direccionCorregidaLabel}>✅ Última corrección guardada:</Text>
                <Text style={styles.direccionCorregidaText}>{pedido.direccionCorregida}</Text>
              </View>
            )}

            {/* Campos individuales de dirección */}
            <View style={styles.searchSection}>
              <Text style={styles.label}>
                {pedido?.direccionCorregida ? 'Modificar dirección corregida:' : 'Corregir dirección:'}
              </Text>
              <Text style={styles.hint}>
                💡 Llena los campos que conozcas. No es necesario completar todos.
              </Text>

              <View style={styles.formRow}>
                <View style={styles.formFieldLarge}>
                  <Text style={styles.fieldLabel}>Calle</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={calle}
                    onChangeText={setCalle}
                    placeholder="Ej: Orense, Av. Universidad"
                  />
                </View>
                <View style={styles.formFieldSmall}>
                  <Text style={styles.fieldLabel}>Número</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={numero}
                    onChangeText={setNumero}
                    placeholder="125"
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
                    placeholder="Ej: Valencia, Residencial"
                  />
                </View>
                <View style={styles.formFieldSmall}>
                  <Text style={styles.fieldLabel}>C.P.</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={codigoPostal}
                    onChangeText={setCodigoPostal}
                    placeholder="67140"
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
                    placeholder="Ej: San Pedro"
                  />
                </View>
                <View style={styles.formFieldHalf}>
                  <Text style={styles.fieldLabel}>Ciudad</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={ciudad}
                    onChangeText={setCiudad}
                    placeholder="Monterrey"
                  />
                </View>
              </View>
            </View>

            {/* Resultado */}
            {resultado && resultado.exitoso && (
              <View style={styles.resultado}>
                <View style={styles.resultadoHeader}>
                  <Ionicons name="checkmark-circle" size={24} color="#10b981" />
                  <Text style={styles.resultadoTitle}>Dirección encontrada</Text>
                </View>
                <Text style={styles.resultadoDireccion}>{resultado.direccionFormateada}</Text>
                <View style={styles.resultadoStats}>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Confianza:</Text>
                    <View style={[
                      styles.confianzaBadge,
                      { backgroundColor: resultado.confianza >= 0.7 ? '#10b98120' : '#f59e0b20' }
                    ]}>
                      <Text style={[
                        styles.confianzaText,
                        { color: resultado.confianza >= 0.7 ? '#10b981' : '#f59e0b' }
                      ]}>
                        {Math.round((resultado.confianza || 0) * 100)}%
                      </Text>
                    </View>
                  </View>
                  <View style={styles.stat}>
                    <Text style={styles.statLabel}>Coordenadas:</Text>
                    <Text style={styles.statValue}>
                      {resultado.latitud?.toFixed(5)}, {resultado.longitud?.toFixed(5)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Botones */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.button, styles.buttonSecondary]}
                onPress={handleCerrar}
              >
                <Text style={styles.buttonSecondaryText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary, loading && styles.buttonDisabled]}
                onPress={handleBuscar}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <>
                    <Ionicons name="search" size={20} color="#ffffff" />
                    <Text style={styles.buttonPrimaryText}>Buscar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
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
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  pedidoInfo: {
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  pedidoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  pedidoValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  pedidoDestinatario: {
    fontSize: 14,
    color: '#475569',
  },
  direccionOriginal: {
    backgroundColor: '#fef3c7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  direccionOriginalLabel: {
    fontSize: 12,
    color: '#92400e',
    fontWeight: '600',
    marginBottom: 4,
  },
  direccionOriginalText: {
    fontSize: 13,
    color: '#78350f',
  },
  direccionCorregidaAnterior: {
    backgroundColor: '#d1fae5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  direccionCorregidaLabel: {
    fontSize: 12,
    color: '#065f46',
    fontWeight: '600',
    marginBottom: 4,
  },
  direccionCorregidaText: {
    fontSize: 13,
    color: '#047857',
  },
  searchSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#0f172a',
    minHeight: 80,
  },
  hint: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  formRow: {
    flexDirection: 'row',
    gap: 8,
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
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  fieldInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  resultado: {
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  resultadoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  resultadoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#15803d',
  },
  resultadoDireccion: {
    fontSize: 14,
    color: '#166534',
    marginBottom: 12,
  },
  resultadoStats: {
    gap: 8,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#15803d',
    fontWeight: '600',
  },
  statValue: {
    fontSize: 12,
    color: '#166534',
    fontFamily: 'monospace',
  },
  confianzaBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  confianzaText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  buttonPrimary: {
    backgroundColor: '#3b82f6',
  },
  buttonPrimaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
  },
  buttonSecondaryText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
