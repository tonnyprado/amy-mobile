/**
 * Ejemplo de Integración Completa del Sistema Offline-First
 * Este archivo muestra cómo integrar todos los componentes en una pantalla real
 *
 * NO es código de producción, es solo un ejemplo educativo
 */

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useNetworkStatus } from './src/hooks/useNetworkStatus';
import offlineQueueService, { OPERATION_TYPES } from './src/services/offlineQueueService';
import NetworkStatusBar from './src/components/NetworkStatusBar';
import { repartidorApi } from './src/services/repartidorApi';

/**
 * Ejemplo 1: Pantalla de Repartidor con Sistema Offline
 */
function RepartidorScreenExample() {
  const [pedidos, setPedidos] = useState([]);
  const [ubicacionActual, setUbicacionActual] = useState(null);

  // Hook de estado de red con configuración completa
  const {
    isOnline,
    isOffline,
    connectionType,
    isExpensive,
    isSyncing,
    pendingOperations,
    hasPendingOperations,
    syncPendingOperations,
    getQueueStats,
  } = useNetworkStatus({
    autoSync: true,
    syncInterval: 60000, // Sincronizar cada minuto
    onConnectionChange: (status) => {
      if (status.isConnected) {
        console.log('Conexión restaurada via', status.type);
        Alert.alert(
          'Online',
          'Conexión restaurada. Sincronizando datos...'
        );
      } else {
        console.log('Conexión perdida');
        Alert.alert(
          'Offline',
          'Sin conexión. Tus acciones se guardarán y sincronizarán automáticamente.'
        );
      }
    },
    onSyncComplete: (resultado) => {
      if (resultado.procesadas > 0) {
        console.log(`${resultado.procesadas} operaciones sincronizadas`);
      }
    },
  });

  // Simular rastreo GPS cada 30 segundos
  useEffect(() => {
    const gpsInterval = setInterval(() => {
      enviarUbicacionGPS();
    }, 30000);

    return () => clearInterval(gpsInterval);
  }, []);

  /**
   * Envía ubicación GPS con fallback offline
   */
  const enviarUbicacionGPS = async () => {
    if (!ubicacionActual) return;

    const ubicacionData = {
      repartidorId: '0001',
      latitud: ubicacionActual.latitude,
      longitud: ubicacionActual.longitude,
      precision: ubicacionActual.accuracy,
      velocidad: ubicacionActual.speed || 0,
      estadoActividad: 'EN_RUTA',
      bateria: 85, // Obtener de expo-battery
    };

    try {
      if (isOnline) {
        // Intenta enviar directo si hay conexión
        await repartidorApi.enviarUbicacion(ubicacionData);
        console.log('Ubicación enviada');
      } else {
        // Sin conexión: agregar a cola
        await offlineQueueService.agregarOperacion(
          OPERATION_TYPES.ENVIAR_UBICACION,
          ubicacionData
        );
        console.log('Ubicación guardada en cola offline');
      }
    } catch (error) {
      // Si falla estando online, usar cola como fallback
      console.error('Error enviando ubicación:', error);
      await offlineQueueService.agregarOperacion(
        OPERATION_TYPES.ENVIAR_UBICACION,
        ubicacionData
      );
    }
  };

  /**
   * Registra actividad con manejo offline
   */
  const registrarActividad = async (tipo, pedido = null) => {
    const actividadData = {
      repartidorId: '0001',
      tipo,
      pedidoId: pedido?.id,
      descripcion: `Actividad: ${tipo}`,
      pedidoNumero: pedido?.numeroPedido,
      consultora: pedido?.consultora,
      direccion: pedido?.direccionConsultora,
      latitud: ubicacionActual?.latitude,
      longitud: ubicacionActual?.longitude,
    };

    try {
      if (isOnline) {
        await repartidorApi.registrarActividad(actividadData);
      } else {
        await offlineQueueService.agregarOperacion(
          OPERATION_TYPES.REGISTRAR_ACTIVIDAD,
          actividadData
        );
      }
    } catch (error) {
      await offlineQueueService.agregarOperacion(
        OPERATION_TYPES.REGISTRAR_ACTIVIDAD,
        actividadData
      );
    }
  };

  /**
   * Registra intento de entrega
   */
  const registrarEntrega = async (pedido, exitosa, motivo = null) => {
    const intentoData = {
      pedidoId: pedido.id,
      latitudIntento: ubicacionActual?.latitude,
      longitudIntento: ubicacionActual?.longitude,
      resultado: exitosa ? 'ENTREGADO' : 'NO_ENTREGADO',
      motivoFallo: exitosa ? null : motivo,
      descripcionFallo: exitosa ? null : 'Descripción del fallo',
      observaciones: 'Observaciones adicionales',
    };

    try {
      if (isOnline) {
        const resultado = await repartidorApi.registrarIntentoEntrega(intentoData);
        Alert.alert('Éxito', 'Entrega registrada correctamente');
        return resultado;
      } else {
        await offlineQueueService.agregarOperacion(
          OPERATION_TYPES.REGISTRAR_INTENTO_ENTREGA,
          intentoData
        );
        Alert.alert(
          'Guardado',
          'Entrega guardada. Se sincronizará cuando haya conexión.'
        );
      }
    } catch (error) {
      await offlineQueueService.agregarOperacion(
        OPERATION_TYPES.REGISTRAR_INTENTO_ENTREGA,
        intentoData
      );
      Alert.alert(
        'Guardado',
        'Entrega guardada. Se sincronizará automáticamente.'
      );
    }
  };

  /**
   * Ver estadísticas de la cola
   */
  const verEstadisticas = async () => {
    const stats = await getQueueStats();
    Alert.alert(
      'Estadísticas de Cola',
      `Total: ${stats.total}
Antiguas (>1h): ${stats.antiguedad.mas1Hora}
Muy antiguas (>24h): ${stats.antiguedad.mas24Horas}
Max intentos: ${stats.maxIntentos}

Por tipo:
${Object.entries(stats.porTipo).map(([tipo, count]) => `${tipo}: ${count}`).join('\n')}`
    );
  };

  return (
    <View style={styles.container}>
      {/* Barra de estado de red */}
      <NetworkStatusBar theme={theme} />

      {/* Header con info */}
      <View style={styles.header}>
        <Text style={styles.title}>Repartidor App</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusText}>
            {isOnline ? '🟢 Online' : '🔴 Offline'}
          </Text>
          {isExpensive && (
            <Text style={styles.expensiveText}>📱 Datos móviles</Text>
          )}
          {isSyncing && (
            <Text style={styles.syncingText}>🔄 Sincronizando...</Text>
          )}
        </View>
        {hasPendingOperations && (
          <TouchableOpacity
            style={styles.syncButton}
            onPress={syncPendingOperations}
          >
            <Text style={styles.syncButtonText}>
              Sincronizar {pendingOperations} operaciones
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de pedidos optimizada */}
      <FlatList
        data={pedidos}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <PedidoItem
            pedido={item}
            onEntrega={() => registrarEntrega(item, true)}
            onNoEntrega={() => registrarEntrega(item, false, 'CLIENTE_NO_ESTABA')}
          />
        )}
        // Optimizaciones de rendimiento
        initialNumToRender={8}
        maxToRenderPerBatch={5}
        windowSize={5}
        removeClippedSubviews={true}
        getItemLayout={(data, index) => ({
          length: 100,
          offset: 100 * index,
          index,
        })}
      />

      {/* Botón de estadísticas */}
      <TouchableOpacity
        style={styles.statsButton}
        onPress={verEstadisticas}
      >
        <Text style={styles.statsButtonText}>Ver Estadísticas</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Componente de pedido individual (memoizado)
 */
