/**
 * Hook personalizado para monitorear el estado de la red
 * Integra NetInfo con el servicio de cola offline
 *
 * Principios SOLID:
 * - Single Responsibility: Gestiona exclusivamente el estado de conectividad
 * - Dependency Inversion: Inyecta el servicio de queue como dependencia
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import offlineQueueService from '../services/offlineQueueService';

/**
 * Hook para monitorear el estado de la red y sincronizar operaciones offline
 *
 * @param {Object} options - Opciones de configuración
 * @param {boolean} options.autoSync - Sincronizar automáticamente cuando se recupera conexión
 * @param {number} options.syncInterval - Intervalo de sincronización en ms (0 para deshabilitar)
 * @param {Function} options.onConnectionChange - Callback cuando cambia la conexión
 * @param {Function} options.onSyncComplete - Callback cuando se completa la sincronización
 *
 * @returns {Object} Estado y métodos del hook
 */
export function useNetworkStatus(options = {}) {
  const {
    autoSync = true,
    syncInterval = 0,
    onConnectionChange,
    onSyncComplete,
  } = options;

  const [isConnected, setIsConnected] = useState(null);
  const [connectionType, setConnectionType] = useState('unknown');
  const [isExpensive, setIsExpensive] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);
  const [pendingOperations, setPendingOperations] = useState(0);

  const syncIntervalRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const mountedRef = useRef(true);

  /**
   * Actualiza el contador de operaciones pendientes
   */
  const updatePendingCount = useCallback(async () => {
    try {
      const pendientes = await offlineQueueService.obtenerPendientes();
      if (mountedRef.current) {
        setPendingOperations(pendientes.length);
      }
    } catch (error) {
      console.error('[useNetworkStatus] Error al obtener operaciones pendientes:', error);
    }
  }, []);

  /**
   * Sincroniza las operaciones pendientes con el servidor
   */
  const syncPendingOperations = useCallback(async () => {
    if (isSyncing) {
      console.log('[useNetworkStatus] Sincronización ya en progreso, omitiendo...');
      return { skipped: true };
    }

    if (!isConnected) {
      console.log('[useNetworkStatus] Sin conexión, omitiendo sincronización');
      return { skipped: true, reason: 'no_connection' };
    }

    setIsSyncing(true);

    try {
      const resultado = await offlineQueueService.procesarPendientes();

      if (mountedRef.current) {
        setLastSyncTime(Date.now());
        await updatePendingCount();

        if (onSyncComplete) {
          onSyncComplete(resultado);
        }
      }

      console.log('[useNetworkStatus] Sincronización completada:', resultado);
      return resultado;
    } catch (error) {
      console.error('[useNetworkStatus] Error durante sincronización:', error);
      return { error: error.message };
    } finally {
      if (mountedRef.current) {
        setIsSyncing(false);
      }
    }
  }, [isConnected, isSyncing, onSyncComplete, updatePendingCount]);

  /**
   * Maneja cambios en el estado de la red
   */
  const handleConnectionChange = useCallback((state) => {
    if (!mountedRef.current) return;

    const wasConnected = isConnected;
    const nowConnected = state.isConnected;

    setIsConnected(nowConnected);
    setConnectionType(state.type || 'unknown');
    setIsExpensive(state.details?.isConnectionExpensive || false);

    if (onConnectionChange) {
      onConnectionChange({
        isConnected: nowConnected,
        type: state.type,
        isExpensive: state.details?.isConnectionExpensive || false,
      });
    }

    if (autoSync && !wasConnected && nowConnected) {
      console.log('[useNetworkStatus] Conexión restaurada, sincronizando...');
      setTimeout(() => {
        syncPendingOperations();
      }, 1000);
    }
  }, [isConnected, autoSync, onConnectionChange, syncPendingOperations]);

  /**
   * Inicializa el listener de NetInfo
   */
  useEffect(() => {
    mountedRef.current = true;

    NetInfo.fetch().then(state => {
      handleConnectionChange(state);
      updatePendingCount();
    });

    unsubscribeRef.current = NetInfo.addEventListener(handleConnectionChange);

    return () => {
      mountedRef.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [handleConnectionChange, updatePendingCount]);

  /**
   * Configura sincronización periódica si está habilitada
   */
  useEffect(() => {
    if (syncInterval > 0 && isConnected && !isSyncing) {
      syncIntervalRef.current = setInterval(() => {
        syncPendingOperations();
      }, syncInterval);

      return () => {
        if (syncIntervalRef.current) {
          clearInterval(syncIntervalRef.current);
        }
      };
    }
  }, [syncInterval, isConnected, isSyncing, syncPendingOperations]);

  /**
   * Refresca el estado de conectividad
   */
  const refresh = useCallback(async () => {
    const state = await NetInfo.fetch();
    handleConnectionChange(state);
    await updatePendingCount();
  }, [handleConnectionChange, updatePendingCount]);

  /**
   * Obtiene estadísticas de la cola offline
   */
  const getQueueStats = useCallback(async () => {
    try {
      return await offlineQueueService.obtenerEstadisticas();
    } catch (error) {
      console.error('[useNetworkStatus] Error al obtener estadísticas:', error);
      return null;
    }
  }, []);

  /**
   * Limpia todas las operaciones pendientes
   */
  const clearQueue = useCallback(async () => {
    try {
      await offlineQueueService.limpiarQueue();
      await updatePendingCount();
      console.log('[useNetworkStatus] Cola limpiada');
      return { success: true };
    } catch (error) {
      console.error('[useNetworkStatus] Error al limpiar cola:', error);
      return { success: false, error: error.message };
    }
  }, [updatePendingCount]);

  return {
    isConnected,
    connectionType,
    isExpensive,
    isOnline: isConnected === true,
    isOffline: isConnected === false,
    isSyncing,
    lastSyncTime,
    pendingOperations,
    hasPendingOperations: pendingOperations > 0,
    syncPendingOperations,
    refresh,
    getQueueStats,
    clearQueue,
  };
}

/**
 * Hook simplificado que solo retorna el estado de conexión
 * @returns {boolean|null} true si conectado, false si no, null si desconocido
 */
export function useIsConnected() {
  const [isConnected, setIsConnected] = useState(null);

  useEffect(() => {
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
    });

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isConnected;
}

/**
 * Hook que retorna si la conexión es cara (datos móviles)
 * Útil para evitar sincronizaciones pesadas en datos móviles
 * @returns {boolean} true si la conexión es cara
 */
export function useIsExpensiveConnection() {
  const [isExpensive, setIsExpensive] = useState(false);

  useEffect(() => {
    NetInfo.fetch().then(state => {
      setIsExpensive(state.details?.isConnectionExpensive || false);
    });

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsExpensive(state.details?.isConnectionExpensive || false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return isExpensive;
}

export default useNetworkStatus;
