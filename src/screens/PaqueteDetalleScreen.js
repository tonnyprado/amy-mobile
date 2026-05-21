import { useState, useEffect } from 'react';
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
import { Ionicons } from '@expo/vector-icons';
import { Van } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Badge from '../components/ui/Badge';
// import SignaturePad from '../components/SignaturePad'; // Deshabilitado por ahora
import AnimatedIcon, { ANIMATED_ICONS } from '../components/AnimatedIcon';
import AddressSearchModal from '../components/AddressSearchModal';
import AuthenticatedImage from '../components/AuthenticatedImage';
import { registrarIntentoEntrega, obtenerDetallePedido } from '../services/repartidorApi';
import { subirFirma, subirMultiplesFotos } from '../services/uploadService';
import { S3_ENABLED } from '../config/s3Config';
import { optimizarImagenLocal } from '../utils/fileHelpers';
import theme from '../theme';

const ESTADOS_CONFIG = {
  PENDIENTE: { label: 'Pendiente', variant: 'neutral' },
  EN_RUTA: { label: 'En ruta', variant: 'info' },
  ENTREGADO: { label: 'Entregado', variant: 'success' },
  NO_ENTREGADO: { label: 'No entregado', variant: 'error' }
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
  const { paquete: paqueteInicial, ubicacion } = route.params;

  // Estado local del paquete (para poder actualizarlo cuando se geocodifica)
  const [paquete, setPaquete] = useState(paqueteInicial);

  const [nombreRecibe, setNombreRecibe] = useState(paquete.evidencias?.nombreRecibe || '');
  const [relacionRecibe, setRelacionRecibe] = useState(paquete.evidencias?.relacionRecibe || '');
  const [notasEntrega, setNotasEntrega] = useState(paquete.evidencias?.notasEntrega || '');
  const [motivoNoEntrega, setMotivoNoEntrega] = useState(paquete.evidencias?.motivoNoEntrega || '');
  const [fotos, setFotos] = useState(paquete.evidencias?.fotos || []);
  // const [firma, setFirma] = useState(paquete.evidencias?.firma || ''); // Firma deshabilitada por ahora
  const [loading, setLoading] = useState(false);

  // Datos completos de la boleta (para obtener productos/AFP's)
  const [boletaCompleta, setBoletaCompleta] = useState(null);
  const [loadingBoleta, setLoadingBoleta] = useState(false);

  // Modal de búsqueda de dirección
  const [showAddressSearch, setShowAddressSearch] = useState(false);

  const estadoConfig = ESTADOS_CONFIG[paquete.estado] || ESTADOS_CONFIG.PENDIENTE;

  // DESHABILITADO: Por ahora solo usamos la vista simplificada para repartidores
  // const esModoLectura = paquete.estado === 'ENTREGADO' || paquete.estado === 'NO_ENTREGADO';
  const esModoLectura = false; // Siempre usar vista simplificada

  // Cargar datos completos de la boleta (siempre, para obtener AFP's)
  useEffect(() => {
    cargarBoletaCompleta();
  }, [paquete.id]);

  // Actualizar estados cuando cambian las evidencias del paquete
  useEffect(() => {
    if (paquete.evidencias) {
      setNombreRecibe(paquete.evidencias.nombreRecibe || '');
      setRelacionRecibe(paquete.evidencias.relacionRecibe || '');
      setNotasEntrega(paquete.evidencias.notasEntrega || '');
      setMotivoNoEntrega(paquete.evidencias.motivoNoEntrega || '');
      setFotos(paquete.evidencias.fotos || []);
      // setFirma(paquete.evidencias.firma || ''); // Firma deshabilitada
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

  const handleDireccionEncontrada = (resultado) => {
    // Actualizar el paquete local con las nuevas coordenadas y dirección corregida
    setPaquete(prev => ({
      ...prev,
      latitud: resultado.latitud,
      longitud: resultado.longitud,
      direccionCorregida: resultado.direccionOriginal !== prev.direccion ? resultado.direccionOriginal : null
    }));

    Alert.alert(
      'Éxito',
      'Dirección actualizada correctamente. Las coordenadas GPS se han guardado.',
      [{ text: 'OK' }]
    );
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
      quality: 0.55,
    });

    if (!result.canceled && result.assets[0]) {
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
              // let firmaUrl = null; // Firma deshabilitada por ahora
              let fotosUrls = [];

              // DESHABILITADO: Subir firma
              // if (firma) {
              //   console.log(`[EVIDENCIAS] Subiendo firma... (S3: ${S3_ENABLED ? 'Habilitado' : 'Deshabilitado'})`);
              //   firmaUrl = await subirFirma({
              //     dataURI: firma,
              //     pedidoId: paquete.id,
              //   });
              // }

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
                firmaUrl: null, // Firma deshabilitada por ahora
                nombreReceptor: nombreRecibe || null,
                recibidoPor: relacionRecibe || null
              });

              // Navegar de regreso - la lista se actualizará automáticamente
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

  // DESHABILITADO: Vista de boleta completa comentada por ahora
  // if (esModoLectura) {
  //   return (
  //     <View style={styles.container}>
  //       <StatusBar style="light" />
  //       <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
  //         <VistaBoletaDespacho
  //           paquete={paquete}
  //           boleta={boletaCompleta}
  //           loading={loadingBoleta}
  //           estadoConfig={estadoConfig}
  //           formatearFechaSola={formatearFechaSola}
  //           formatearHora={formatearHora}
  //         />
  //       </ScrollView>
  //     </View>
  //   );
  // }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Card style={styles.headerCard}>
          <View style={styles.headerRow}>
            <Van size={24} color={theme.colors.primary} />
            <Text style={styles.guia}>{paquete.numeroGuia}</Text>
          </View>
          <Badge label={estadoConfig.label} variant={estadoConfig.variant} />
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

        {/* Datos de la Boleta */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Datos de la Boleta</Text>
          <InfoRow label="Cliente" value={paquete.destinatario} />
          <InfoRow label="Teléfono" value={paquete.telefono} />
          <InfoRow label="Dirección" value={paquete.direccion} />
          {paquete.direccionCorregida && (
            <View style={styles.direccionCorregidaInfo}>
              <Text style={styles.direccionCorregidaLabel}>✅ Dirección corregida:</Text>
              <Text style={styles.direccionCorregidaValue}>{paquete.direccionCorregida}</Text>
            </View>
          )}
          <InfoRow label="Referencia" value={paquete.referencia} />
          {boletaCompleta && (
            <>
              <InfoRow label="Número de Pedido" value={boletaCompleta.numeroPedido || paquete.numeroPedido || '-'} />
              <InfoRow label="Campaña" value={boletaCompleta.campana || boletaCompleta.campania || '-'} />
              <InfoRow label="Total Cajas" value={String(boletaCompleta.totalCajas || paquete.piezas || 0)} />
            </>
          )}

          <View style={styles.clienteActions}>
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

            <TouchableOpacity
              style={[
                styles.addressButton,
                paquete.direccionCorregida && styles.addressButtonCorrected
              ]}
              onPress={() => setShowAddressSearch(true)}
            >
              <View style={styles.addressButtonContent}>
                <AnimatedIcon
                  source={{ uri: paquete.direccionCorregida ? ANIMATED_ICONS.check : ANIMATED_ICONS.search }}
                  size={28}
                  autoPlay={true}
                  loop={true}
                />
                <Text style={styles.addressButtonText}>
                  {paquete.direccionCorregida ? 'Modificar Dirección' : 'Corregir Dirección'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </Card>

        {/* AFP's y Valijas */}
        {boletaCompleta && boletaCompleta.productos && boletaCompleta.productos.length > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>📦 AFP's / Valijas / Premios</Text>
            <View style={styles.afpInfoContainer}>
              <Text style={styles.afpInfoText}>
                ⚠️ Este pedido incluye {boletaCompleta.productos.length} {boletaCompleta.productos.length === 1 ? 'artículo' : 'artículos'} fuera de caja
              </Text>
            </View>
            <View style={styles.productosTabla}>
              <View style={styles.productosTablaHeader}>
                <Text style={[styles.productosTablaHeaderCell, { flex: 1 }]}>UNID</Text>
                <Text style={[styles.productosTablaHeaderCell, { flex: 1 }]}>IND</Text>
                <Text style={[styles.productosTablaHeaderCell, { flex: 3 }]}>DESCRIPCIÓN</Text>
              </View>
              {boletaCompleta.productos.map((producto, index) => (
                <View key={index} style={styles.productosTablaRow}>
                  <Text style={[styles.productosTablaCell, { flex: 1 }]}>{producto.unidades || producto.cantidad || '-'}</Text>
                  <Text style={[styles.productosTablaCell, { flex: 1 }]}>{producto.indice || producto.indicador || '-'}</Text>
                  <Text style={[styles.productosTablaCell, { flex: 3 }]}>{producto.descripcion || '-'}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}

        {/* Checklist: Quien recibió */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Checklist de Entrega</Text>

          <View style={styles.recibidoPorSection}>
            <Text style={styles.recibidoPorTitulo}>¿Quién recibió el pedido?</Text>
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
            label="Nombre de quien recibe *"
            value={nombreRecibe}
            onChangeText={setNombreRecibe}
            placeholder="Ej. Ana López"
          />
        </Card>

        {/* Foto de evidencia */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📷 Foto de Evidencia de Entrega</Text>
          <View style={styles.photoSection}>
            <Text style={styles.photoLabel}>Fotos capturadas: {fotos.length}</Text>
            <TouchableOpacity style={styles.photoButton} onPress={handleTomarFoto}>
              <View style={styles.photoButtonContent}>
                <AnimatedIcon
                  source={{ uri: ANIMATED_ICONS.camera }}
                  size={40}
                  autoPlay={true}
                  loop={true}
                />
                <Text style={styles.photoButtonText}>Tomar Foto de Entrega</Text>
              </View>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Observaciones */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>📝 Observaciones</Text>

          <Input
            label="Notas de entrega"
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
        </Card>

        {/* Botones de Estado del Pedido */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Estado del Pedido</Text>
          <View style={styles.actions}>
            <Button
              title="🚚 En Ruta"
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
        </Card>
      </ScrollView>

      {/* Modal de búsqueda/corrección de dirección */}
      <AddressSearchModal
        visible={showAddressSearch}
        onClose={() => setShowAddressSearch(false)}
        pedido={paquete}
        onSuccess={handleDireccionEncontrada}
      />
    </View>
  );
}

// ============================================================================
// VISTA DE BOLETA DE DESPACHO (Modo Lectura) - DESHABILITADA POR AHORA
// ============================================================================
// Esta vista completa de boleta está comentada para simplificar la experiencia
// del repartidor. Por ahora solo usamos la vista simplificada de captura.

/*
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

      <Card style={styles.boletaTitulo}>
        <Text style={styles.boletaTituloText}>BOLETA DE DESPACHO</Text>
        <Text style={styles.boletaNumeroPedido}>[{boleta.numeroPedido || paquete.numeroPedido || '-'}]</Text>
      </Card>

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

      <Card style={styles.section}>
        <Text style={styles.boletaLabel}>Estado:</Text>
        <View style={[styles.badge, { backgroundColor: estadoConfig.bgColor, marginTop: 8 }]}>
          <Text style={[styles.badgeText, { color: estadoConfig.color }]}>
            {estadoConfig.label}
          </Text>
        </View>
      </Card>

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

      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>Firma del receptor</Text>
        {boleta.firmaUrl ? (
          <View style={styles.firmaContainer}>
            <AuthenticatedImage
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
*/

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
    backgroundColor: theme.colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxxl,
  },
  headerCard: {
    marginBottom: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  guia: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  fechaEntrega: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.success,
    fontWeight: theme.typography.weights.semibold,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  fechaNoEntrega: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.error,
    fontWeight: theme.typography.weights.semibold,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  resumen: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.sm,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    marginBottom: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textPrimary,
  },
  direccionCorregidaInfo: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  direccionCorregidaLabel: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.success,
    fontWeight: theme.typography.weights.semibold,
    marginBottom: theme.spacing.xs,
  },
  direccionCorregidaValue: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.medium,
  },
  clienteActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  callButton: {
    flex: 1,
    backgroundColor: theme.colors.success,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  addressButton: {
    flex: 1,
    backgroundColor: theme.colors.warning,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  addressButtonCorrected: {
    backgroundColor: theme.colors.info,
  },
  callButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  callButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
  },
  addressButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  addressButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
  },
  photoButton: {
    backgroundColor: theme.colors.info,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  photoButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  photoButtonText: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
  },
  photoSection: {
    marginTop: theme.spacing.sm,
  },
  photoLabel: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  signatureSection: {
    marginTop: 16,
  },
  recibidoPorSection: {
    marginBottom: theme.spacing.lg,
  },
  recibidoPorTitulo: {
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  afpInfoContainer: {
    backgroundColor: theme.colors.surfaceElevated,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.info,
  },
  afpInfoText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.info,
    fontWeight: theme.typography.weights.semibold,
  },
  actions: {
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
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
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
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
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.xs,
    marginRight: theme.spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  checkboxChecked: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  checkboxCheck: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.base,
    fontWeight: theme.typography.weights.bold,
  },
  recibidoPorLabel: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textPrimary,
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
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
  },
  productosTablaHeader: {
    flexDirection: 'row',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
  },
  productosTablaHeaderCell: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    textAlign: 'center',
  },
  productosTablaRow: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  productosTablaCell: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textPrimary,
    textAlign: 'center',
  },
});
