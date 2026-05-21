import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import IconButton from '../components/ui/IconButton';
import theme from '../theme';
import {
  obtenerPedidosHoy,
  convertirPedidoBackend,
  iniciarRecorrido,
  finalizarRecorrido,
  comenzarRuta
} from '../services/repartidorApi';
import {
  optimizarRuta,
  formatearDistancia,
  formatearDuracion,
  validarPedidosParaOptimizacion
} from '../services/routeOptimizationService';
import { programarNotificacionesDiarias } from '../services/notificationService';
import { guardarOrdenPedidos } from '../services/pedidoOrdenApi';
import PaqueteCard from '../components/PaqueteCard';
import PedidosListaConOrden from '../components/PedidosListaConOrden';
import GPSStatusIndicator from '../components/GPSStatusIndicator';
import IslandBar from '../components/IslandBar';
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
  const [optimizando, setOptimizando] = useState(false);
  const lastFocusRefreshRef = React.useRef(0);

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
    intervalo: 60000 // Optimizado: 60s en lugar de 15s (ahorro ~80% datos GPS)
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
          const ahora = Date.now();
          const recentlyRefreshed = ahora - lastFocusRefreshRef.current < 45000;

          if (recentlyRefreshed) {
            return;
          }

          lastFocusRefreshRef.current = ahora;

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

  // Configurar notificaciones locales al montar el componente
  useEffect(() => {
    const configurarNotificaciones = async () => {
      try {
        await programarNotificacionesDiarias();
        console.log('✅ Notificaciones diarias configuradas correctamente');
      } catch (error) {
        console.error('❌ Error al configurar notificaciones:', error);
      }
    };

    configurarNotificaciones();
  }, []); // Solo al montar

  const cargarPaquetes = async () => {
    const repartidorId = user?.repartidor?.idRepartidor;
    if (!repartidorId) {
      console.warn('⚠️ No se encontró idRepartidor en el usuario');
      return;
    }

    try {
      const pedidosBackend = await obtenerPedidosHoy(repartidorId);
      const pedidosConvertidos = pedidosBackend.map(convertirPedidoBackend);
      setPaquetes(pedidosConvertidos);
    } catch (error) {
      console.error('❌ Error al cargar paquetes:', error);
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

  // Comenzar ruta - Cambia todos los pedidos PENDIENTE a EN_RUTA
  const handleComenzarRuta = async () => {
    const pedidosPendientes = paquetes.filter(p => p.estado === 'PENDIENTE');

    if (pedidosPendientes.length === 0) {
      Alert.alert('Sin pedidos pendientes', 'No hay pedidos pendientes para iniciar la ruta.');
      return;
    }

    Alert.alert(
      '🚀 Comenzar Ruta',
      `¿Estás listo para comenzar tu ruta?\n\n` +
      `Se cambiarán ${pedidosPendientes.length} pedido(s) de PENDIENTE a EN_RUTA.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Comenzar',
          style: 'default',
          onPress: async () => {
            try {
              const resultado = await comenzarRuta(user.repartidor.idRepartidor);

              Alert.alert(
                '✅ Ruta Iniciada',
                `${resultado.pedidosActualizados} pedido(s) están ahora EN_RUTA.`
              );

              // Recargar pedidos para reflejar el cambio
              await cargarPaquetes();
            } catch (error) {
              console.error('Error al comenzar ruta:', error);
              Alert.alert(
                'Error',
                error.message || 'No se pudo iniciar la ruta. Intenta de nuevo.'
              );
            }
          }
        }
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

  // Manejar optimización de ruta
  const handleOptimizarRuta = async () => {
    // Validar que hay pedidos para optimizar
    const validacion = validarPedidosParaOptimizacion(pedidosEnRuta);

    if (!validacion.valido) {
      Alert.alert(
        validacion.advertencia ? 'Información' : 'Error',
        validacion.errores.join('\n')
      );
      return;
    }

    // Validar que hay ubicación GPS
    if (!ubicacion || !ubicacion.latitud || !ubicacion.longitud) {
      Alert.alert(
        'GPS no disponible',
        'Necesitamos tu ubicación para calcular la ruta óptima. Por favor, activa el GPS e intenta de nuevo.'
      );
      return;
    }

    setOptimizando(true);

    try {
      console.log('[OPTIMIZACIÓN] Iniciando optimización para', pedidosEnRuta.length, 'pedidos');

      const resultado = await optimizarRuta(pedidosEnRuta, {
        lat: ubicacion.latitud,
        lng: ubicacion.longitud
      });

      console.log('[OPTIMIZACIÓN] Resultado:', resultado);

      // Mostrar resultados al usuario
      Alert.alert(
        '🎯 Ruta Optimizada',
        `📍 Distancia total: ${formatearDistancia(resultado.distanciaTotal)}\n` +
        `⏱️ Tiempo estimado: ${formatearDuracion(resultado.duracionTotal)}\n\n` +
        (resultado.ahorroKm > 0
          ? `💰 Ahorro: ${resultado.ahorroKm}km (${resultado.ahorroPorcentaje}%)\n\n` +
            `Esto te ahorrará tiempo y combustible. ¿Quieres aplicar este orden?`
          : `El orden actual ya es bastante eficiente. ¿Quieres aplicar el orden sugerido de todos modos?`
        ),
        [
          {
            text: 'Cancelar',
            style: 'cancel'
          },
          {
            text: 'Ver en Mapa',
            onPress: () => {
              // Aplicar el orden optimizado primero
              aplicarOrdenOptimizado(resultado.pedidos);
              // Luego abrir el mapa
              handleOpenNavigation();
            }
          },
          {
            text: 'Aplicar',
            style: 'default',
            onPress: () => aplicarOrdenOptimizado(resultado.pedidos)
          }
        ]
      );

    } catch (error) {
      console.error('[OPTIMIZACIÓN] Error:', error);
      Alert.alert(
        'Error al Optimizar',
        error.message || 'No se pudo calcular la ruta óptima. Verifica tu conexión e intenta de nuevo.'
      );
    } finally {
      setOptimizando(false);
    }
  };

  // Aplicar el orden optimizado de pedidos
  const aplicarOrdenOptimizado = async (pedidosOptimizados) => {
    const idsOrdenados = pedidosOptimizados.map(p => p.id);

    setPaquetes(prevPaquetes => {
      // Separar pedidos EN_RUTA de los demás
      const enRuta = prevPaquetes.filter(p => p.estado === 'EN_RUTA');
      const otrosEstados = prevPaquetes.filter(p => p.estado !== 'EN_RUTA');

      // Ordenar los EN_RUTA según la optimización
      const enRutaOrdenados = idsOrdenados
        .map(id => enRuta.find(p => p.id === id))
        .filter(Boolean); // Eliminar nulls

      // Retornar: primero los EN_RUTA ordenados, luego los demás
      return [...enRutaOrdenados, ...otrosEstados];
    });

    // ✅ NUEVO: Guardar el orden optimizado en el backend
    try {
      const pedidosOrden = pedidosOptimizados.map((pedido, index) => ({
        pedidoId: pedido.id,
        orden: index + 1
      }));

      await guardarOrdenPedidos(user.repartidor.idRepartidor, pedidosOrden);

      Alert.alert(
        '✅ Ruta Aplicada y Guardada',
        'Los pedidos se han reordenado y guardado. Sigue el nuevo orden para la entrega más eficiente.'
      );
    } catch (error) {
      console.error('[ORDEN] Error al guardar orden optimizado:', error);
      // No bloquear - el orden ya se aplicó en UI
      Alert.alert(
        '⚠️ Ruta Aplicada (sin guardar)',
        'Los pedidos se reordenaron pero no se pudo guardar en el servidor. El orden se perderá si recargas la app.'
      );
    }
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
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Ruta del día</Text>
          <Text style={styles.headerSubtitle}>Hola, {user?.nombre}</Text>
          {user?.repartidor?.carritos && (
            <View style={styles.headerCarritosContainer}>
              <Ionicons name="cart-outline" size={14} color={theme.colors.textMuted} />
              <Text style={styles.headerInfo}>
                {Array.isArray(user.repartidor.carritos)
                  ? user.repartidor.carritos.length
                  : user.repartidor.carritos}
                {' carritos'}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          <IconButton
            size={40}
            backgroundColor={theme.colors.surfaceElevated}
            onPress={() => navigation.navigate('ChatInbox')}
          >
            <Ionicons name="chatbubble-outline" size={20} color={theme.colors.textPrimary} />
          </IconButton>
          <IconButton
            size={40}
            backgroundColor={theme.colors.surfaceElevated}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
          </IconButton>
        </View>
      </View>

      {/* Resumen */}
      <View style={styles.summary}>
        <SummaryCard label="Asignados" value={contadores.TODOS} color={theme.colors.textPrimary} />
        <SummaryCard label="En ruta" value={contadores.EN_RUTA} color={theme.colors.info} />
        <SummaryCard label="Entregados" value={contadores.ENTREGADO} color={theme.colors.success} />
        <SummaryCard label="Incidencias" value={contadores.NO_ENTREGADO} color={theme.colors.error} />
      </View>

      {/* GPS Status */}
      <View style={styles.content}>
        <GPSStatusIndicator
          tracking={tracking}
          ubicacion={ubicacion}
          ultimoEnvio={ultimoEnvio}
          error={errorGPS}
        />

        {/* Botón Comenzar Ruta */}
        {contadores.PENDIENTE > 0 && (
          <TouchableOpacity
            style={styles.comenzarRutaButton}
            onPress={handleComenzarRuta}
            activeOpacity={0.7}
          >
            <View style={styles.comenzarRutaContent}>
              <View style={styles.comenzarRutaLeft}>
                <Text style={styles.comenzarRutaIcon}>🚀</Text>
                <View style={styles.comenzarRutaTextContainer}>
                  <Text style={styles.comenzarRutaTitle}>Comenzar Ruta</Text>
                  <Text style={styles.comenzarRutaSubtitle}>
                    {contadores.PENDIENTE} pedido(s) pendiente(s)
                  </Text>
                </View>
              </View>
              <Text style={styles.comenzarRutaArrow}>→</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Botón de Optimización de Ruta */}
        {pedidosEnRuta.length >= 2 && (
          <TouchableOpacity
            style={[
              styles.optimizeButton,
              optimizando && styles.optimizeButtonDisabled
            ]}
            onPress={handleOptimizarRuta}
            disabled={optimizando}
            activeOpacity={0.7}
          >
            <View style={styles.optimizeButtonContent}>
              <View style={styles.optimizeButtonLeft}>
                <Text style={styles.optimizeButtonIcon}>🎯</Text>
                <View style={styles.optimizeButtonTextContainer}>
                  <Text style={styles.optimizeButtonTitle}>
                    {optimizando ? 'Calculando...' : 'Optimizar Ruta'}
                  </Text>
                  <Text style={styles.optimizeButtonSubtitle}>
                    {optimizando
                      ? 'Encontrando la mejor ruta'
                      : `${pedidosEnRuta.length} paradas • Ruta más rápida`
                    }
                  </Text>
                </View>
              </View>
              {optimizando ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.optimizeButtonArrow}>→</Text>
              )}
            </View>
          </TouchableOpacity>
        )}

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

        {/* Lista de paquetes con capacidad de reorden */}
        {(filtroActivo === 'PENDIENTE' || filtroActivo === 'EN_RUTA' || filtroActivo === 'TODOS') ? (
          // Estados reordenables: PENDIENTE, EN_RUTA y TODOS
          <PedidosListaConOrden
            pedidos={paquetesFiltrados}
            idRepartidor={user?.repartidor?.idRepartidor}
            onPedidoPress={handlePaquetePress}
            onOrdenGuardado={(resultado) => {
              console.log('[ORDEN] Orden guardado:', resultado);
              // Recargar pedidos para sincronizar con backend
              cargarPaquetes();
            }}
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
        ) : (
          // Estados NO reordenables: ENTREGADO y NO_ENTREGADO
          // Estos ya están completos, no tiene sentido reordenarlos
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
        )}
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

function SummaryCard({ label, value, color = theme.colors.textSecondary }) {
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
    backgroundColor: theme.colors.background,
  },
  header: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    padding: theme.spacing.lg,
    paddingTop: 48,
    paddingBottom: theme.spacing.xl,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  headerCarritosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  headerInfo: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
    fontWeight: theme.typography.weights.medium,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  summary: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  summaryCard: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  summaryValue: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  filtroChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filtroChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filtroText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.textSecondary,
  },
  filtroTextActive: {
    color: theme.colors.textPrimary,
  },
  listContent: {
    paddingBottom: theme.spacing.lg,
  },
  empty: {
    padding: theme.spacing.xxxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.typography.sizes.base,
    color: theme.colors.textMuted,
  },
  optimizeButton: {
    backgroundColor: theme.colors.success,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  optimizeButtonDisabled: {
    opacity: 0.6,
  },
  optimizeButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optimizeButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optimizeButtonIcon: {
    fontSize: 28,
    marginRight: theme.spacing.md,
  },
  optimizeButtonTextContainer: {
    flex: 1,
  },
  optimizeButtonTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  optimizeButtonSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: theme.typography.weights.medium,
  },
  optimizeButtonArrow: {
    fontSize: 24,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold,
  },
  comenzarRutaButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.md,
  },
  comenzarRutaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  comenzarRutaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  comenzarRutaIcon: {
    fontSize: 28,
    marginRight: theme.spacing.md,
  },
  comenzarRutaTextContainer: {
    flex: 1,
  },
  comenzarRutaTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: 2,
  },
  comenzarRutaSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: theme.typography.weights.medium,
  },
  comenzarRutaArrow: {
    fontSize: 24,
    color: theme.colors.textPrimary,
    fontWeight: theme.typography.weights.semibold,
  },
});