const PedidoItem = React.memo(({ pedido, onEntrega, onNoEntrega }) => {
  return (
    <View style={styles.pedidoCard}>
      <Text style={styles.pedidoTitle}>#{pedido.numeroPedido}</Text>
      <Text style={styles.pedidoAddress}>{pedido.direccionConsultora}</Text>
      <Text style={styles.pedidoClient}>{pedido.nombreConsultora}</Text>

      <View style={styles.pedidoActions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.entregaButton]}
          onPress={onEntrega}
        >
          <Text style={styles.actionButtonText}>Entregar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.noEntregaButton]}
          onPress={onNoEntrega}
        >
          <Text style={styles.actionButtonText}>No Entregado</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  return prevProps.pedido.id === nextProps.pedido.id &&
         prevProps.pedido.estado === nextProps.pedido.estado;
});

/**
 * Ejemplo 2: Hook personalizado para GPS con offline
 */
function useGPSTrackingWithOffline(repartidorId) {
  const { isOnline } = useNetworkStatus({ autoSync: true });

  const enviarUbicacion = async (ubicacion) => {
    const datos = {
      repartidorId,
      latitud: ubicacion.latitude,
      longitud: ubicacion.longitude,
      precision: ubicacion.accuracy,
      velocidad: ubicacion.speed || 0,
      estadoActividad: 'EN_RUTA',
    };

    if (isOnline) {
      try {
        await repartidorApi.enviarUbicacion(datos);
        return { success: true, synced: true };
      } catch (error) {
        await offlineQueueService.agregarOperacion(
          OPERATION_TYPES.ENVIAR_UBICACION,
          datos
        );
        return { success: true, synced: false, queued: true };
      }
    } else {
      await offlineQueueService.agregarOperacion(
        OPERATION_TYPES.ENVIAR_UBICACION,
        datos
      );
      return { success: true, synced: false, queued: true };
    }
  };

  return { enviarUbicacion };
}

