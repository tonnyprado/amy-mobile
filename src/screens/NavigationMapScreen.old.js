import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  Alert
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { calculateRoute, formatDistance, formatDuration } from '../services/routeService';

/**
 * NavigationMapScreen - Pantalla de navegación GPS con mapa
 *
 * IMPORTANTE: Para usar este componente necesitas instalar:
 * npx expo install react-native-maps
 *
 * MAPAS POR PLATAFORMA:
 * - iOS: Usa Apple Maps (nativo, sin API key necesaria)
 * - Android: Usa Google Maps (requiere API key en app.json)
 *
 * @param {Object} props.route.params
 * @param {Array} props.route.params.pedidos - Array de pedidos EN_RUTA
 * @param {Object} props.route.params.ubicacionActual - {lat, lng} ubicación actual
 */
export default function NavigationMapScreen({ route, navigation }) {
  const { pedidos = [], ubicacionActual } = route.params || {};

  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [ruta, setRuta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [instructionsCollapsed, setInstructionsCollapsed] = useState(false);
  const mapRef = useRef(null);

  // Estados del temporizador
  const [tiempoTranscurrido, setTiempoTranscurrido] = useState(0);
  const [inicioRuta, setInicioRuta] = useState(null);
  const [alertaMostrada, setAlertaMostrada] = useState(false);
  const timerRef = useRef(null);

  // Seleccionar el primer pedido por defecto e iniciar temporizador
  useEffect(() => {
    if (pedidos.length > 0 && !pedidoSeleccionado) {
      setPedidoSeleccionado(pedidos[0]);
    }

    // Iniciar temporizador cuando se abre la pantalla
    if (!inicioRuta) {
      setInicioRuta(new Date());
    }
  }, [pedidos]);

  // Temporizador que se actualiza cada segundo
  useEffect(() => {
    if (!inicioRuta) return;

    timerRef.current = setInterval(() => {
      const ahora = new Date();
      const diferencia = Math.floor((ahora - inicioRuta) / 1000); // segundos
      setTiempoTranscurrido(diferencia);

      // Verificar si son las 10 AM y mostrar alerta
      const hora = ahora.getHours();
      const minutos = ahora.getMinutes();

      if (hora === 10 && minutos === 0 && !alertaMostrada) {
        setAlertaMostrada(true);
        Alert.alert(
          '⚠️ ¡URGENTE! Son las 10:00 AM',
          'Es hora de acelerar las entregas. Si tienes algún problema, avisa de inmediato al equipo.\n\n' +
          '📋 Recuerda:\n' +
          '• Optimiza tu ruta\n' +
          '• Contacta rápido si no encuentras dirección\n' +
          '• Reporta cualquier incidencia',
          [
            { text: 'Entendido', style: 'default' }
          ],
          { cancelable: false }
        );
      }
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [inicioRuta, alertaMostrada]);

  // Calcular ruta cuando se selecciona un pedido
  useEffect(() => {
    const calcularRuta = async () => {
      if (!pedidoSeleccionado || !ubicacionActual) {
        setRuta(null);
        return;
      }

      if (!pedidoSeleccionado.latitud || !pedidoSeleccionado.longitud) {
        setError('El pedido no tiene coordenadas GPS');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const rutaCalculada = await calculateRoute(
          { lat: ubicacionActual.lat, lng: ubicacionActual.lng },
          { lat: pedidoSeleccionado.latitud, lng: pedidoSeleccionado.longitud }
        );

        setRuta(rutaCalculada);

        // Ajustar el mapa a los bounds de la ruta
        if (rutaCalculada.bounds && mapRef.current) {
          const [[minLat, minLng], [maxLat, maxLng]] = rutaCalculada.bounds;
          mapRef.current.fitToCoordinates(
            [
              { latitude: minLat, longitude: minLng },
              { latitude: maxLat, longitude: maxLng }
            ],
            {
              edgePadding: { top: 100, right: 50, bottom: 100, left: 50 },
              animated: true
            }
          );
        }
      } catch (err) {
        console.error('Error al calcular ruta:', err);
        setError('No se pudo calcular la ruta');
      } finally {
        setLoading(false);
      }
    };

    calcularRuta();
  }, [pedidoSeleccionado, ubicacionActual]);

  const handleSelectPedido = (pedido) => {
    setPedidoSeleccionado(pedido);
  };

  const handleClose = () => {
    // Limpiar temporizador al cerrar
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    navigation.goBack();
  };

  // Función para formatear el tiempo transcurrido
  const formatearTiempo = (segundos) => {
    const horas = Math.floor(segundos / 3600);
    const minutos = Math.floor((segundos % 3600) / 60);
    const segs = segundos % 60;
    return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segs.toString().padStart(2, '0')}`;
  };

  // Determinar si el temporizador debe estar en rojo (después de las 10 AM)
  const esDespuesDeLas10 = () => {
    const ahora = new Date();
    const hora = ahora.getHours();
    return hora >= 10;
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleInstructions = () => {
    setInstructionsCollapsed(!instructionsCollapsed);
  };

  const handleOpenPedidoDetalle = (pedido) => {
    navigation.navigate('PaqueteDetalle', {
      paquete: pedido,
      ubicacion: ubicacionActual ? {
        latitud: ubicacionActual.lat,
        longitud: ubicacionActual.lng
      } : null
    });
  };

  if (!ubicacionActual) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.noLocation}>
          <Text style={styles.noLocationText}>📍</Text>
          <Text style={styles.noLocationTitle}>Esperando ubicación GPS...</Text>
          <Text style={styles.noLocationSubtitle}>Activa tu ubicación para ver el mapa</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Mapa */}
      <MapView
        ref={mapRef}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        style={styles.map}
        initialRegion={{
          latitude: ubicacionActual.lat,
          longitude: ubicacionActual.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton
        showsCompass
        loadingEnabled
      >
        {/* Marcador de ubicación actual */}
        <Marker
          coordinate={{
            latitude: ubicacionActual.lat,
            longitude: ubicacionActual.lng
          }}
          title="Tu ubicación"
          pinColor="#3b82f6"
        />

        {/* Marcadores de pedidos */}
        {pedidos.map((pedido, index) => {
          if (!pedido.latitud || !pedido.longitud) return null;

          const isSelected = pedido.id === pedidoSeleccionado?.id;

          return (
            <Marker
              key={pedido.id}
              coordinate={{
                latitude: pedido.latitud,
                longitude: pedido.longitud
              }}
              title={pedido.nombreConsultora || 'Cliente'}
              description={pedido.direccionConsultora}
              pinColor={isSelected ? '#10b981' : '#f59e0b'}
              onPress={() => handleSelectPedido(pedido)}
            />
          );
        })}

        {/* Ruta trazada */}
        {ruta && (
          <Polyline
            coordinates={ruta.geometry.map(([lng, lat]) => ({
              latitude: lat,
              longitude: lng
            }))}
            strokeColor="#3b82f6"
            strokeWidth={4}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </MapView>

      {/* Header flotante */}
      <SafeAreaView style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Navegación GPS</Text>
            {pedidoSeleccionado && ruta && (
              <Text style={styles.headerSubtitle}>
                {formatDistance(ruta.distance)} • {formatDuration(ruta.duration)}
              </Text>
            )}
          </View>

          {/* Temporizador */}
          <View style={[
            styles.timerContainer,
            esDespuesDeLas10() && styles.timerContainerRed
          ]}>
            <Text style={styles.timerIcon}>{esDespuesDeLas10() ? '⚠️' : '⏱️'}</Text>
            <Text style={[
              styles.timerText,
              esDespuesDeLas10() && styles.timerTextRed
            ]}>
              {formatearTiempo(tiempoTranscurrido)}
            </Text>
          </View>

          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Loading */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color="#2563eb" />
            <Text style={styles.loadingText}>Calculando ruta...</Text>
          </View>
        </View>
      )}

      {/* Error */}
      {error && (
        <View style={styles.errorOverlay}>
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        </View>
      )}

      {/* Lista lateral de pedidos */}
      <View style={[styles.sidebar, sidebarCollapsed && styles.sidebarCollapsed]}>
        <TouchableOpacity
          style={styles.sidebarHeader}
          onPress={toggleSidebar}
          activeOpacity={0.7}
        >
          <Text style={styles.sidebarTitle}>
            📦 Entregas en ruta ({pedidos.length})
          </Text>
          <View style={styles.chevronButton}>
            <Ionicons
              name={sidebarCollapsed ? 'chevron-down' : 'chevron-up'}
              size={20}
              color="#64748b"
            />
          </View>
        </TouchableOpacity>

        {!sidebarCollapsed && (
          <FlatList
            data={pedidos}
            keyExtractor={item => item.id.toString()}
            renderItem={({ item, index }) => (
              <View
                style={[
                  styles.pedidoItemContainer,
                  item.id === pedidoSeleccionado?.id && styles.pedidoItemSelected
                ]}
              >
                <TouchableOpacity
                  style={styles.pedidoItem}
                  onPress={() => handleSelectPedido(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.pedidoNumero}>
                    <Text style={styles.pedidoNumeroText}>{index + 1}</Text>
                  </View>
                  <View style={styles.pedidoInfo}>
                    <Text style={styles.pedidoNombre} numberOfLines={1}>
                      {item.nombreConsultora || 'Cliente'}
                    </Text>
                    <Text style={styles.pedidoDireccion} numberOfLines={1}>
                      {item.direccionConsultora}
                    </Text>
                    {item.numeroPedido && (
                      <Text style={styles.pedidoNumPedido}>{item.numeroPedido}</Text>
                    )}
                  </View>
                  {item.id === pedidoSeleccionado?.id && (
                    <View style={styles.pedidoBadge}>
                      <Text style={styles.pedidoBadgeText}>🧭</Text>
                    </View>
                  )}
                </TouchableOpacity>

                {/* Botón para abrir detalle */}
                <TouchableOpacity
                  style={styles.detalleButton}
                  onPress={() => handleOpenPedidoDetalle(item)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="chevron-forward" size={20} color="#3b82f6" />
                </TouchableOpacity>
              </View>
            )}
            contentContainerStyle={styles.sidebarList}
          />
        )}
      </View>

      {/* Panel de instrucciones */}
      {pedidoSeleccionado && ruta && ruta.steps && (
        <View style={[styles.instructions, instructionsCollapsed && styles.instructionsCollapsed]}>
          <TouchableOpacity
            style={styles.instructionsHeader}
            onPress={toggleInstructions}
            activeOpacity={0.7}
          >
            <Text style={styles.instructionsTitle}>🧭 Instrucciones</Text>
            <View style={styles.chevronButton}>
              <Ionicons
                name={instructionsCollapsed ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="#64748b"
              />
            </View>
          </TouchableOpacity>

          {!instructionsCollapsed && (
            <FlatList
              data={ruta.steps.slice(0, 5)}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <View style={styles.instructionItem}>
                  <View style={styles.instructionNumber}>
                    <Text style={styles.instructionNumberText}>{item.stepNumber}</Text>
                  </View>
                  <View style={styles.instructionContent}>
                    <Text style={styles.instructionText}>{item.instruction}</Text>
                    {item.distance > 0 && (
                      <Text style={styles.instructionDistance}>
                        {formatDistance(item.distance)}
                      </Text>
                    )}
                  </View>
                </View>
              )}
              contentContainerStyle={styles.instructionsList}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  map: {
    flex: 1,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0f172a',
    marginHorizontal: 16,
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#ffffff',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  timerContainerRed: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  timerIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  timerText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    fontVariant: ['tabular-nums'],
  },
  timerTextRed: {
    color: '#ffffff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    zIndex: 20,
  },
  loadingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#334155',
  },
  errorOverlay: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    zIndex: 20,
  },
  errorCard: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  errorText: {
    fontSize: 14,
    color: '#991b1b',
  },
  sidebar: {
    position: 'absolute',
    right: 16,
    top: 100,
    bottom: 200,
    width: 280,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  sidebarCollapsed: {
    bottom: 'auto',
    height: 'auto',
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  sidebarTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  chevronButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sidebarList: {
    padding: 8,
  },
  pedidoItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    overflow: 'hidden',
  },
  pedidoItemSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  pedidoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  detalleButton: {
    width: 44,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    borderLeftWidth: 1,
    borderLeftColor: '#e2e8f0',
  },
  pedidoNumero: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f59e0b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  pedidoNumeroText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  pedidoInfo: {
    flex: 1,
  },
  pedidoNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 2,
  },
  pedidoDireccion: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  pedidoNumPedido: {
    fontSize: 11,
    color: '#94a3b8',
  },
  pedidoBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pedidoBadgeText: {
    fontSize: 14,
  },
  instructions: {
    position: 'absolute',
    left: 16,
    bottom: 16,
    width: 300,
    maxHeight: 250,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  instructionsCollapsed: {
    maxHeight: 'auto',
    height: 'auto',
  },
  instructionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  instructionsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    flex: 1,
  },
  instructionsList: {
    padding: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionNumberText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563eb',
  },
  instructionContent: {
    flex: 1,
  },
  instructionText: {
    fontSize: 13,
    color: '#334155',
    marginBottom: 2,
  },
  instructionDistance: {
    fontSize: 12,
    color: '#64748b',
  },
  noLocation: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  noLocationText: {
    fontSize: 64,
    marginBottom: 16,
  },
  noLocationTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  noLocationSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
});
