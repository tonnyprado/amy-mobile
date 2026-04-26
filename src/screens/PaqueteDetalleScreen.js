import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  TouchableOpacity
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { registrarIntentoEntrega } from '../services/repartidorApi';

const ESTADOS_CONFIG = {
  PENDIENTE: { label: 'Pendiente', color: '#64748b' },
  EN_RUTA: { label: 'En ruta', color: '#2563eb' },
  ENTREGADO: { label: 'Entregado', color: '#10b981' },
  NO_ENTREGADO: { label: 'No entregado', color: '#ef4444' }
};

export default function PaqueteDetalleScreen({ route, navigation }) {
  const { paquete, ubicacion, onActualizarEstado } = route.params;

  const [nombreRecibe, setNombreRecibe] = useState(paquete.evidencias?.nombreRecibe || '');
  const [relacionRecibe, setRelacionRecibe] = useState(paquete.evidencias?.relacionRecibe || '');
  const [notasEntrega, setNotasEntrega] = useState(paquete.evidencias?.notasEntrega || '');
  const [motivoNoEntrega, setMotivoNoEntrega] = useState(paquete.evidencias?.motivoNoEntrega || '');
  const [fotos, setFotos] = useState(paquete.evidencias?.fotos || []);
  const [loading, setLoading] = useState(false);

  const estadoConfig = ESTADOS_CONFIG[paquete.estado] || ESTADOS_CONFIG.PENDIENTE;

  const handleLlamar = () => {
    Linking.openURL(`tel:${paquete.telefono}`);
  };

  const handleTomarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permisos', 'Se necesitan permisos de cámara para tomar fotos');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setFotos([...fotos, {
        id: Date.now().toString(),
        uri: result.assets[0].uri,
        name: `foto_${Date.now()}.jpg`
      }]);
    }
  };

  const handleCambiarEstado = async (nuevoEstado) => {
    // Validaciones
    if (nuevoEstado === 'ENTREGADO' && !nombreRecibe.trim()) {
      Alert.alert('Error', 'Agrega el nombre de quien recibe antes de marcar como entregado.');
      return;
    }

    if (nuevoEstado === 'NO_ENTREGADO' && !motivoNoEntrega.trim()) {
      Alert.alert('Error', 'Escribe el motivo de no entrega.');
      return;
    }

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
              // Registrar intento en backend
              await registrarIntentoEntrega({
                pedidoId: paquete.id,
                latitudIntento: ubicacion?.latitud || null,
                longitudIntento: ubicacion?.longitud || null,
                resultado: nuevoEstado,
                motivoFallo: nuevoEstado === 'NO_ENTREGADO' ?
                  (motivoNoEntrega.toLowerCase().includes('no estaba') ? 'CLIENTE_NO_ESTABA' : 'OTRA_RAZON')
                  : null,
                descripcionFallo: nuevoEstado === 'NO_ENTREGADO' ? motivoNoEntrega : null,
                observaciones: notasEntrega || null,
                fotoEvidenciaUrl: null, // Por implementar upload
                firmaUrl: null
              });

              // Actualizar estado local
              onActualizarEstado(paquete.id, nuevoEstado, {
                nombreRecibe,
                relacionRecibe,
                notasEntrega,
                motivoNoEntrega,
                fotos
              });

              Alert.alert(
                'Éxito',
                `Pedido marcado como ${ESTADOS_CONFIG[nuevoEstado].label}`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              console.error('Error:', error);
              Alert.alert('Error', 'No se pudo actualizar el estado. Intenta de nuevo.');
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
      <StatusBar style="light" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <Text style={styles.guia}>{paquete.numeroGuia}</Text>
          <View style={[styles.badge, { backgroundColor: `${estadoConfig.color}20` }]}>
            <Text style={[styles.badgeText, { color: estadoConfig.color }]}>
              {estadoConfig.label}
            </Text>
          </View>
          <Text style={styles.resumen}>{paquete.resumen}</Text>
        </Card>

        {/* Información del cliente */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Cliente</Text>
          <InfoRow label="Nombre" value={paquete.destinatario} />
          <InfoRow label="Teléfono" value={paquete.telefono} />
          <InfoRow label="Dirección" value={paquete.direccion} />
          <InfoRow label="Referencia" value={paquete.referencia} />

          <TouchableOpacity style={styles.callButton} onPress={handleLlamar}>
            <Text style={styles.callButtonText}>📞 Llamar</Text>
          </TouchableOpacity>
        </Card>

        {/* Evidencia de entrega */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Evidencia de Entrega</Text>

          <Input
            label="Nombre de quien recibe"
            value={nombreRecibe}
            onChangeText={setNombreRecibe}
            placeholder="Ej. Ana López"
          />

          <Input
            label="Relación con el pedido"
            value={relacionRecibe}
            onChangeText={setRelacionRecibe}
            placeholder="Titular, recepción, familiar..."
          />

          <Input
            label="Notas / observaciones"
            value={notasEntrega}
            onChangeText={setNotasEntrega}
            placeholder="Detalles relevantes de la entrega"
            multiline
            numberOfLines={3}
            style={{ height: 80 }}
          />

          <Input
            label="Motivo de no entrega"
            value={motivoNoEntrega}
            onChangeText={setMotivoNoEntrega}
            placeholder="Solo si no se pudo entregar"
            multiline
            numberOfLines={2}
            style={{ height: 60 }}
          />

          <View style={styles.photoSection}>
            <Text style={styles.photoLabel}>Fotos ({fotos.length})</Text>
            <Button
              title="📷 Tomar Foto"
              onPress={handleTomarFoto}
              variant="secondary"
            />
          </View>
        </Card>

        {/* Acciones */}
        <View style={styles.actions}>
          <Button
            title="En Ruta"
            onPress={() => handleCambiarEstado('EN_RUTA')}
            variant="primary"
            disabled={paquete.estado === 'EN_RUTA' || loading}
            style={styles.actionButton}
          />

          <Button
            title="✅ Entregado"
            onPress={() => handleCambiarEstado('ENTREGADO')}
            variant="success"
            loading={loading && 'ENTREGADO'}
            style={styles.actionButton}
          />

          <Button
            title="❌ No Entregado"
            onPress={() => handleCambiarEstado('NO_ENTREGADO')}
            variant="danger"
            loading={loading && 'NO_ENTREGADO'}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  headerCard: {
    marginBottom: 16,
  },
  guia: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 8,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  resumen: {
    fontSize: 14,
    color: '#64748b',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  infoRow: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#0f172a',
  },
  callButton: {
    backgroundColor: '#10b981',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  photoSection: {
    marginTop: 8,
  },
  photoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 8,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    minHeight: 52,
  },
});
