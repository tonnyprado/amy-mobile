# Guía Rápida: Sistema Offline-First

## Inicio Rápido en 5 Minutos

### 1. Importar el Hook

```javascript
import { useNetworkStatus } from '../hooks/useNetworkStatus';
```

### 2. Usar en tu Componente

```javascript
function MiPantalla() {
  const {
    isOnline,
    pendingOperations,
    syncPendingOperations
  } = useNetworkStatus({ autoSync: true });

  return (
    <View>
      {/* Tu UI aquí */}
    </View>
  );
}
```

### 3. Guardar Operaciones Offline

```javascript
import offlineQueueService, { OPERATION_TYPES } from '../services/offlineQueueService';

// Cuando guardes datos
const guardarUbicacion = async (ubicacion) => {
  await offlineQueueService.agregarOperacion(
    OPERATION_TYPES.ENVIAR_UBICACION,
    ubicacion
  );
};
```

Eso es todo. El sistema sincronizará automáticamente cuando haya conexión.

## Agregar Indicador Visual

```javascript
import NetworkStatusBar from '../components/NetworkStatusBar';

function MiApp() {
  return (
    <View>
      <NetworkStatusBar theme={theme} />
      {/* Resto de la app */}
    </View>
  );
}
```

## Casos de Uso Comunes

### Enviar Ubicación GPS

```javascript
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import offlineQueueService, { OPERATION_TYPES } from '../services/offlineQueueService';
import { repartidorApi } from '../services/repartidorApi';

function useGPSTracking(repartidorId) {
  const { isOnline } = useNetworkStatus({ autoSync: true });

  const enviarUbicacion = async (ubicacion) => {
    const datos = {
      repartidorId,
      ...ubicacion,
    };

    if (isOnline) {
      try {
        await repartidorApi.enviarUbicacion(datos);
      } catch (error) {
        await offlineQueueService.agregarOperacion(
          OPERATION_TYPES.ENVIAR_UBICACION,
          datos
        );
      }
    } else {
      await offlineQueueService.agregarOperacion(
        OPERATION_TYPES.ENVIAR_UBICACION,
        datos
      );
    }
  };

  return { enviarUbicacion };
}
```

### Registrar Actividad

```javascript
const registrarActividad = async (actividad) => {
  await offlineQueueService.agregarOperacion(
    OPERATION_TYPES.REGISTRAR_ACTIVIDAD,
    {
      repartidorId: '0001',
      tipo: 'ENTREGA_EXITOSA',
      pedidoId: 123,
      descripcion: 'Pedido entregado',
      latitud: -12.0464,
      longitud: -77.0428,
    }
  );
};
```

### Actualizar Estado de Pedido

```javascript
const cambiarEstadoPedido = async (pedidoId, nuevoEstado) => {
  await offlineQueueService.agregarOperacion(
    OPERATION_TYPES.ACTUALIZAR_ESTADO_PEDIDO,
    {
      pedidoId,
      nuevoEstado,
    }
  );
};
```

### Enviar Mensaje de Chat

```javascript
const enviarMensaje = async (mensaje) => {
  await offlineQueueService.agregarOperacion(
    OPERATION_TYPES.ENVIAR_MENSAJE_CHAT,
    {
      conversacionId: '123',
      texto: mensaje,
      tipo: 'TEXTO',
    }
  );
};
```

## Operación Personalizada

```javascript
import offlineQueueService from '../services/offlineQueueService';
import { apiClient } from '../config/api';

// 1. Registrar procesador
offlineQueueService.registrarProcesador(
  'MI_OPERACION_CUSTOM',
  async (datos) => {
    return await apiClient.post('/api/mi-endpoint', datos);
  }
);

// 2. Usar en tu código
await offlineQueueService.agregarOperacion(
  'MI_OPERACION_CUSTOM',
  { foo: 'bar' }
);
```

## Verificar Estado de Sincronización

