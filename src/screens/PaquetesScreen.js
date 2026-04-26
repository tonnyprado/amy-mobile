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
  const { user, logout } = useAuth();
  const [paquetes, setPaquetes] = useState([]);
  const [filtroActivo, setFiltroActivo] = useState('TODOS');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [enRuta, setEnRuta] = useState(false);
  const [recorridoId, setRecorridoId] = useState(null);

  // Hook de geolocalización
  const {
    ubicacion,
    error: errorGPS,
    tracking,
    ultimoEnvio,
    solicitarPermisos
  } = useGeolocation({
    repartidorId: user?.id,
    enabled: enRuta,
    estadoActividad: enRuta ? 'EN_RUTA' : 'EN_ALMACEN',
    intervalo: 15000
  });

  // Cargar paquetes al montar
  useEffect(() => {
    cargarPaquetes();
  }, []);

  // Actualizar estado de enRuta cuando cambian los paquetes
  useEffect(() => {
    const hayEnRuta = paquetes.some(p => p.estado === 'EN_RUTA');
    setEnRuta(hayEnRuta);
  }, [paquetes]);

  const cargarPaquetes = async () => {
    if (!user?.id) return;

    try {
      const pedidosBackend = await obtenerPedidosHoy(user.id);
      const pedidosConvertidos = pedidosBackend.map(convertirPedidoBackend);
      setPaquetes(pedidosConvertidos);
    } catch (error) {
      console.error('Error al cargar paquetes:', error);
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
      ubicacion,
      onActualizarEstado: actualizarEstadoPaquete
    });
  };

  const actualizarEstadoPaquete = (paqueteId, nuevoEstado, evidencias) => {
    setPaquetes(prevPaquetes =>
      prevPaquetes.map(paquete => {
        if (paquete.id !== paqueteId) return paquete;

        return {
          ...paquete,
          estado: nuevoEstado,
          evidencias: {
            ...paquete.evidencias,
            ...evidencias,
            ultimaActualizacion: new Date().toISOString()
          }
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
      const recorrido = await iniciarRecorrido(user.id);
      setRecorridoId(recorrido.id);
      console.log('Recorrido iniciado:', recorrido.id);
    } catch (error) {
      console.error('Error al iniciar recorrido:', error);
    }
  };

  const finalizarRecorridoBackend = async () => {
    try {
      await finalizarRecorrido(user.id);
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
