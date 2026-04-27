import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  TouchableOpacity,
  Image
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import SignaturePad from '../components/SignaturePad';
import AnimatedIcon, { ANIMATED_ICONS } from '../components/AnimatedIcon';
import { registrarIntentoEntrega, obtenerDetallePedido } from '../services/repartidorApi';
import { subirFirma, subirMultiplesFotos } from '../services/uploadService';
import { S3_ENABLED } from '../config/s3Config';

const ESTADOS_CONFIG = {
  PENDIENTE: { label: 'Pendiente', color: '#64748b', bgColor: '#f1f5f9' },
  EN_RUTA: { label: 'En ruta', color: '#2563eb', bgColor: '#dbeafe' },
  ENTREGADO: { label: 'Entregado', color: '#10b981', bgColor: '#d1fae5' },
  NO_ENTREGADO: { label: 'No entregado', color: '#ef4444', bgColor: '#fee2e2' }
};

const RECIBIDO_POR = {
  TITULAR: 'Titular',
  CONSULTORA: 'Consultora',
  FAMILIAR: 'Familiar',
  LIDER: 'Líder',
  GZ: 'G.Z.',
  VECINO: 'Vecino'
};

export default function PaqueteDetalleScreen({ route, navigation }) {
  const { paquete, ubicacion, onActualizarEstado } = route.params;

  const [nombreRecibe, setNombreRecibe] = useState(paquete.evidencias?.nombreRecibe || '');
  const [relacionRecibe, setRelacionRecibe] = useState(paquete.evidencias?.relacionRecibe || '');
  const [notasEntrega, setNotasEntrega] = useState(paquete.evidencias?.notasEntrega || '');
  const [motivoNoEntrega, setMotivoNoEntrega] = useState(paquete.evidencias?.motivoNoEntrega || '');
  const [fotos, setFotos] = useState(paquete.evidencias?.fotos || []);
  const [firma, setFirma] = useState(paquete.evidencias?.firma || '');
  const [loading, setLoading] = useState(false);

  // Datos completos de la boleta (cuando está entregado/no entregado)
  const [boletaCompleta, setBoletaCompleta] = useState(null);
  const [loadingBoleta, setLoadingBoleta] = useState(false);

  const estadoConfig = ESTADOS_CONFIG[paquete.estado] || ESTADOS_CONFIG.PENDIENTE;

  // Determinar si mostrar vista de boleta o vista de captura
  const esModoLectura = paquete.estado === 'ENTREGADO' || paquete.estado === 'NO_ENTREGADO';

  // Cargar datos completos de la boleta en modo lectura
  useEffect(() => {
    if (esModoLectura) {
      cargarBoletaCompleta();
    }
  }, [paquete.id, esModoLectura]);

  // Actualizar estados cuando cambian las evidencias del paquete
  useEffect(() => {
    if (paquete.evidencias) {
      setNombreRecibe(paquete.evidencias.nombreRecibe || '');
      setRelacionRecibe(paquete.evidencias.relacionRecibe || '');
      setNotasEntrega(paquete.evidencias.notasEntrega || '');
      setMotivoNoEntrega(paquete.evidencias.motivoNoEntrega || '');
      setFotos(paquete.evidencias.fotos || []);
      setFirma(paquete.evidencias.firma || '');
    }
  }, [paquete.evidencias]);

  const cargarBoletaCompleta = async () => {
    setLoadingBoleta(true);
    try {
      const boleta = await obtenerDetallePedido(paquete.id);
      setBoletaCompleta(boleta);
    } catch (error) {
      console.error('Error al cargar boleta completa:', error);
      Alert.alert('Error', 'No se pudo cargar el detalle completo de la boleta.');
    } finally {
      setLoadingBoleta(false);
    }
  };

  const formatearFecha = (isoString) => {
    if (!isoString) return null;
    const fecha = new Date(isoString);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const año = fecha.getFullYear();
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${dia}/${mes}/${año} ${horas}:${minutos}`;
  };

  const formatearFechaSola = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatearHora = (fecha) => {
    if (!fecha) return '-';
    const date = new Date(fecha);
    return date.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
      mediaTypes: ['images'],
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
    if (nuevoEstado === 'ENTREGADO') {
      if (!nombreRecibe.trim()) {
        Alert.alert('Error', 'Agrega el nombre de quien recibe antes de marcar como entregado.');
        return;
      }
      if (!relacionRecibe) {
        Alert.alert('Error', 'Selecciona quién recibió el pedido.');
        return;
      }
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
              // Subir evidencias a S3 (o usar base64 si S3 está deshabilitado)
              let firmaUrl = null;
              let fotosUrls = [];

              // Subir firma (si existe)
              if (firma) {
                console.log(`[EVIDENCIAS] Subiendo firma... (S3: ${S3_ENABLED ? 'Habilitado' : 'Deshabilitado'})`);
                firmaUrl = await subirFirma({
                  dataURI: firma,
                  pedidoId: paquete.id,
                });
              }

              // Subir fotos (si existen)
              if (fotos.length > 0) {
                console.log(`[EVIDENCIAS] Subiendo ${fotos.length} foto(s)... (S3: ${S3_ENABLED ? 'Habilitado' : 'Deshabilitado'})`);
                fotosUrls = await subirMultiplesFotos({
                  fotos,
                  pedidoId: paquete.id,
                });
              }

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
                fotoEvidenciaUrl: fotosUrls.length > 0 ? fotosUrls[0].url : null,
                firmaUrl: firmaUrl,
                nombreReceptor: nombreRecibe || null,
                recibidoPor: relacionRecibe || null
              });

              // Actualizar estado local
              onActualizarEstado(paquete.id, nuevoEstado, {
                nombreRecibe,
                relacionRecibe,
                notasEntrega,
                motivoNoEntrega,
                fotos,
                firma
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

  // Renderizar según el modo
  if (esModoLectura) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          <VistaBoletaDespacho
            paquete={paquete}
            boleta={boletaCompleta}
            loading={loadingBoleta}
            estadoConfig={estadoConfig}
            formatearFechaSola={formatearFechaSola}
            formatearHora={formatearHora}
          />
        </ScrollView>
      </View>
    );
  }

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
          {paquete.evidencias?.fechaEntrega && (
            <Text style={styles.fechaEntrega}>
              ✅ Entregado: {formatearFecha(paquete.evidencias.fechaEntrega)}
            </Text>
          )}
          {paquete.evidencias?.fechaNoEntrega && (
            <Text style={styles.fechaNoEntrega}>
              ❌ No entregado: {formatearFecha(paquete.evidencias.fechaNoEntrega)}
            </Text>
          )}
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
            <View style={styles.callButtonContent}>
              <AnimatedIcon
                source={{ uri: ANIMATED_ICONS.phone }}
                size={32}
                autoPlay={true}
                loop={true}
              />
              <Text style={styles.callButtonText}>Llamar</Text>
            </View>
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

          <View style={styles.recibidoPorSection}>
            <Text style={styles.recibidoPorTitulo}>Recibido por:</Text>
            <View style={styles.recibidoPorOpciones}>
              {Object.entries(RECIBIDO_POR).map(([key, label]) => (
                <TouchableOpacity
                  key={key}
                  style={styles.recibidoPorOpcion}
                  onPress={() => setRelacionRecibe(key)}
                  activeOpacity={0.7}
                >
                  <View style={[
                    styles.checkbox,
                    relacionRecibe === key && styles.checkboxChecked
                  ]}>
                    {relacionRecibe === key && <Text style={styles.checkboxCheck}>✓</Text>}
                  </View>
                  <Text style={styles.recibidoPorLabel}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

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
            <TouchableOpacity style={styles.photoButton} onPress={handleTomarFoto}>
              <View style={styles.photoButtonContent}>
                <AnimatedIcon
                  source={{ uri: ANIMATED_ICONS.camera }}
                  size={40}
                  autoPlay={true}
                  loop={true}
                />
                <Text style={styles.photoButtonText}>Tomar Foto</Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Firma digital */}
          <View style={styles.signatureSection}>
            <SignaturePad value={firma} onChange={setFirma} />
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
            loading={loading}
            style={styles.actionButton}
          />

          <Button
            title="❌ No Entregado"
            onPress={() => handleCambiarEstado('NO_ENTREGADO')}
            variant="danger"
            loading={loading}
            style={styles.actionButton}
          />
        </View>
      </ScrollView>
    </View>
  );
}

// ============================================================================
// VISTA DE BOLETA DE DESPACHO (Modo Lectura)
// ============================================================================

function VistaBoletaDespacho({ paquete, boleta, loading, estadoConfig, formatearFechaSola, formatearHora }) {
  if (loading || !boleta) {
    return (
      <Card style={styles.section}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando boleta de despacho...</Text>
        </View>
      </Card>
    );
  }

  return (
    <>
      {/* Encabezado */}
      <Card style={styles.boletaHeader}>
        <View style={styles.boletaHeaderRow}>
          <View style={styles.boletaInfoGroup}>
            <Text style={styles.boletaLabel}>Consultora</Text>
            <Text style={styles.boletaValue}>{boleta.numeroConsultora || boleta.consultora || '-'}</Text>
          </View>
          <View style={styles.boletaInfoGroup}>
            <Text style={styles.boletaLabel}>Territorio</Text>
            <Text style={styles.boletaValue}>{boleta.territorio || '-'}</Text>
          </View>
        </View>

        <Text style={styles.boletaNombre}>{boleta.nombreConsultora || 'Sin nombre'}</Text>
        <Text style={styles.boletaDireccion}>{boleta.direccion || boleta.direccionConsultora || 'Sin dirección'}</Text>

        <View style={styles.boletaTelefonoContainer}>
          <Text style={styles.boletaLabel}>Teléfono: </Text>
          <Text style={styles.boletaValue}>{boleta.telefono || '-'}</Text>
        </View>
      </Card>

      {/* Título Boleta de Despacho */}
      <Card style={styles.boletaTitulo}>
        <Text style={styles.boletaTituloText}>BOLETA DE DESPACHO</Text>
        <Text style={styles.boletaNumeroPedido}>[{boleta.numeroPedido || paquete.numeroPedido || '-'}]</Text>
      </Card>

      {/* Información del Pedido */}
      <Card style={styles.section}>
        <View style={styles.boletaRow}>
          <View style={styles.boletaCampo}>
            <Text style={styles.boletaLabel}>Campaña:</Text>
            <Text style={styles.boletaValueText}>{boleta.campana || boleta.campania || '-'}</Text>
          </View>
          <View style={styles.boletaCampo}>
            <Text style={styles.boletaLabel}>Fecha de emisión:</Text>
            <Text style={styles.boletaValueText}>{formatearFechaSola(boleta.fechaEmision)}</Text>
          </View>
        </View>

        <View style={styles.boletaRow}>
          <View style={styles.boletaCampo}>
            <Text style={styles.boletaLabel}>Total Cajas:</Text>
            <Text style={styles.boletaValueDestacado}>{boleta.totalCajas || paquete.piezas || 0}</Text>
          </View>
          <View style={styles.boletaCampo}>
            <Text style={styles.boletaLabel}>Total Unidades fuera de caja:</Text>
            <Text style={styles.boletaValueText}>{boleta.totalUnidadesFuera || boleta.totalUnidadesFueraCaja || '-'}</Text>
          </View>
        </View>

        <View style={styles.boletaRow}>
          <View style={styles.boletaCampo}>
            <Text style={styles.boletaLabel}>Fecha de recepción:</Text>
            <Text style={styles.boletaValueText}>{formatearFechaSola(boleta.fechaRecepcion)}</Text>
          </View>
          <View style={styles.boletaCampo}>
            <Text style={styles.boletaLabel}>Hora Recepción:</Text>
            <Text style={styles.boletaValueText}>{formatearHora(boleta.fechaRecepcion)}</Text>
          </View>
        </View>
      </Card>

      {/* Estado */}
      <Card style={styles.section}>
        <Text style={styles.boletaLabel}>Estado:</Text>
        <View style={[styles.badge, { backgroundColor: estadoConfig.bgColor, marginTop: 8 }]}>
          <Text style={[styles.badgeText, { color: estadoConfig.color }]}>
            {estadoConfig.label}
          </Text>
        </View>
      </Card>

      {/* Recibido por */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Recibido por:</Text>
        <View style={styles.recibidoPorOpciones}>
          {Object.entries(RECIBIDO_POR).map(([key, label]) => (
            <View key={key} style={styles.recibidoPorOpcion}>
              <View style={[
                styles.checkbox,
                boleta.recibidoPor === key && styles.checkboxChecked
              ]}>
                {boleta.recibidoPor === key && <Text style={styles.checkboxCheck}>✓</Text>}
              </View>
              <Text style={styles.recibidoPorLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {boleta.nombreReceptor && (
          <View style={styles.receptorInfo}>
            <Text style={styles.boletaLabel}>Parentesco/Nombre:</Text>
            <Text style={styles.boletaValueText}>{boleta.nombreReceptor}</Text>
          </View>
        )}

        {boleta.observaciones && (
          <View style={styles.observacionesContainer}>
            <Text style={styles.boletaLabel}>Observaciones:</Text>
            <Text style={styles.boletaValueText}>{boleta.observaciones}</Text>
          </View>
        )}
      </Card>

      {/* Firma */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Firma del receptor</Text>
        {boleta.firmaUrl ? (
          <View style={styles.firmaContainer}>
            <Image
              source={{ uri: boleta.firmaUrl }}
              style={styles.firmaImage}
              resizeMode="contain"
            />
          </View>
        ) : (
          <View style={styles.firmaLineaContainer}>
            <View style={styles.firmaLinea} />
            <Text style={styles.firmaTexto}>Firma</Text>
          </View>
        )}
      </Card>

      {/* Botón para ver foto (deshabilitado) */}
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Evidencia Fotográfica</Text>
        <TouchableOpacity
          style={[styles.fotoButton, styles.fotoButtonDisabled]}
          disabled={true}
        >
          <Text style={styles.fotoButtonText}>📷 Ver Foto de Entrega</Text>
          <Text style={styles.fotoButtonSubtext}>(Próximamente - Requiere S3)</Text>
        </TouchableOpacity>
      </Card>

      {/* Productos AFP */}
      {boleta.productos && boleta.productos.length > 0 && (
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>
            SE ADJUNTAN {boleta.totalCajas || 0} UNIDADES FUERA DE LA CAJA Y/O PREMIOS
          </Text>
          <View style={styles.productosTabla}>
            <View style={styles.productosTablaHeader}>
              <Text style={[styles.productosTablaHeaderCell, { flex: 1 }]}>UNID</Text>
              <Text style={[styles.productosTablaHeaderCell, { flex: 1 }]}>IND</Text>
              <Text style={[styles.productosTablaHeaderCell, { flex: 3 }]}>DESCRIPCION DEL PRODUCTO</Text>
            </View>
            {boleta.productos.map((producto, index) => (
              <View key={index} style={styles.productosTablaRow}>
                <Text style={[styles.productosTablaCell, { flex: 1 }]}>{producto.cantidad || '-'}</Text>
                <Text style={[styles.productosTablaCell, { flex: 1 }]}>{producto.indicador || '-'}</Text>
                <Text style={[styles.productosTablaCell, { flex: 3 }]}>{producto.descripcion || '-'}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* Info del Repartidor */}
      {boleta.nombreRepartidor && (
        <Card style={styles.section}>
          <Text style={styles.boletaLabel}>Repartidor asignado:</Text>
          <Text style={styles.boletaValueText}>{boleta.nombreRepartidor}</Text>
          {boleta.ruta && (
            <Text style={styles.boletaValueText}>Ruta: {boleta.ruta}</Text>
          )}
        </Card>
      )}
    </>
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
  fechaEntrega: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  fechaNoEntrega: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
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
  callButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  callButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  photoButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  photoButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  photoButtonText: {
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
  signatureSection: {
    marginTop: 16,
  },
  recibidoPorSection: {
    marginBottom: 16,
  },
  recibidoPorTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
    marginBottom: 12,
  },
  actions: {
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    minHeight: 52,
  },
  // ============================================================================
  // ESTILOS PARA VISTA DE BOLETA DE DESPACHO
  // ============================================================================
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
  },
  boletaHeader: {
    marginBottom: 12,
  },
  boletaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  boletaInfoGroup: {
    flex: 1,
  },
  boletaLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
    marginBottom: 2,
  },
  boletaValue: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '700',
  },
  boletaNombre: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 6,
  },
  boletaDireccion: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 6,
  },
  boletaTelefonoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boletaTitulo: {
    marginBottom: 12,
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },
  boletaTituloText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 1,
  },
  boletaNumeroPedido: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
    marginTop: 4,
  },
  boletaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  boletaCampo: {
    flex: 1,
  },
  boletaValueText: {
    fontSize: 14,
    color: '#0f172a',
    marginTop: 2,
  },
  boletaValueDestacado: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2563eb',
    marginTop: 2,
  },
  recibidoPorOpciones: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
    marginBottom: 12,
  },
  recibidoPorOpcion: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: '45%',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkboxCheck: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  recibidoPorLabel: {
    fontSize: 14,
    color: '#334155',
  },
  receptorInfo: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  observacionesContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  firmaContainer: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#f8fafc',
    minHeight: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  firmaImage: {
    width: '100%',
    height: 140,
  },
  firmaLineaContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  firmaLinea: {
    width: '80%',
    height: 2,
    backgroundColor: '#0f172a',
    marginBottom: 8,
  },
  firmaTexto: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  fotoButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  fotoButtonDisabled: {
    backgroundColor: '#94a3b8',
    opacity: 0.6,
  },
  fotoButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  fotoButtonSubtext: {
    color: '#e2e8f0',
    fontSize: 12,
    marginTop: 4,
  },
  productosTabla: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    overflow: 'hidden',
  },
  productosTablaHeader: {
    flexDirection: 'row',
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  productosTablaHeaderCell: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  productosTablaRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  productosTablaCell: {
    fontSize: 12,
    color: '#334155',
    textAlign: 'center',
  },
});
