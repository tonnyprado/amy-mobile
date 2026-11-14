/**
 * Tests para offlineQueueService
 * Cobertura de casos críticos para sistema offline-first
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { OfflineQueueService, OPERATION_TYPES } from '../offlineQueueService';

jest.mock('@react-native-async-storage/async-storage');

describe('OfflineQueueService', () => {
  let service;
  const mockProcessor = jest.fn();

  beforeEach(() => {
    AsyncStorage.clear();
    jest.clearAllMocks();
    service = new OfflineQueueService('@test_queue', {
      [OPERATION_TYPES.UBICACION_GPS]: mockProcessor,
    });
  });

  describe('agregarOperacion', () => {
    it('debería agregar una operación a la cola vacía', async () => {
      AsyncStorage.getItem.mockResolvedValue(null);
      AsyncStorage.setItem.mockResolvedValue();

      const operacion = await service.agregarOperacion(OPERATION_TYPES.UBICACION_GPS, { foo: 'bar' });

      expect(operacion).toMatchObject({
        tipo: OPERATION_TYPES.UBICACION_GPS,
        datos: { foo: 'bar' },
        estado: 'PENDIENTE',
        intentos: 0,
      });
      expect(operacion.id).toBeDefined();
      expect(operacion.timestamp).toBeDefined();
      expect(AsyncStorage.setItem).toHaveBeenCalled();
    });

    it('debería rechazar operaciones de tipo inválido', async () => {
      await expect(
        service.agregarOperacion('TIPO_INVALIDO', {})
      ).rejects.toThrow('Tipo de operación no válido');
    });

    it('debería mantener tamaño máximo de cola', async () => {
      const cola = Array(100).fill(null).map((_, i) => ({
        id: `op_${i}`,
        tipo: OPERATION_TYPES.UBICACION_GPS,
        datos: {},
        timestamp: Date.now(),
        intentos: 0,
      }));

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cola));
      AsyncStorage.setItem.mockResolvedValue();

      await service.agregarOperacion(OPERATION_TYPES.UBICACION_GPS, { nueva: true });

      const savedQueue = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
      expect(savedQueue.length).toBe(100);
      expect(savedQueue[99].datos.nueva).toBe(true);
    });
  });

  describe('procesarPendientes', () => {
    it('debería procesar operación exitosa', async () => {
      mockProcessor.mockResolvedValue({ ok: true, status: 200 });

      const cola = [{
        id: 'op_1',
        tipo: OPERATION_TYPES.UBICACION_GPS,
        datos: { test: true },
        timestamp: Date.now(),
        intentos: 0,
      }];

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cola));
      AsyncStorage.setItem.mockResolvedValue();

      const resultado = await service.procesarPendientes();

      expect(resultado.procesadas).toBe(1);
      expect(resultado.fallidas).toBe(0);
      expect(mockProcessor).toHaveBeenCalledWith({ test: true });
    });

    it('debería reintentar operación fallida', async () => {
      mockProcessor.mockResolvedValue({ ok: false, status: 500, text: () => 'Error servidor' });

      const cola = [{
        id: 'op_1',
        tipo: OPERATION_TYPES.UBICACION_GPS,
        datos: {},
        timestamp: Date.now(),
        intentos: 0,
      }];

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cola));
      AsyncStorage.setItem.mockResolvedValue();

      const resultado = await service.procesarPendientes();

      expect(resultado.procesadas).toBe(0);
      expect(resultado.pendientes).toBe(1);
      const savedQueue = JSON.parse(AsyncStorage.setItem.mock.calls[0][1]);
      expect(savedQueue[0].intentos).toBe(1);
    });

    it('debería descartar operación después de max intentos', async () => {
      mockProcessor.mockResolvedValue({ ok: false, status: 400, text: () => 'Error cliente' });

      const cola = [{
        id: 'op_1',
        tipo: OPERATION_TYPES.UBICACION_GPS,
        datos: {},
        timestamp: Date.now(),
        intentos: 3,
      }];

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cola));
      AsyncStorage.setItem.mockResolvedValue();

      const resultado = await service.procesarPendientes();

      expect(resultado.fallidas).toBe(1);
      expect(resultado.pendientes).toBe(0);
    });

    it('debería prevenir procesamiento concurrente', async () => {
      AsyncStorage.getItem.mockResolvedValue('[]');

      service.processingInProgress = true;
      const resultado = await service.procesarPendientes();

      expect(resultado.skipped).toBe(true);
    });
  });

  describe('obtenerEstadisticas', () => {
    it('debería calcular estadísticas correctamente', async () => {
      const ahora = Date.now();
      const cola = [
        { tipo: OPERATION_TYPES.UBICACION_GPS, timestamp: ahora - 2 * 60 * 60 * 1000, intentos: 1 },
        { tipo: OPERATION_TYPES.UBICACION_GPS, timestamp: ahora - 25 * 60 * 60 * 1000, intentos: 2 },
        { tipo: 'OTHER_OP', timestamp: ahora, intentos: 0 },
      ];

      AsyncStorage.getItem.mockResolvedValue(JSON.stringify(cola));

      const stats = await service.obtenerEstadisticas();

      expect(stats.total).toBe(3);
      expect(stats.porTipo.TEST_OP).toBe(2);
      expect(stats.porTipo.OTHER_OP).toBe(1);
      expect(stats.antiguedad.mas1Hora).toBe(1);
      expect(stats.antiguedad.mas24Horas).toBe(1);
      expect(stats.maxIntentos).toBe(2);
    });
  });

  describe('registrarProcesador', () => {
    it('debería registrar procesador personalizado', () => {
      const customProcessor = jest.fn();
      service.registrarProcesador('CUSTOM_OP', customProcessor);

      expect(service.processors.CUSTOM_OP).toBe(customProcessor);
    });

    it('debería rechazar procesador no-función', () => {
      expect(() => {
        service.registrarProcesador('INVALID', 'not-a-function');
      }).toThrow('El procesador debe ser una función');
    });
  });
});