/**
 * Ejemplo 3: Evitar descargas pesadas en datos móviles
 */
function ImageDownloadExample() {
  const { isExpensive } = useNetworkStatus();

  const descargarImagen = async (url) => {
    if (isExpensive) {
      return new Promise((resolve, reject) => {
        Alert.alert(
          'Datos móviles',
          'Estás usando datos móviles. La descarga puede consumir tu plan. ¿Descargar igual?',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
              onPress: () => reject('Cancelado por usuario'),
            },
            {
              text: 'Descargar',
              onPress: () => resolve(ejecutarDescarga(url)),
            },
          ]
        );
      });
    } else {
      return ejecutarDescarga(url);
    }
  };

  const ejecutarDescarga = async (url) => {
    // Lógica de descarga
    console.log('Descargando:', url);
  };

  return { descargarImagen };
}

// Tema de ejemplo
const theme = {
  ink: '#1A1A1A',
  canvas: '#FFFFFF',
  surface: '#F5F5F5',
  border: '#E0E0E0',
  accent: '#FFB800',
  muted: '#666666',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
  },
  expensiveText: {
    fontSize: 14,
    color: '#FF9500',
  },
  syncingText: {
    fontSize: 14,
    color: '#007AFF',
  },
  syncButton: {
    backgroundColor: '#FFB800',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  syncButtonText: {
    color: '#1A1A1A',
    fontWeight: '600',
    textAlign: 'center',
  },
  pedidoCard: {
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pedidoTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  pedidoAddress: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 2,
  },
  pedidoClient: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 12,
  },
  pedidoActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  entregaButton: {
    backgroundColor: '#34C759',
  },
  noEntregaButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  statsButton: {
    margin: 16,
    padding: 12,
    backgroundColor: '#007AFF',
    borderRadius: 8,
    alignItems: 'center',
  },
  statsButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default RepartidorScreenExample;
export { useGPSTrackingWithOffline, ImageDownloadExample };
