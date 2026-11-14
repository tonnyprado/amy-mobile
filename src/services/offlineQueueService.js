/**
 * Servicio de cola offline para sincronización de operaciones pendientes
 * Implementa patrón offline-first con AsyncStorage como capa de persistencia
 *
 * Principios SOLID aplicados:
 * - Single Responsibility: Manejo exclusivo de cola de operaciones offline
 * - Open/Closed: Extensible para nuevos tipos de operaciones sin modificar core
 * - Dependency Inversion: Inyección de dependencias para storage y procesadores
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../config/api';

const QUEUE_STORAGE_KEY = '@amy_offline_queue';
const MAX_QUEUE_SIZE = 100;
const MAX_RETRY_ATTEMPTS = 3;

/**
 * Tipos de operaciones soportadas
 */
export const OPERATION_TYPES = {
  ENVIAR_UBICACION: 'ENVIAR_UBICACION',
  REGISTRAR_ACTIVIDAD: 'REGISTRAR_ACTIVIDAD',
  REGISTRAR_INTENTO_ENTREGA: 'REGISTRAR_INTENTO_ENTREGA',
  ACTUALIZAR_ESTADO_PEDIDO: 'ACTUALIZAR_ESTADO_PEDIDO',
  ENVIAR_MENSAJE_CHAT: 'ENVIAR_MENSAJE_CHAT',
};

/**
 * Configuración de procesadores por tipo de operación
 * Implementa Strategy Pattern para procesar diferentes tipos de operaciones
 */
const operationProcessors = {
  [OPERATION_TYPES.ENVIAR_UBICACION]: async (datos) => {
    return await apiClient.post('/api/rastreo/ubicacion', datos);
  },

  [OPERATION_TYPES.REGISTRAR_ACTIVIDAD]: async (datos) => {
    return await apiClient.post('/api/actividades', datos);
  },

  [OPERATION_TYPES.REGISTRAR_INTENTO_ENTREGA]: async (datos) => {
    return await apiClient.post('/api/rastreo/intento-entrega', datos);
  },

  [OPERATION_TYPES.ACTUALIZAR_ESTADO_PEDIDO]: async (datos) => {
    return await apiClient.put(`/api/pedidos/${datos.pedidoId}/estado`, {
      estado: datos.nuevoEstado,
    });
  },

  [OPERATION_TYPES.ENVIAR_MENSAJE_CHAT]: async (datos) => {
    return await apiClient.post('/api/chat/mensajes', datos);
  },
};

/**
 * Clase principal del servicio de cola offline
 */
class OfflineQueueService {
  constructor(storageKey = QUEUE_STORAGE_KEY, processors = operationProcessors) {
    this.storageKey = storageKey;
    this.processors = processors;
    this.processingInProgress = false;
  }

