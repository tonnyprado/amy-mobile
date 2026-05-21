// src/screens/repartidor/MapScreen.js
// Pantalla 1 - Mapa de ruta del día

import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Alert, Linking, Platform } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE, Circle } from 'react-native-maps';
import SectionShell from '../../components/repartidor/SectionShell';
import Pill from '../../components/repartidor/Pill';
import Icon from '../../components/repartidor/Icon';
import { FONTS } from '../../theme/repartidorTheme';
import { calculateRoute } from '../../services/routeService';
import { customMapStyle, darkMapStyle } from '../../theme/mapStyles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function MapScreen({ theme, pedidos = [], ubicacionActual, userName = 'Usuario' }) {
  const mapRef = useRef(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [region, setRegion] = useState({
    latitude: ubicacionActual?.lat || 19.4326,
    longitude: ubicacionActual?.lng || -99.1332,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [ruta, setRuta] = useState(null);
  // Convertir pedidos a paradas
  const stops = pedidos.slice(0, 5).map((p, index) => ({
    id: p.id,
    code: p.numeroPedido || `P-${p.id}`,
    addr: p.direccionConsultora || 'Dirección',
    status: p.estado === 'ENTREGADO' ? 'done' :
            p.estado === 'EN_RUTA' && index === 0 ? 'current' : 'next',
    latitude: p.latitud,
    longitude: p.longitud,
  }));

  const currentStop = stops.find(s => s.status === 'current') || stops[0];
  const completedStops = stops.filter(s => s.status === 'done').length;
  const totalStops = stops.length;

  const fecha = new Date();
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const fechaFormateada = `${dias[fecha.getDay()]} · ${fecha.getDate()} ${meses[fecha.getMonth()]}`;

  // Calcular ruta al destino actual
  useEffect(() => {
    const calcularRuta = async () => {
      if (!currentStop || !ubicacionActual) {
        setRuta(null);
        return;
      }

      if (!currentStop.latitude || !currentStop.longitude) {
        return;
      }

      try {
        const rutaCalculada = await calculateRoute(
          { lat: ubicacionActual.lat, lng: ubicacionActual.lng },
          { lat: currentStop.latitude, lng: currentStop.longitude }
        );
        setRuta(rutaCalculada);
      } catch (err) {
        console.error('Error al calcular ruta:', err);
      }
    };

    calcularRuta();
  }, [currentStop, ubicacionActual]);

  // Actualizar región cuando cambia ubicación
  useEffect(() => {
    if (ubicacionActual) {
      setRegion({
        latitude: ubicacionActual.lat,
        longitude: ubicacionActual.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  }, [ubicacionActual]);

  const handleZoomIn = () => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta / 2,
      longitudeDelta: region.longitudeDelta / 2,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 300);
  };

  const handleZoomOut = () => {
    const newRegion = {
      ...region,
      latitudeDelta: region.latitudeDelta * 2,
      longitudeDelta: region.longitudeDelta * 2,
    };
    setRegion(newRegion);
    mapRef.current?.animateToRegion(newRegion, 300);
  };

  const handleCenterLocation = () => {
    if (ubicacionActual) {
      const newRegion = {
        latitude: ubicacionActual.lat,
        longitude: ubicacionActual.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 500);
    }
  };

  const handleToggleMapType = () => {
    setIsDarkMode(prev => !prev);
    Alert.alert(
      'Vista del mapa',
      `Cambiado a modo ${!isDarkMode ? 'oscuro' : 'claro'}`,
      [{ text: 'OK' }]
    );
  };

  const handleNotifications = () => {
    Alert.alert(
      '🔔 Notificaciones',
      'No tienes notificaciones nuevas en este momento.',
      [{ text: 'OK' }]
    );
  };

  // Debug: mostrar info de datos
  useEffect(() => {
    console.log('📍 MapScreen Debug:');
    console.log('- Pedidos:', pedidos.length);
    console.log('- Stops:', stops.length);
    console.log('- Ubicación actual:', ubicacionActual);
    console.log('- Current stop:', currentStop);
  }, [pedidos, stops, ubicacionActual]);

  return (
    <SectionShell bg={theme.canvas} label="01 Mapa" theme={theme} padded={false}>
      {/* Mapa */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          region={region}
          onRegionChangeComplete={setRegion}
          customMapStyle={Platform.OS === 'android' ? (isDarkMode ? darkMapStyle : customMapStyle) : undefined}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          showsScale={false}
          showsBuildings={true}
          showsTraffic={false}
          showsIndoors={true}
          mapPadding={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          {/* Marcador de ubicación actual con círculo pulsante */}
          {ubicacionActual && (
            <>
              <Circle
                center={{
                  latitude: ubicacionActual.lat,
                  longitude: ubicacionActual.lng,
                }}
                radius={50}
                fillColor="rgba(139, 92, 246, 0.2)"
                strokeColor="rgba(139, 92, 246, 0.8)"
                strokeWidth={2}
              />
              <Marker
                coordinate={{
                  latitude: ubicacionActual.lat,
                  longitude: ubicacionActual.lng,
                }}
                title="Tu ubicación"
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.currentLocationMarker}>
                  <View style={styles.currentLocationDot} />
                </View>
              </Marker>
            </>
          )}

          {/* Marcadores de paradas personalizados */}
          {stops.map((stop, index) => {
            if (!stop.latitude || !stop.longitude) return null;

            const markerColor =
              stop.status === 'done' ? '#10B981' :
              stop.status === 'current' ? '#8B5CF6' :
              '#9CA3AF';

            return (
              <Marker
                key={stop.id}
                coordinate={{
                  latitude: stop.latitude,
                  longitude: stop.longitude,
                }}
                title={stop.addr}
                description={stop.code}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={styles.stopMarker}>
                  <View style={[styles.stopMarkerInner, { backgroundColor: markerColor }]}>
                    {stop.status === 'done' ? (
                      <Text style={styles.stopMarkerCheck}>✓</Text>
                    ) : (
                      <Text style={styles.stopMarkerNumber}>{index + 1}</Text>
                    )}
                  </View>
                  {stop.status === 'current' && (
                    <View style={styles.stopMarkerPulse} />
                  )}
                </View>
              </Marker>
            );
          })}

          {/* Ruta con diseño mejorado */}
          {ruta && ruta.coordinates && (
            <>
              {/* Sombra de la ruta */}
              <Polyline
                coordinates={ruta.coordinates.map(coord => ({
                  latitude: coord.lat,
                  longitude: coord.lng,
                }))}
                strokeColor="rgba(0, 0, 0, 0.2)"
                strokeWidth={8}
              />
              {/* Ruta principal */}
              <Polyline
                coordinates={ruta.coordinates.map(coord => ({
                  latitude: coord.lat,
                  longitude: coord.lng,
                }))}
                strokeColor="#8B5CF6"
                strokeWidth={5}
                lineCap="round"
                lineJoin="round"
              />
            </>
          )}
        </MapView>
      </View>

      {/* Header overlay */}
      <View style={styles.headerOverlay}>
        <View>
          <Text style={[styles.headerKicker, { color: theme.muted }]}>
            {fechaFormateada}
          </Text>
          <Text style={[styles.headerTitle, { color: theme.ink }]}>
            Hola, {userName}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={() => Alert.alert('Búsqueda', 'Funcionalidad de búsqueda próximamente')}
          >
            <Icon name="search" size={17} color={theme.ink} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={handleNotifications}
          >
            <Icon name="bell" size={17} color={theme.ink} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Timeline lateral izquierdo */}
      <View style={styles.timeline}>
        {stops.map((stop, index) => (
          <React.Fragment key={stop.id}>
            <View
              style={[
                styles.timelineDot,
                {
                  backgroundColor: stop.status === 'done' ? theme.ink :
                                   stop.status === 'current' ? theme.accent :
                                   theme.surface,
                  borderColor: stop.status === 'next' ? theme.ink : 'transparent',
                },
                stop.status === 'current' && styles.timelineDotCurrent,
              ]}
            >
              {stop.status === 'done' ? (
                <Icon name="check" size={13} color={theme.canvas} strokeWidth={3} />
              ) : (
                <Text style={[styles.timelineDotText, { color: theme.ink }]}>
                  {index + 1}
                </Text>
              )}
            </View>
            {index < stops.length - 1 && (
              <View
                style={[
                  styles.timelineLine,
                  {
                    backgroundColor: stop.status === 'done' ? theme.ink : 'transparent',
                    borderColor: theme.ink,
                    borderStyle: stop.status === 'done' ? 'solid' : 'dotted',
                  },
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* FABs derecha */}
      <View style={styles.rightFabs}>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={handleZoomIn}
        >
          <Icon name="plus" size={16} color={theme.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={handleZoomOut}
        >
          <Icon name="minus" size={16} color={theme.ink} />
        </TouchableOpacity>
        <View style={styles.fabSpacer} />
        <TouchableOpacity
          style={[styles.fab, styles.fabAccent, { backgroundColor: theme.ink }]}
          onPress={handleCenterLocation}
        >
          <Icon name="locate-fixed" size={16} color={theme.canvas} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={handleToggleMapType}
        >
          <Icon name="layers" size={16} color={theme.ink} />
        </TouchableOpacity>
      </View>

      {/* Cards inferiores */}
      <View style={styles.bottomCards}>
        {/* Progress card */}
        <View style={[styles.progressCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.progressHeader}>
            <View style={styles.progressLabel}>
              <Icon name="route" size={12} color={theme.muted} />
              <Text style={[styles.progressText, { color: theme.muted }]}>
                RUTA · {completedStops} DE {totalStops} COMPLETAS
              </Text>
            </View>
            <Text style={[styles.progressPercent, { color: theme.ink }]}>
              {Math.round((completedStops / totalStops) * 100)}%
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: theme.accent,
                  width: `${(completedStops / totalStops) * 100}%`,
                },
              ]}
            />
          </View>
        </View>

        {/* Next stop card */}
        {currentStop && (
          <View style={[styles.nextStopCard, { backgroundColor: theme.ink }]}>
            <View style={styles.nextStopHeader}>
              <Pill bg={theme.accent} color={theme.ink}>
                <>
                  <Icon name="map-pin" size={11} color={theme.ink} />
                  <Text> Próxima parada</Text>
                </>
              </Pill>
              <Text style={[styles.nextStopCode, { color: theme.canvas }]}>
                #{currentStop.code}
              </Text>
            </View>
            <Text style={[styles.nextStopTitle, { color: theme.canvas }]}>
              {currentStop.addr}
            </Text>
            <Text style={[styles.nextStopSubtitle, { color: theme.canvas }]}>
              Tap para más detalles
            </Text>

            <View style={[styles.nextStopFooter, { borderTopColor: 'rgba(255,255,255,0.1)' }]}>
              <View style={styles.nextStopStat}>
                <Text style={[styles.nextStopStatLabel, { color: theme.canvas }]}>ETA</Text>
                <Text style={[styles.nextStopStatValue, { color: theme.canvas }]}>
                  {ruta?.duration || '-'}
                </Text>
              </View>
              <View style={styles.nextStopStat}>
                <Text style={[styles.nextStopStatLabel, { color: theme.canvas }]}>DISTANCIA</Text>
                <Text style={[styles.nextStopStatValue, { color: theme.canvas }]}>
                  {ruta?.distance || '-'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.nextStopButton, { backgroundColor: theme.accent }]}
                onPress={() => {
                  if (!currentStop.latitude || !currentStop.longitude) {
                    Alert.alert('Error', 'No hay coordenadas para esta parada');
                    return;
                  }

                  // Abrir navegación externa (Google Maps o Apple Maps)
                  const url = Platform.OS === 'ios'
                    ? `maps://app?daddr=${currentStop.latitude},${currentStop.longitude}`
                    : `google.navigation:q=${currentStop.latitude},${currentStop.longitude}`;

                  Linking.openURL(url).catch(err => {
                    console.error('Error abriendo navegación:', err);
                    // Fallback a URL web
                    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${currentStop.latitude},${currentStop.longitude}`);
                  });
                }}
              >
                <Text style={[styles.nextStopButtonText, { color: theme.ink }]}>Navegar</Text>
                <Icon name="navigation" size={13} color={theme.ink} strokeWidth={2.4} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </SectionShell>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  map: {
    flex: 1,
  },
  headerOverlay: {
    position: 'absolute',
    top: 54,
    left: 0,
    right: 0,
    zIndex: 5,
    paddingHorizontal: 20,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerKicker: {
    fontSize: 10.5,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: -0.6,
    fontFamily: FONTS.display,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  timeline: {
    position: 'absolute',
    left: 16,
    top: 130,
    alignItems: 'center',
    gap: 6,
    zIndex: 4,
  },
  timelineDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  timelineDotCurrent: {
    shadowColor: '#FF7849',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  timelineDotText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: FONTS.bodyBold,
  },
  timelineLine: {
    width: 2,
    height: 18,
    borderWidth: 1,
  },
  rightFabs: {
    position: 'absolute',
    right: 16,
    top: 130,
    gap: 8,
    zIndex: 4,
  },
  fab: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  fabAccent: {
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 6,
  },
  fabSpacer: {
    height: 6,
  },
  bottomCards: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 50,
    zIndex: 5,
  },
  progressCard: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 22,
    elevation: 5,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressText: {
    fontSize: 10.5,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  progressPercent: {
    fontSize: 11,
    fontFamily: FONTS.bodyBold,
    fontWeight: '700',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  nextStopCard: {
    borderRadius: 22,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.22,
    shadowRadius: 40,
    elevation: 10,
  },
  nextStopHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  nextStopCode: {
    fontSize: 11,
    fontFamily: FONTS.bodyRegular,
    opacity: 0.55,
    letterSpacing: 1,
  },
  nextStopTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 25,
    fontFamily: FONTS.display,
  },
  nextStopSubtitle: {
    fontSize: 12.5,
    opacity: 0.6,
    marginTop: 2,
  },
  nextStopFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
  },
  nextStopStat: {
    flex: 1,
  },
  nextStopStatLabel: {
    fontSize: 9.5,
    opacity: 0.5,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: FONTS.bodyBold,
  },
  nextStopStatValue: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 1,
    fontFamily: FONTS.bodyBold,
  },
  nextStopButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextStopButtonText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
    fontFamily: FONTS.bodyBold,
  },
  // Estilos de marcadores personalizados
  currentLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
  currentLocationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8B5CF6',
  },
  stopMarker: {
    position: 'relative',
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopMarkerInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  stopMarkerNumber: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    fontFamily: FONTS.bodyBold,
  },
  stopMarkerCheck: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  stopMarkerPulse: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8B5CF6',
    opacity: 0.3,
  },
});
