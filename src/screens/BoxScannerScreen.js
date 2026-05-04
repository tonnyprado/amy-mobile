/**
 * BoxScannerScreen - Escáner de etiquetas de cajas con OCR en tiempo real
 *
 * Usa Vision Camera + OCR plugin para detectar texto en tiempo real
 * mientras la cámara está activa (sin tomar fotos).
 * Detecta RUTA, DIRECCIÓN y CONSULTORA, busca información y muestra resultado.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Vibration,
  Dimensions,
  Platform,
} from 'react-native';
import { Camera, useCameraDevice, useFrameProcessor } from 'react-native-vision-camera';
import { OCRFrame, scanOCR } from 'vision-camera-ocr';
import { runOnJS } from 'react-native-worklets-core';
import * as Speech from 'expo-speech';
import { StatusBar } from 'expo-status-bar';
import { buscarInformacionCaja } from '../services/adminApi';

const { width, height } = Dimensions.get('window');

export default function BoxScannerScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [textoDetectado, setTextoDetectado] = useState('');
  const [bloqueTextos, setbloqueTextos] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [mostrandoResultado, setMostrandoResultado] = useState(false);

  const lastProcessTime = useRef(0);
  const device = useCameraDevice('back');

  // ============================================================================
  // PERMISOS Y CONFIGURACIÓN INICIAL
  // ============================================================================

  useEffect(() => {
    checkCameraPermission();

    return () => {
      Speech.stop();
    };
  }, []);

  const checkCameraPermission = async () => {
    const status = await Camera.getCameraPermissionStatus();

    if (status === 'granted') {
      setHasPermission(true);
    } else {
      const permission = await Camera.requestCameraPermission();
      setHasPermission(permission === 'granted');

      if (permission !== 'granted') {
        Alert.alert(
          'Permiso Requerido',
          'La cámara es necesaria para escanear etiquetas',
          [
            { text: 'Cancelar', onPress: () => navigation.goBack() },
            { text: 'Intentar Nuevamente', onPress: checkCameraPermission }
          ]
        );
      }
    }
  };

  // ============================================================================
  // OCR EN TIEMPO REAL CON FRAME PROCESSOR
  // ============================================================================

  const procesarTextoDetectado = (data) => {
    try {
      if (!data || !data.result || !data.result.text) return;

      const textoCompleto = data.result.text;
      setTextoDetectado(textoCompleto);

      // Actualizar bloques de texto para visualización
      if (data.result.blocks) {
        setbloqueTextos(data.result.blocks);
      }

      // Limitar procesamiento a cada 2 segundos
      const now = Date.now();
      if (now - lastProcessTime.current < 2000) return;
      lastProcessTime.current = now;

      // Parsear etiqueta
      const datosEtiqueta = parsearTextoEtiqueta(textoCompleto);

      // Si tenemos datos completos, buscar
      if (datosEtiqueta.ruta && datosEtiqueta.direccion && datosEtiqueta.consultora) {
        console.log('✅ Etiqueta completa detectada:', datosEtiqueta);
        buscarYMostrarResultado(datosEtiqueta);
      }
    } catch (error) {
      console.error('❌ Error procesando texto:', error);
    }
  };

  const frameProcessor = useFrameProcessor((frame) => {
    'worklet';

    try {
      const data = scanOCR(frame);

      if (data && data.result) {
        // Ejecutar en JS thread
        runOnJS(procesarTextoDetectado)(data);
      }
    } catch (error) {
      console.log('Frame processor error:', error);
    }
  }, []);

  /**
   * Parsea el texto OCR para extraer RUTA, DIRECCIÓN y CONSULTORA
   */
  const parsearTextoEtiqueta = (textoCompleto) => {
    const texto = textoCompleto.toLowerCase();
    const resultado = {
      ruta: null,
      direccion: null,
      consultora: null,
    };

    try {
      // Buscar REPARTIDOR: (que en realidad es la RUTA)
      const repartidorMatch = texto.match(/repartidor[:\s]*([a-z]?\d+)/i);
      if (repartidorMatch) {
        resultado.ruta = repartidorMatch[1].toUpperCase();
      }

      // Buscar DIRECCIÓN:
      const direccionMatch = texto.match(/direcci[oó]n[:\s]*([^\n]+)/i);
      if (direccionMatch) {
        resultado.direccion = direccionMatch[1].trim();
      }

      // Buscar CONSULTORA:
      const consultoraMatch = texto.match(/consultor[aí][:\s]*([^\n]+)/i);
      if (consultoraMatch) {
        resultado.consultora = consultoraMatch[1].trim();
      }
    } catch (error) {
      console.error('❌ Error parseando texto:', error);
    }

    return resultado;
  };

  const buscarYMostrarResultado = async (datosEtiqueta) => {
    if (buscando || mostrandoResultado) return;

    setBuscando(true);
    setIsActive(false); // Pausar cámara

    try {
      console.log('🔍 Buscando información en backend:', datosEtiqueta);

      const info = await buscarInformacionCaja(datosEtiqueta);

      console.log('✅ Información encontrada:', info);

      // Vibrar para feedback
      Vibration.vibrate(300);

      // Mostrar resultado
      setResultado(info);
      setMostrandoResultado(true);

      // Hablar resultado
      const mensaje = `Ruta ${info.ruta}, Color ${info.color}, Carrito ${info.numeroCarrito}`;
      Speech.speak(mensaje, {
        language: 'es-MX',
        pitch: 1.0,
        rate: 0.75,
      });

    } catch (error) {
      console.error('❌ Error al buscar:', error);
      Alert.alert('Error', error.message || 'No se encontró información para esta etiqueta');
      setIsActive(true); // Reactivar cámara en caso de error
    } finally {
      setBuscando(false);
    }
  };

  const handleAceptar = () => {
    setResultado(null);
    setMostrandoResultado(false);
    setTextoDetectado('');
    setbloqueTextos([]);
    lastProcessTime.current = 0;
    setIsActive(true); // Reanudar escaneo
    Speech.stop();
  };

  // ============================================================================
  // RENDERIZADO
  // ============================================================================

  if (!hasPermission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Solicitando permisos de cámara...</Text>
      </View>
    );
  }

  if (!device) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No se encontró cámara</Text>
      </View>
    );
  }

  // Pantalla de resultado
  if (mostrandoResultado && resultado) {
    const backgroundColor = resultado.colorHex || '#4CAF50';

    return (
      <View style={[styles.resultadoContainer, { backgroundColor }]}>
        <StatusBar style="light" />

        <View style={styles.resultadoContent}>
          <Text style={styles.resultadoTitulo}>✓ INFORMACIÓN ENCONTRADA</Text>

          <View style={styles.resultadoCard}>
            <View style={styles.resultadoItem}>
              <Text style={styles.resultadoLabel}>RUTA</Text>
              <Text style={styles.resultadoValor}>{resultado.ruta}</Text>
            </View>

            <View style={styles.separador} />

            <View style={styles.resultadoItem}>
              <Text style={styles.resultadoLabel}>COLOR</Text>
              <Text style={styles.resultadoValor}>{resultado.color}</Text>
            </View>

            <View style={styles.separador} />

            <View style={styles.resultadoItem}>
              <Text style={styles.resultadoLabel}>NÚMERO DE CARRITO</Text>
              <Text style={styles.resultadoValorGrande}>{resultado.numeroCarrito}</Text>
            </View>
          </View>

          <View style={styles.resultadoInfo}>
            <Text style={styles.resultadoInfoText}>
              📍 {resultado.direccion}
            </Text>
            <Text style={styles.resultadoInfoText}>
              👤 {resultado.consultora}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.btnAceptar}
            onPress={handleAceptar}
          >
            <Text style={styles.btnAceptarText}>ACEPTAR</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Pantalla de cámara con OCR en tiempo real
  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isActive && !mostrandoResultado}
        frameProcessor={frameProcessor}
      />

      {/* Overlay con instrucciones y visualización de texto */}
      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.btnBack}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.btnBackText}>← Volver</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.centerContent}>
          <View style={styles.scanFrame}>
            {/* Visualizar bloques de texto detectados */}
            {bloqueTextos.map((block, index) => {
              if (!block.frame) return null;

              return (
                <View
                  key={index}
                  style={[
                    styles.textBlock,
                    {
                      left: block.frame.x,
                      top: block.frame.y,
                      width: block.frame.width,
                      height: block.frame.height,
                    }
                  ]}
                />
              );
            })}
          </View>

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsTitle}>
              📦 Enfoca la etiqueta de la caja
            </Text>
            <Text style={styles.instructionsText}>
              La detección es automática en tiempo real
            </Text>
          </View>

          {buscando && (
            <View style={styles.processingIndicator}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.processingText}>Buscando...</Text>
            </View>
          )}
        </View>

        <View style={styles.bottomBar}>
          {textoDetectado ? (
            <View style={styles.textoDetectadoContainer}>
              <Text style={styles.textoDetectadoLabel}>Texto detectado:</Text>
              <Text style={styles.textoDetectado} numberOfLines={3}>
                {textoDetectado}
              </Text>
            </View>
          ) : (
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Esperando etiqueta...</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// ESTILOS
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#dc2626',
    textAlign: 'center',
    marginTop: 100,
  },

  // Overlay de cámara
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  btnBack: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  btnBackText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: width * 0.85,
    height: height * 0.5,
    borderWidth: 3,
    borderColor: '#4CAF50',
    borderRadius: 16,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  textBlock: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: '#FFD700',
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderRadius: 4,
  },
  instructionsContainer: {
    marginTop: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    maxWidth: width * 0.85,
  },
  instructionsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionsText: {
    color: '#cbd5e1',
    fontSize: 14,
    textAlign: 'center',
  },
  processingIndicator: {
    marginTop: 24,
    alignItems: 'center',
  },
  processingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  bottomBar: {
    paddingBottom: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  textoDetectadoContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    maxWidth: width * 0.9,
  },
  textoDetectadoLabel: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  textoDetectado: {
    color: '#fff',
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    marginRight: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },

  // Estilos de resultado
  resultadoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultadoContent: {
    width: '100%',
    maxWidth: 400,
  },
  resultadoTitulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 32,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  resultadoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  resultadoItem: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  resultadoLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6b7280',
    marginBottom: 8,
    letterSpacing: 1,
  },
  resultadoValor: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  resultadoValorGrande: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2563eb',
  },
  separador: {
    height: 2,
    backgroundColor: '#e5e7eb',
    marginVertical: 8,
  },
  resultadoInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  resultadoInfoText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  btnAceptar: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  btnAceptarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    letterSpacing: 1,
  },
});
