/**
 * EstadisticasIncidenciasScreen - Dashboard completo de estadísticas e incidencias
 *
 * Muestra métricas en tiempo real, incidencias detalladas, alertas,
 * top repartidores y análisis de rendimiento
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { obtenerEstadisticasDia, obtenerRepartidores, obtenerTodosPedidosHoy } from '../services/adminApi';
import {
  StatCard,
  MiniStatCard,
  AlertBadge,
  ProgressBar,
  IncidenciaItem,
  VelocidadCard,
  SectionHeader,
  EmptyState,
  TopRepartidorCard
} from '../components/admin/StatsComponents';

export default function EstadisticasIncidenciasScreen({ navigation }) {
  const [estadisticas, setEstadisticas] = useState(null);
  const [topRepartidores, setTopRepartidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar estadísticas
      const stats = await obtenerEstadisticasDia();
      setEstadisticas(stats);

      // Calcular top repartidores
      await calcularTopRepartidores();

    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'No se pudieron cargar las estadísticas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const calcularTopRepartidores = async () => {
    try {
      const [repartidores, pedidos] = await Promise.all([
        obtenerRepartidores(),
        obtenerTodosPedidosHoy()
      ]);

      // Calcular estadísticas por repartidor
      const statsRepartidores = repartidores.map(rep => {
        const pedidosRep = pedidos.filter(p =>
          p.idRepartidor === rep.repartidor?.idRepartidor
        );
        const entregados = pedidosRep.filter(p => p.estado === 'ENTREGADO').length;
        const total = pedidosRep.length;
        const tasaExito = total > 0 ? Math.round((entregados / total) * 100) : 0;

        return {
          id: rep.id,
          nombre: rep.nombre,
          entregas: entregados,
          total,
          tasaExito
        };
      });

      // Ordenar por tasa de éxito y entregas
      const top = statsRepartidores
        .filter(r => r.total > 0)
        .sort((a, b) => {
          if (b.tasaExito !== a.tasaExito) {
            return b.tasaExito - a.tasaExito;
          }
          return b.entregas - a.entregas;
        })
        .slice(0, 3);

      setTopRepartidores(top);
    } catch (error) {
      console.error('Error calculando top repartidores:', error);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Estadísticas e Incidencias</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Cargando estadísticas...</Text>
        </View>
      </View>
    );
  }

  if (!estadisticas) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#ffffff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Estadísticas e Incidencias</Text>
          <View style={styles.backButton} />
        </View>
        <EmptyState
          icon="📊"
          title="Sin datos disponibles"
          message="No hay información de estadísticas para mostrar"
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Estadísticas e Incidencias</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.backButton}>
          <Ionicons name="refresh" size={24} color="#ffffff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Estadísticas Principales */}
        <View style={styles.statsGrid}>
          <StatCard
            value={`${estadisticas.tasaExito}%`}
            label="Tasa de Éxito"
            color="#10b981"
            icon="✅"
          />
          <StatCard
            value={estadisticas.entregados}
            label="Entregados"
            color="#10b981"
            subtext={`de ${estadisticas.totalPedidos}`}
          />
          <StatCard
            value={estadisticas.repartidoresActivos}
            label="Activos"
            color="#3b82f6"
            icon="🚚"
            subtext={`de ${estadisticas.totalRepartidores}`}
          />
        </View>

        {/* Progreso del Día */}
        <SectionHeader title="Progreso del Día" icon="📈" />
        <View style={styles.card}>
          <ProgressBar
            progress={estadisticas.tasaExito}
            color={estadisticas.velocidad === 'adelante' ? '#10b981' : estadisticas.velocidad === 'bien' ? '#f59e0b' : '#ef4444'}
            height={8}
            showLabel
          />
          <View style={styles.progressDetails}>
            <MiniStatCard
              value={estadisticas.entregados}
              label="Entregados"
              color="#10b981"
            />
            <MiniStatCard
              value={estadisticas.enRuta}
              label="En Ruta"
              color="#3b82f6"
            />
            <MiniStatCard
              value={estadisticas.pendientes}
              label="Pendientes"
              color="#f59e0b"
            />
          </View>
        </View>

        {/* Velocidad de Entrega */}
        <SectionHeader title="Análisis de Ritmo" icon="⚡" />
        <VelocidadCard
          velocidad={estadisticas.velocidad}
          porcentajeReal={estadisticas.tasaExito}
          porcentajeEsperado={estadisticas.porcentajeEsperado}
        />

        {/* Alertas Activas */}
        {estadisticas.alertas.total > 0 && (
          <>
            <SectionHeader
              title="Alertas Activas"
              icon="🚨"
              rightComponent={
                <View style={styles.alertBadgeContainer}>
                  <AlertBadge count={estadisticas.alertas.alta} severity="alta" label="ALTA" />
                  <AlertBadge count={estadisticas.alertas.media} severity="media" label="MEDIA" />
                </View>
              }
            />
            <View style={styles.card}>
              <Text style={styles.alertInfo}>
                {estadisticas.alertas.alta > 0 && '🔴 '}
                Hay {estadisticas.alertas.total} alerta{estadisticas.alertas.total !== 1 ? 's' : ''} que requieren atención
              </Text>
            </View>
          </>
        )}

        {/* Incidencias Detalladas */}
        {estadisticas.noEntregados > 0 && (
          <>
            <SectionHeader
              title="Incidencias"
              icon="📦"
              rightComponent={
                <View style={styles.incidenciasBadge}>
                  <Text style={styles.incidenciasBadgeText}>
                    {estadisticas.noEntregados}
                  </Text>
                </View>
              }
            />

            <IncidenciaItem
              icon="🏠"
              label="Cliente no estaba"
              count={estadisticas.incidenciasPorMotivo.CLIENTE_NO_ESTABA}
              color="#f59e0b"
            />
            <IncidenciaItem
              icon="📍"
              label="Datos incorrectos"
              count={estadisticas.incidenciasPorMotivo.DATOS_INCORRECTOS}
              color="#ef4444"
            />
            <IncidenciaItem
              icon="⚠️"
              label="Alto riesgo"
              count={estadisticas.incidenciasPorMotivo.ALTO_RIESGO}
              color="#dc2626"
            />
            <IncidenciaItem
              icon="🚚"
              label="Cambio de domicilio"
              count={estadisticas.incidenciasPorMotivo.CAMBIO_DOMICILIO}
              color="#6366f1"
            />
            <IncidenciaItem
              icon="❌"
              label="Rechazo del cliente"
              count={estadisticas.incidenciasPorMotivo.RECHAZO}
              color="#ef4444"
            />
            <IncidenciaItem
              icon="⁉️"
              label="Otros motivos"
              count={estadisticas.incidenciasPorMotivo.OTRA_RAZON}
              color="#64748b"
            />

            {/* Resumen de incidencias */}
            <View style={[styles.card, styles.resumenCard]}>
              <Text style={styles.resumenTitle}>Resumen de Incidencias</Text>
              <View style={styles.resumenRow}>
                <Text style={styles.resumenLabel}>Total rechazados:</Text>
                <Text style={[styles.resumenValue, { color: '#ef4444' }]}>
                  {estadisticas.noEntregados}
                </Text>
              </View>
              <View style={styles.resumenRow}>
                <Text style={styles.resumenLabel}>Tasa de rechazo:</Text>
                <Text style={[styles.resumenValue, { color: '#ef4444' }]}>
                  {estadisticas.tasaRechazo}%
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Intentos de Entrega */}
        <SectionHeader title="Intentos de Entrega" icon="🔄" />
        <View style={styles.card}>
          <View style={styles.intentosGrid}>
            <MiniStatCard
              value={estadisticas.intentosPorNumero.primero}
              label="1er Intento"
              color="#10b981"
            />
            <MiniStatCard
              value={estadisticas.intentosPorNumero.segundo}
              label="2do Intento"
              color="#f59e0b"
            />
            <MiniStatCard
              value={estadisticas.intentosPorNumero.tercero}
              label="3er Intento"
              color="#ef4444"
            />
            {estadisticas.intentosPorNumero.masDeTres > 0 && (
              <MiniStatCard
                value={estadisticas.intentosPorNumero.masDeTres}
                label="Más de 3"
                color="#dc2626"
              />
            )}
          </View>
        </View>

        {/* Pedidos AVISO */}
        {estadisticas.avisos > 0 && (
          <>
            <SectionHeader
              title="Pedidos Tipo AVISO"
              icon="⚡"
              rightComponent={
                <View style={styles.avisosBadge}>
                  <Text style={styles.avisosBadgeText}>{estadisticas.avisos}</Text>
                </View>
              }
            />
            <View style={styles.card}>
              <Text style={styles.avisosInfo}>
                Hay {estadisticas.avisos} pedido{estadisticas.avisos !== 1 ? 's' : ''} que requieren atención especial
              </Text>
            </View>
          </>
        )}

        {/* Top Repartidores */}
        {topRepartidores.length > 0 && (
          <>
            <SectionHeader title="Top Repartidores" icon="🏆" />
            {topRepartidores.map((rep, index) => (
              <TopRepartidorCard
                key={rep.id}
                ranking={index + 1}
                nombre={rep.nombre}
                tasaExito={rep.tasaExito}
                entregas={rep.entregas}
                color={index === 0 ? '#10b981' : index === 1 ? '#3b82f6' : '#f59e0b'}
              />
            ))}
          </>
        )}

        {/* Métricas Adicionales */}
        <SectionHeader title="Métricas Generales" icon="📊" />
        <View style={styles.metricsGrid}>
          <MiniStatCard
            value={estadisticas.totalPedidos}
            label="Total Pedidos"
            color="#0f172a"
          />
          <MiniStatCard
            value={estadisticas.promedioEntregasPorRepartidor}
            label="Promedio/Rep"
            color="#6366f1"
          />
          <MiniStatCard
            value={estadisticas.enRuta}
            label="En Ruta"
            color="#3b82f6"
          />
          <MiniStatCard
            value={estadisticas.pendientes}
            label="Pendientes"
            color="#f59e0b"
          />
        </View>

        {/* Espacio final */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  progressDetails: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  alertBadgeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  alertInfo: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
    textAlign: 'center',
  },
  incidenciasBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  incidenciasBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ef4444',
  },
  resumenCard: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  resumenTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#92400e',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resumenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#fef3c7',
  },
  resumenLabel: {
    fontSize: 14,
    color: '#78350f',
    fontWeight: '600',
  },
  resumenValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  intentosGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  avisosBadge: {
    backgroundColor: '#dbeafe',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  avisosBadgeText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1e40af',
  },
  avisosInfo: {
    fontSize: 14,
    color: '#1e40af',
    fontWeight: '600',
    textAlign: 'center',
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  bottomSpacer: {
    height: 32,
  },
});
