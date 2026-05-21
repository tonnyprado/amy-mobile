/**
 * MonitoreoScreen - Panel de monitoreo en tiempo real para administradores
 *
 * Muestra el estado actual de todos los repartidores, sus entregas,
 * y análisis de rendimiento especialmente después de las 10 AM
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  AppState,
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { obtenerRepartidores } from '../services/adminApi';
import { obtenerPedidosHoy } from '../services/repartidorApi';

export default function MonitoreoScreen({ navigation }) {
  const [repartidores, setRepartidores] = useState([]);
  const [estadisticas, setEstadisticas] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const panelAnimation = useRef(new Animated.Value(0)).current;
  const alertaAnimation = useRef(new Animated.Value(1)).current;

  useFocusEffect(
    React.useCallback(() => {
      let active = true;

      cargarDatos().catch(() => null);

      const interval = setInterval(() => {
        if (active && AppState.currentState === 'active') {
          cargarDatos().catch(() => null);
        }
      }, 60000);

      const appStateSubscription = AppState.addEventListener('change', (nextState) => {
        if (active && nextState === 'active') {
          cargarDatos().catch(() => null);
        }
      });

      return () => {
        active = false;
        clearInterval(interval);
        appStateSubscription.remove();
      };
    }, [])
  );

  // Mostrar panel automáticamente a las 10 AM
  useEffect(() => {
    const ahora = new Date();
    const hora = ahora.getHours();

    if (hora >= 10 && !panelVisible) {
      mostrarPanel();

      // Animar alerta
      Animated.loop(
        Animated.sequence([
          Animated.timing(alertaAnimation, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true
          }),
          Animated.timing(alertaAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true
          })
        ])
      ).start();
    }
  }, []);

  const cargarDatos = async () => {
    try {
      const listaRepartidores = await obtenerRepartidores();

      // Obtener pedidos de cada repartidor
      const repartidoresConDatos = await Promise.all(
        listaRepartidores.map(async (rep) => {
          try {
            const pedidos = await obtenerPedidosHoy(rep.repartidor?.idRepartidor);
            return {
              ...rep,
              pedidos: pedidos || [],
              estadoPedidos: calcularEstadoPedidos(pedidos || [])
            };
          } catch (error) {
            console.error(`Error cargando pedidos de ${rep.nombre}:`, error);
            return {
              ...rep,
              pedidos: [],
              estadoPedidos: { total: 0, entregados: 0, enRuta: 0, pendientes: 0, incidencias: 0 }
            };
          }
        })
      );

      setRepartidores(repartidoresConDatos);

      // Calcular estadísticas generales
      const stats = calcularEstadisticasGenerales(repartidoresConDatos);
      setEstadisticas(stats);

    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos de monitoreo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calcularEstadoPedidos = (pedidos) => {
    return {
      total: pedidos.length,
      entregados: pedidos.filter(p => p.estado === 'ENTREGADO').length,
      enRuta: pedidos.filter(p => p.estado === 'EN_RUTA').length,
      pendientes: pedidos.filter(p => p.estado === 'PENDIENTE').length,
      incidencias: pedidos.filter(p => p.estado === 'NO_ENTREGADO').length
    };
  };

  const calcularEstadisticasGenerales = (repartidoresData) => {
    const totalPedidos = repartidoresData.reduce((sum, r) => sum + r.estadoPedidos.total, 0);
    const totalEntregados = repartidoresData.reduce((sum, r) => sum + r.estadoPedidos.entregados, 0);
    const totalEnRuta = repartidoresData.reduce((sum, r) => sum + r.estadoPedidos.enRuta, 0);
    const totalPendientes = repartidoresData.reduce((sum, r) => sum + r.estadoPedidos.pendientes, 0);
    const totalIncidencias = repartidoresData.reduce((sum, r) => sum + r.estadoPedidos.incidencias, 0);

    const porcentajeCompletado = totalPedidos > 0
      ? Math.round((totalEntregados / totalPedidos) * 100)
      : 0;

    const ahora = new Date();
    const horaActual = ahora.getHours();
    const minutosDesde8AM = (horaActual - 8) * 60 + ahora.getMinutes();

    // Calcular velocidad esperada vs real
    const tiempoDisponible = 14 * 60; // 8 AM a 10 PM = 14 horas
    const porcentajeEsperado = Math.min(100, Math.round((minutosDesde8AM / tiempoDisponible) * 100));

    const velocidad = porcentajeCompletado >= porcentajeEsperado ? 'adelante' :
                      porcentajeCompletado >= porcentajeEsperado - 10 ? 'bien' : 'atrasado';

    return {
      totalPedidos,
      totalEntregados,
      totalEnRuta,
      totalPendientes,
      totalIncidencias,
      porcentajeCompletado,
      porcentajeEsperado,
      velocidad,
      repartidoresActivos: repartidoresData.filter(r => r.estadoPedidos.enRuta > 0).length,
      promedioEntregasPorRepartidor: totalPedidos > 0
        ? Math.round(totalEntregados / repartidoresData.length)
        : 0
    };
  };

  const mostrarPanel = () => {
    setPanelVisible(true);
    Animated.spring(panelAnimation, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true
    }).start();
  };

  const ocultarPanel = () => {
    Animated.timing(panelAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => setPanelVisible(false));
  };

  const handleRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  const esDespuesDeLas10 = () => {
    return new Date().getHours() >= 10;
  };

  const obtenerColorVelocidad = () => {
    if (!estadisticas) return '#64748b';
    if (estadisticas.velocidad === 'adelante') return '#10b981';
    if (estadisticas.velocidad === 'bien') return '#f59e0b';
    return '#ef4444';
  };

  const obtenerMensajeVelocidad = () => {
    if (!estadisticas) return 'Cargando...';
    if (estadisticas.velocidad === 'adelante') return '¡Excelente ritmo! Van adelante del objetivo';
    if (estadisticas.velocidad === 'bien') return 'Buen ritmo, mantener el paso';
    return '⚠️ RITMO LENTO - Necesitan acelerar';
  };

  const obtenerSugerencias = () => {
    if (!estadisticas) return [];

    const sugerencias = [];

    if (estadisticas.velocidad === 'atrasado') {
      sugerencias.push({
        tipo: 'urgente',
        icono: '🚨',
        mensaje: 'Contactar repartidores para acelerar entregas',
        accion: 'Llamar ahora'
      });
    }

    if (estadisticas.totalIncidencias > 3) {
      sugerencias.push({
        tipo: 'atencion',
        icono: '⚠️',
        mensaje: `${estadisticas.totalIncidencias} incidencias reportadas`,
        accion: 'Revisar'
      });
    }

    if (estadisticas.totalPendientes > estadisticas.totalEnRuta) {
      sugerencias.push({
        tipo: 'info',
        icono: '📦',
        mensaje: 'Muchos pedidos pendientes sin asignar',
        accion: 'Ver detalles'
      });
    }

    if (estadisticas.repartidoresActivos < repartidores.length) {
      const inactivos = repartidores.length - estadisticas.repartidoresActivos;
      sugerencias.push({
        tipo: 'info',
        icono: '👤',
        mensaje: `${inactivos} repartidor(es) sin pedidos en ruta`,
        accion: 'Asignar'
      });
    }

    return sugerencias;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Cargando datos de monitoreo...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={[styles.header, esDespuesDeLas10() && styles.headerRed]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Monitoreo en Tiempo Real</Text>
          <Text style={styles.headerTime}>
            {new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <TouchableOpacity onPress={() => mostrarPanel()} style={styles.statsButton}>
          <Ionicons name="stats-chart" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {/* Alerta 10 AM */}
      {esDespuesDeLas10() && (
        <Animated.View
          style={[
            styles.alertaBanner,
            { transform: [{ scale: alertaAnimation }] }
          ]}
        >
          <Text style={styles.alertaBannerIcon}>⚠️</Text>
          <Text style={styles.alertaBannerText}>
            Son las {new Date().getHours()}:{new Date().getMinutes().toString().padStart(2, '0')} -
            Hora crítica de entregas
          </Text>
        </Animated.View>
      )}

      {/* Estadísticas principales */}
      {estadisticas && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{estadisticas.porcentajeCompletado}%</Text>
            <Text style={styles.statLabel}>Completado</Text>
            <View style={styles.progressBar}>
              <View style={[
                styles.progressFill,
                { width: `${estadisticas.porcentajeCompletado}%`, backgroundColor: obtenerColorVelocidad() }
              ]} />
            </View>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{estadisticas.totalEntregados}</Text>
            <Text style={styles.statLabel}>Entregados</Text>
            <Text style={styles.statSubtext}>de {estadisticas.totalPedidos}</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{estadisticas.repartidoresActivos}</Text>
            <Text style={styles.statLabel}>Activos</Text>
            <Text style={styles.statSubtext}>de {repartidores.length}</Text>
          </View>
        </View>
      )}

      {/* Indicador de velocidad */}
      {estadisticas && (
        <View style={[styles.velocidadCard, { backgroundColor: obtenerColorVelocidad() }]}>
          <Text style={styles.velocidadTexto}>{obtenerMensajeVelocidad()}</Text>
          <Text style={styles.velocidadDetalle}>
            Esperado: {estadisticas.porcentajeEsperado}% | Real: {estadisticas.porcentajeCompletado}%
          </Text>
        </View>
      )}

      {/* Lista de repartidores */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {repartidores.map((repartidor) => (
          <RepartidorCard key={repartidor.id} repartidor={repartidor} />
        ))}
      </ScrollView>

      {/* Panel lateral de análisis */}
      {panelVisible && (
        <Animated.View
          style={[
            styles.panelLateral,
            {
              transform: [{
                translateX: panelAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [400, 0]
                })
              }]
            }
          ]}
        >
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>📊 Análisis y Sugerencias</Text>
            <TouchableOpacity onPress={ocultarPanel} style={styles.panelCloseButton}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.panelContent}>
            {/* Sugerencias */}
            <Text style={styles.panelSectionTitle}>Acciones Recomendadas</Text>
            {obtenerSugerencias().map((sugerencia, idx) => (
              <View key={idx} style={[
                styles.sugerenciaCard,
                sugerencia.tipo === 'urgente' && styles.sugerenciaUrgente
              ]}>
                <Text style={styles.sugerenciaIcono}>{sugerencia.icono}</Text>
                <View style={styles.sugerenciaTexto}>
                  <Text style={styles.sugerenciaMensaje}>{sugerencia.mensaje}</Text>
                  <Text style={styles.sugerenciaAccion}>{sugerencia.accion}</Text>
                </View>
              </View>
            ))}

            {/* Detalles estadísticos */}
            {estadisticas && (
              <>
                <Text style={styles.panelSectionTitle}>Detalles</Text>
                <View style={styles.detalleRow}>
                  <Text style={styles.detalleLabel}>Total pedidos:</Text>
                  <Text style={styles.detalleValue}>{estadisticas.totalPedidos}</Text>
                </View>
                <View style={styles.detalleRow}>
                  <Text style={styles.detalleLabel}>En ruta:</Text>
                  <Text style={[styles.detalleValue, { color: '#3b82f6' }]}>
                    {estadisticas.totalEnRuta}
                  </Text>
                </View>
                <View style={styles.detalleRow}>
                  <Text style={styles.detalleLabel}>Pendientes:</Text>
                  <Text style={[styles.detalleValue, { color: '#f59e0b' }]}>
                    {estadisticas.totalPendientes}
                  </Text>
                </View>
                <View style={styles.detalleRow}>
                  <Text style={styles.detalleLabel}>Incidencias:</Text>
                  <Text style={[styles.detalleValue, { color: '#ef4444' }]}>
                    {estadisticas.totalIncidencias}
                  </Text>
                </View>
                <View style={styles.detalleRow}>
                  <Text style={styles.detalleLabel}>Promedio por repartidor:</Text>
                  <Text style={styles.detalleValue}>
                    {estadisticas.promedioEntregasPorRepartidor} entregas
                  </Text>
                </View>
              </>
            )}

            {/* Análisis de tiempo */}
            <Text style={styles.panelSectionTitle}>Análisis de Tiempo</Text>
            <View style={styles.analisisCard}>
              <Text style={styles.analisisTexto}>
                {estadisticas && estadisticas.velocidad === 'adelante' &&
                  '✅ El equipo va adelante del ritmo esperado. Excelente trabajo.'}
                {estadisticas && estadisticas.velocidad === 'bien' &&
                  '⚠️ El ritmo es aceptable pero pueden mejorar. Motiva al equipo.'}
                {estadisticas && estadisticas.velocidad === 'atrasado' &&
                  '🚨 URGENTE: El equipo va retrasado. Contacta a los repartidores de inmediato.'}
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      )}
    </View>
  );
}

