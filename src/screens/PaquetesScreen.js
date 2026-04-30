import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import {
  obtenerPedidosHoy,
  convertirPedidoBackend,
  iniciarRecorrido,
  finalizarRecorrido
} from '../services/repartidorApi';
import PaqueteCard from '../components/PaqueteCard';
import GPSStatusIndicator from '../components/GPSStatusIndicator';
import IslandBar from '../components/IslandBar';
import Button from '../components/Button';
import LoadingScreen from '../components/LoadingScreen';

const FILTROS = [
  { id: 'TODOS', label: 'Todos' },
  { id: 'PENDIENTE', label: 'Pendientes' },
  { id: 'EN_RUTA', label: 'En Ruta' },
  { id: 'ENTREGADO', label: 'Entregados' },
  { id: 'NO_ENTREGADO', label: 'Incidencias' }
];

export default function PaquetesScreen({ navigation }) {
  const { user, logout, refreshUser } = useAuth();
  const [paquetes, setPaquetes] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState('TODOS');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enRuta, setEnRuta] = useState(false);
  const [recorridoId, setRecorridoId] = useState(null);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  // Hook de geolocalización
  const {
    ubicacion,
    error: errorGPS,
    tracking,
    ultimoEnvio,
    solicitarPermisos
  } = useGeolocation({
    repartidorId: user?.repartidor?.idRepartidor,
    enabled: enRuta,
    estadoActividad: enRuta ? 'EN_RUTA' : 'EN_ALMACEN',
    intervalo: 15000
  });

  // Cargar paquetes cuando el usuario esté disponible
  useEffect(() => {
    if (user?.repartidor?.idRepartidor) {
      cargarPaquetes();
    }
  }, [user]);

  // Recargar paquetes y datos del usuario cuando la pantalla vuelve al foco
  useFocusEffect(
    React.useCallback(() => {
      const recargarDatos = async () => {
        if (user?.repartidor?.idRepartidor) {
          // Refrescar datos del usuario (incluyendo carritos actualizados)
          try {
            await refreshUser();
          } catch (error) {
            console.warn('No se pudieron refrescar los datos del usuario:', error);
          }

          // Cargar paquetes
          cargarPaquetes();
        }
      };

      recargarDatos();
    }, [user?.repartidor?.idRepartidor])
  );

  // Actualizar estado de enRuta cuando cambian los paquetes
  useEffect(() => {
    const hayEnRuta = paquetes.some(p => p.estado === 'EN_RUTA');
    setEnRuta(hayEnRuta);
  }, [paquetes]);

  const cargarPaquetes = async () => {
    // Debug: Ver estructura del usuario
    console.log('👤 Usuario completo:', JSON.stringify(user, null, 2));
    console.log('👤 ID del repartidor:', user?.repartidor?.idRepartidor);
    console.log('🚛 Carritos asignados:', user?.repartidor?.carritos);

    const repartidorId = user?.repartidor?.idRepartidor;
    if (!repartidorId) {
      console.warn('⚠️ No se encontró idRepartidor en el usuario');
      return;
    }

    try {
      console.log('📦 Cargando pedidos para repartidor:', repartidorId);
      const pedidosBackend = await obtenerPedidosHoy(repartidorId);
      console.log('✅ Pedidos recibidos del backend:', pedidosBackend.length);
      console.log('📋 Primer pedido (raw):', JSON.stringify(pedidosBackend[0], null, 2));

      const pedidosConvertidos = pedidosBackend.map(convertirPedidoBackend);
      console.log('🔄 Pedidos convertidos:', pedidosConvertidos.length);
      console.log('📋 Primer pedido (convertido):', JSON.stringify(pedidosConvertidos[0], null, 2));

      setPaquetes(pedidosConvertidos);
      console.log('💾 Pedidos guardados en estado');
    } catch (error) {
      console.error('❌ Error al cargar paquetes:', error);
      console.error('❌ Stack:', error.stack);
      Alert.alert('Error', 'No se pudieron cargar los paquetes. Intenta de nuevo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    cargarPaquetes();
  };

  const handlePaquetePress = (paquete) => {
    navigation.navigate('PaqueteDetalle', {
      paquete,
      ubicacion
    });
  };

  const actualizarEstadoPaquete = (paqueteId, nuevoEstado, evidencias) => {
    setPaquetes(prevPaquetes =>
      prevPaquetes.map(paquete => {
        if (paquete.id !== paqueteId) return paquete;

        const ahora = new Date().toISOString();
        const nuevasEvidencias = {
          ...paquete.evidencias,
          ...evidencias,
          ultimaActualizacion: ahora
        };

        // Agregar fecha/hora de entrega si se marca como entregado
        if (nuevoEstado === 'ENTREGADO' && !paquete.evidencias?.fechaEntrega) {
          nuevasEvidencias.fechaEntrega = ahora;
        }

        // Agregar fecha/hora de no entrega
        if (nuevoEstado === 'NO_ENTREGADO' && !paquete.evidencias?.fechaNoEntrega) {
          nuevasEvidencias.fechaNoEntrega = ahora;
        }

        return {
          ...paquete,
          estado: nuevoEstado,
          evidencias: nuevasEvidencias
        };
      })
    );

    // Si es el primer EN_RUTA, iniciar recorrido
    if (nuevoEstado === 'EN_RUTA' && !recorridoId) {
      iniciarRecorridoBackend();
    }

    // Si todos están completos, finalizar recorrido
    const todosCompletos = paquetes.every(p =>
      p.id === paqueteId
        ? (nuevoEstado === 'ENTREGADO' || nuevoEstado === 'NO_ENTREGADO')
        : (p.estado === 'ENTREGADO' || p.estado === 'NO_ENTREGADO')
    );

    if (todosCompletos && recorridoId) {
      finalizarRecorridoBackend();
    }
  };

  const iniciarRecorridoBackend = async () => {
    try {
      const recorrido = await iniciarRecorrido(user.repartidor.idRepartidor);
      setRecorridoId(recorrido.id);
      console.log('Recorrido iniciado:', recorrido.id);
    } catch (error) {
      console.error('Error al iniciar recorrido:', error);
    }
  };

  const finalizarRecorridoBackend = async () => {
    try {
      await finalizarRecorrido(user.repartidor.idRepartidor);
      setRecorridoId(null);
      setEnRuta(false);
      console.log('Recorrido finalizado');
    } catch (error) {
      console.error('Error al finalizar recorrido:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Salir', onPress: logout, style: 'destructive' }
      ]
    );
  };

  // Abrir navegación GPS
  const handleOpenNavigation = () => {
    if (pedidosEnRuta.length === 0) return;

    // Seleccionar el primer pedido si no hay ninguno seleccionado
    const pedidoParaNavegar = pedidoSeleccionado || pedidosEnRuta[0];

    navigation.navigate('NavigationMap', {
      pedidos: pedidosEnRuta,
      ubicacionActual: ubicacion ? {
        lat: ubicacion.latitud,
        lng: ubicacion.longitud
      } : null
    });
  };

  // Filtrar pedidos EN_RUTA
  const pedidosEnRuta = paquetes.filter(p => p.estado === 'EN_RUTA');


  // Filtrar paquetes
  const paquetesFiltrados = filtroActivo === 'TODOS'
    ? paquetes
    : paquetes.filter(p => p.estado === filtroActivo);

  // Contadores
  const contadores = {
    TODOS: paquetes.length,
    PENDIENTE: paquetes.filter(p => p.estado === 'PENDIENTE').length,
    EN_RUTA: paquetes.filter(p => p.estado === 'EN_RUTA').length,
    ENTREGADO: paquetes.filter(p => p.estado === 'ENTREGADO').length,
    NO_ENTREGADO: paquetes.filter(p => p.estado === 'NO_ENTREGADO').length
  };

  if (loading) {
    return <LoadingScreen message="Cargando pedidos..." />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Ruta del día</Text>
          <Text style={styles.headerSubtitle}>Hola, {user?.nombre}</Text>
          {user?.repartidor?.carritos && (
            <Text style={styles.headerInfo}>
              Carritos: {Array.isArray(user.repartidor.carritos)
                ? user.repartidor.carritos.length
                : user.repartidor.carritos}
            </Text>
          )}
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      {/* Resumen */}
      <View style={styles.summary}>
        <SummaryCard label="Asignados" value={contadores.TODOS} />
        <SummaryCard label="En ruta" value={contadores.EN_RUTA} color="#2563eb" />
        <SummaryCard label="Entregados" value={contadores.ENTREGADO} color="#10b981" />
        <SummaryCard label="Incidencias" value={contadores.NO_ENTREGADO} color="#ef4444" />
      </View>

      {/* GPS Status */}
      <View style={styles.content}>
        <GPSStatusIndicator
          tracking={tracking}
          ubicacion={ubicacion}
          ultimoEnvio={ultimoEnvio}
          error={errorGPS}
        />

        {/* Filtros */}
        <View style={styles.filtros}>
          {FILTROS.map(filtro => (
            <TouchableOpacity
              key={filtro.id}
              style={[
                styles.filtroChip,
                filtroActivo === filtro.id && styles.filtroChipActive
              ]}
              onPress={() => setFiltroActivo(filtro.id)}
            >
              <Text style={[
                styles.filtroText,
                filtroActivo === filtro.id && styles.filtroTextActive
              ]}>
                {filtro.label} ({contadores[filtro.id] || 0})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lista de paquetes */}
        <FlatList
          data={paquetesFiltrados}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <PaqueteCard
              paquete={item}
              isSelected={false}
              onPress={() => handlePaquetePress(item)}
            />
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                No hay paquetes {filtroActivo !== 'TODOS' ? 'con este estado' : 'asignados'}
              </Text>
            </View>
          }
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      </View>

      {/* IslandBar flotante - aparece cuando hay pedidos EN_RUTA */}
      <IslandBar
        pedidosEnRuta={pedidosEnRuta.length}
        pedidoActual={pedidoSeleccionado}
        onPress={handleOpenNavigation}
        isExpanded={pedidoSeleccionado !== null}
      />
    </View>
  );
}

function SummaryCard({ label, value, color = '#64748b' }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
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
    padding: 16,
    paddingTop: 48,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#bfdbfe',
    marginTop: 2,
  },
  headerInfo: {
    fontSize: 12,
    color: '#bfdbfe',
    marginTop: 4,
    fontWeight: '600',
  },
  logoutButton: {
    padding: 8,
  },
  logoutText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  summary: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#64748b',
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  filtroChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  filtroChipActive: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb',
  },
  filtroText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
  },
  filtroTextActive: {
    color: '#ffffff',
  },
  listContent: {
    paddingBottom: 16,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
  },
});