  /**
   * Genera un ID único para cada operación
   * @private
   */
  _generateOperationId() {
    return `${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Lee la cola desde AsyncStorage
   * @private
   * @returns {Promise<Array>}
   */
  async _readQueue() {
    try {
      const queueData = await AsyncStorage.getItem(this.storageKey);
      return queueData ? JSON.parse(queueData) : [];
    } catch (error) {
      console.error('[OfflineQueue] Error al leer cola:', error);
      return [];
    }
  }

  /**
   * Guarda la cola en AsyncStorage
   * @private
   * @param {Array} queue
   */
  async _writeQueue(queue) {
    try {
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(queue));
    } catch (error) {
      console.error('[OfflineQueue] Error al guardar cola:', error);
      throw error;
    }
  }

  /**
   * Agrega una operación a la cola
   * @param {string} tipo - Tipo de operación (usar OPERATION_TYPES)
   * @param {Object} datos - Datos de la operación
   * @returns {Promise<Object>} Operación agregada
   */
  async agregarOperacion(tipo, datos) {
    if (!Object.values(OPERATION_TYPES).includes(tipo)) {
      throw new Error(`Tipo de operación no válido: ${tipo}`);
    }

    const queue = await this._readQueue();

    if (queue.length >= MAX_QUEUE_SIZE) {
      console.warn('[OfflineQueue] Cola llena, removiendo operación más antigua');
      queue.shift();
    }

    const operacion = {
      id: this._generateOperationId(),
      tipo,
      datos,
      timestamp: Date.now(),
      intentos: 0,
      estado: 'PENDIENTE',
    };

    queue.push(operacion);
    await this._writeQueue(queue);

    console.log(`[OfflineQueue] Operación agregada: ${tipo} (ID: ${operacion.id})`);
    return operacion;
  }

  /**
   * Procesa una sola operación
   * @private
   * @param {Object} operacion
   * @returns {Promise<Object>} Resultado del procesamiento
   */
  async _processOperation(operacion) {
    const processor = this.processors[operacion.tipo];

    if (!processor) {
      console.error(`[OfflineQueue] No hay procesador para tipo: ${operacion.tipo}`);
      return {
        success: false,
        error: 'Procesador no encontrado',
      };
    }

    try {
      const response = await processor(operacion.datos);

      if (response.ok || response.status < 400) {
        console.log(`[OfflineQueue] Operación procesada: ${operacion.tipo} (ID: ${operacion.id})`);
        return { success: true, response };
      } else {
        const errorText = await response.text().catch(() => 'Sin detalle');
        console.warn(`[OfflineQueue] Error HTTP ${response.status}: ${errorText}`);
        return {
          success: false,
          error: `HTTP ${response.status}`,
          shouldRetry: response.status >= 500 || response.status === 408,
        };
      }
    } catch (error) {
      console.warn(`[OfflineQueue] Error al procesar operación:`, error.message);
      return {
        success: false,
        error: error.message,
        shouldRetry: true,
      };
    }
  }

  /**
   * Procesa todas las operaciones pendientes en la cola
   * @returns {Promise<Object>} Resultado del procesamiento
   */
  async procesarPendientes() {
    if (this.processingInProgress) {
      console.log('[OfflineQueue] Procesamiento ya en curso, omitiendo...');
      return { skipped: true };
    }

    this.processingInProgress = true;
    const startTime = Date.now();

    try {
      const queue = await this._readQueue();

      if (queue.length === 0) {
        console.log('[OfflineQueue] No hay operaciones pendientes');
        return { procesadas: 0, fallidas: 0, tiempo: 0 };
      }

      console.log(`[OfflineQueue] Procesando ${queue.length} operaciones pendientes`);

      let procesadas = 0;
      let fallidas = 0;
      const nuevaQueue = [];

      for (const operacion of queue) {
        operacion.intentos++;
        const resultado = await this._processOperation(operacion);

        if (resultado.success) {
          procesadas++;
        } else {
          const debeReintentar = resultado.shouldRetry !== false &&
                                 operacion.intentos < MAX_RETRY_ATTEMPTS;

          if (debeReintentar) {
            operacion.estado = 'REINTENTO';
            operacion.ultimoError = resultado.error;
            nuevaQueue.push(operacion);
          } else {
            fallidas++;
            console.error(
              `[OfflineQueue] Operación descartada después de ${operacion.intentos} intentos:`,
              operacion.tipo,
              operacion.id
            );
          }
        }
      }

      await this._writeQueue(nuevaQueue);

      const tiempo = Date.now() - startTime;
      console.log(
        `[OfflineQueue] Procesamiento completado: ${procesadas} exitosas, ${fallidas} fallidas, ${nuevaQueue.length} pendientes (${tiempo}ms)`
      );

      return {
        procesadas,
        fallidas,
        pendientes: nuevaQueue.length,
        tiempo,
      };
    } finally {
      this.processingInProgress = false;
    }
  }

  /**
   * Obtiene todas las operaciones pendientes
   * @returns {Promise<Array>}
   */
  async obtenerPendientes() {
    const queue = await this._readQueue();
    return queue.map(op => ({
      id: op.id,
      tipo: op.tipo,
      timestamp: op.timestamp,
      intentos: op.intentos,
      estado: op.estado,
    }));
  }

  /**
   * Limpia completamente la cola
   * @returns {Promise<void>}
   */
  async limpiarQueue() {
    try {
      await AsyncStorage.removeItem(this.storageKey);
      console.log('[OfflineQueue] Cola limpiada');
    } catch (error) {
      console.error('[OfflineQueue] Error al limpiar cola:', error);
      throw error;
    }
  }

  /**
   * Obtiene estadísticas de la cola
   * @returns {Promise<Object>}
   */
  async obtenerEstadisticas() {
    const queue = await this._readQueue();

    const estadisticas = {
      total: queue.length,
      porTipo: {},
      antiguedad: {
        mas1Hora: 0,
        mas24Horas: 0,
      },
      maxIntentos: 0,
    };

    const ahora = Date.now();
    const unaHora = 60 * 60 * 1000;
    const unDia = 24 * unaHora;

    queue.forEach(op => {
      estadisticas.porTipo[op.tipo] = (estadisticas.porTipo[op.tipo] || 0) + 1;

      const edad = ahora - op.timestamp;
      if (edad > unDia) estadisticas.antiguedad.mas24Horas++;
      else if (edad > unaHora) estadisticas.antiguedad.mas1Hora++;

      if (op.intentos > estadisticas.maxIntentos) {
        estadisticas.maxIntentos = op.intentos;
      }
    });

    return estadisticas;
  }

  /**
   * Registra un procesador personalizado para un tipo de operación
   * Permite extender el servicio sin modificar el código core (Open/Closed Principle)
   * @param {string} tipo
   * @param {Function} processor
   */
  registrarProcesador(tipo, processor) {
    if (typeof processor !== 'function') {
      throw new Error('El procesador debe ser una función');
    }
    this.processors[tipo] = processor;
    console.log(`[OfflineQueue] Procesador registrado para tipo: ${tipo}`);
  }
}

const offlineQueueService = new OfflineQueueService();

export default offlineQueueService;
export { OfflineQueueService };