```javascript
function EstadoSincronizacion() {
  const { pendingOperations, isSyncing, getQueueStats } = useNetworkStatus();

  const verEstadisticas = async () => {
    const stats = await getQueueStats();
    console.log('Estadísticas:', stats);
    // {
    //   total: 12,
    //   porTipo: { ENVIAR_UBICACION: 8, ... },
    //   antiguedad: { mas1Hora: 2, mas24Horas: 0 },
    //   maxIntentos: 1
    // }
  };

  return (
    <View>
      <Text>Operaciones pendientes: {pendingOperations}</Text>
      <Text>Sincronizando: {isSyncing ? 'Sí' : 'No'}</Text>
      <Button onPress={verEstadisticas}>Ver estadísticas</Button>
    </View>
  );
}
```

## Sincronización Manual

```javascript
function BotonSincronizar() {
  const { syncPendingOperations, pendingOperations } = useNetworkStatus();

  if (pendingOperations === 0) return null;

  return (
    <Button onPress={syncPendingOperations}>
      Sincronizar {pendingOperations} operaciones
    </Button>
  );
}
```

## Evitar Sincronización en Datos Móviles

```javascript
import { useIsExpensiveConnection } from '../hooks/useNetworkStatus';

function DescargaPesada() {
  const isExpensive = useIsExpensiveConnection();

  const descargarImagen = async () => {
    if (isExpensive) {
      Alert.alert(
        'Datos móviles',
        'Estás usando datos móviles. ¿Descargar igual?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Descargar', onPress: () => ejecutarDescarga() }
        ]
      );
    } else {
      ejecutarDescarga();
    }
  };
}
```

## Configuración Avanzada

### Sincronización Periódica

```javascript
const { ... } = useNetworkStatus({
  autoSync: true,
  syncInterval: 60000, // 1 minuto
  onSyncComplete: (resultado) => {
    console.log(`${resultado.procesadas} sincronizadas`);
  }
});
```

### Callbacks de Red

```javascript
const { ... } = useNetworkStatus({
  onConnectionChange: (status) => {
    if (status.isConnected) {
      console.log('Conectado vía', status.type);
    } else {
      console.log('Perdida de conexión');
    }
  }
});
```

## Debugging

### Logs en Consola

Busca estos prefijos en los logs:

```
[OfflineQueue] Operación agregada: ENVIAR_UBICACION (ID: 1731603840_abc123)
[OfflineQueue] Procesando 5 operaciones pendientes
[OfflineQueue] Operación procesada: ENVIAR_UBICACION (ID: 1731603840_abc123)
[useNetworkStatus] Conexión restaurada, sincronizando...
```

### Limpiar Cola Manualmente

```javascript
const { clearQueue } = useNetworkStatus();

// En desarrollo, para resetear todo
await clearQueue();
```

## Troubleshooting

### "No se están sincronizando las operaciones"

1. Verifica que tengas conexión: `isOnline === true`
2. Revisa los logs: `[OfflineQueue]`
3. Verifica que `autoSync: true` esté activado
4. Llama manualmente `syncPendingOperations()`

### "La cola crece sin parar"

1. Revisa que el endpoint del backend esté funcionando
2. Verifica que el token JWT sea válido
3. Revisa los logs de errores HTTP
4. Puede estar recibiendo 4xx y descartando después de 3 intentos

### "Consume mucha batería"

1. Reduce `syncInterval` o ponlo en 0
2. Usa `autoSync: false` y sincroniza solo cuando el usuario lo pida
3. Verifica que no estés enviando demasiadas ubicaciones GPS

## Mejores Prácticas

1. Siempre usa `try/catch` al agregar operaciones
2. Agrega operaciones a cola como fallback si falla el envío directo
3. Muestra feedback visual al usuario sobre operaciones pendientes
4. No agregues operaciones duplicadas (verifica antes de agregar)
5. Limpia la cola cuando el usuario cierre sesión

## Más Información

Ver documentación completa: `OFFLINE_FIRST_IMPLEMENTATION.md`