// Componente de tarjeta de repartidor
function RepartidorCard({ repartidor }) {
  const estado = repartidor.estadoPedidos;
  const porcentaje = estado.total > 0
    ? Math.round((estado.entregados / estado.total) * 100)
    : 0;

  const obtenerEstadoColor = () => {
    if (estado.enRuta > 0) return '#3b82f6';
    if (estado.pendientes > 0) return '#f59e0b';
    return '#10b981';
  };

  return (
    <View style={styles.repartidorCard}>
      <View style={styles.repartidorHeader}>
        <View style={[styles.repartidorStatus, { backgroundColor: obtenerEstadoColor() }]} />
        <View style={styles.repartidorInfo}>
          <Text style={styles.repartidorNombre}>{repartidor.nombre}</Text>
          <Text style={styles.repartidorEmail}>{repartidor.email}</Text>
        </View>
        <View style={styles.repartidorStats}>
          <Text style={styles.repartidorPorcentaje}>{porcentaje}%</Text>
        </View>
      </View>

      <View style={styles.repartidorDetalles}>
        <View style={styles.detalleChip}>
          <Text style={styles.detalleChipLabel}>Total:</Text>
          <Text style={styles.detalleChipValue}>{estado.total}</Text>
        </View>
        <View style={[styles.detalleChip, { backgroundColor: '#dcfce7' }]}>
          <Text style={styles.detalleChipLabel}>Entregados:</Text>
          <Text style={[styles.detalleChipValue, { color: '#10b981' }]}>{estado.entregados}</Text>
        </View>
        <View style={[styles.detalleChip, { backgroundColor: '#dbeafe' }]}>
          <Text style={styles.detalleChipLabel}>En ruta:</Text>
          <Text style={[styles.detalleChipValue, { color: '#3b82f6' }]}>{estado.enRuta}</Text>
        </View>
        {estado.incidencias > 0 && (
          <View style={[styles.detalleChip, { backgroundColor: '#fee2e2' }]}>
            <Text style={styles.detalleChipLabel}>Incidencias:</Text>
            <Text style={[styles.detalleChipValue, { color: '#ef4444' }]}>{estado.incidencias}</Text>
          </View>
        )}
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBarFill, { width: `${porcentaje}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748b',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 48,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerRed: {
    backgroundColor: '#dc2626',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerTime: {
    fontSize: 14,
    color: '#bfdbfe',
    marginTop: 2,
  },
  statsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertaBanner: {
    backgroundColor: '#fef3c7',
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: '#f59e0b',
  },
  alertaBannerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  alertaBannerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 4,
  },
  statSubtext: {
    fontSize: 11,
    color: '#94a3b8',
    marginTop: 2,
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#e2e8f0',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  velocidadCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  velocidadTexto: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  velocidadDetalle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  repartidorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  repartidorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  repartidorStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  repartidorInfo: {
    flex: 1,
  },
  repartidorNombre: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  repartidorEmail: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  repartidorStats: {
    alignItems: 'flex-end',
  },
  repartidorPorcentaje: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2563eb',
  },
  repartidorDetalles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  detalleChip: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
  },
  detalleChipLabel: {
    fontSize: 11,
    color: '#64748b',
    marginRight: 4,
  },
  detalleChipValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  progressBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  panelLateral: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 340,
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginTop: 48,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
  },
  panelCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  panelContent: {
    flex: 1,
    padding: 20,
  },
  panelSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 20,
    marginBottom: 12,
  },
  sugerenciaCard: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  sugerenciaUrgente: {
    backgroundColor: '#fee2e2',
    borderLeftColor: '#ef4444',
  },
  sugerenciaIcono: {
    fontSize: 24,
    marginRight: 12,
  },
  sugerenciaTexto: {
    flex: 1,
  },
  sugerenciaMensaje: {
    fontSize: 13,
    color: '#0f172a',
    marginBottom: 4,
  },
  sugerenciaAccion: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '600',
  },
  detalleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  detalleLabel: {
    fontSize: 14,
    color: '#64748b',
  },
  detalleValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
  },
  analisisCard: {
    backgroundColor: '#eff6ff',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  analisisTexto: {
    fontSize: 13,
    color: '#1e40af',
    lineHeight: 20,
  },
});
