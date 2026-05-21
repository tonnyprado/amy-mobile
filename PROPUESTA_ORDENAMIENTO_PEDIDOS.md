# Propuesta: Ordenamiento Manual de Pedidos por Repartidor

## 📋 Resumen
Permitir que el repartidor organice manualmente el orden de sus pedidos desde un día antes (cuando llega la minuta), para que pueda planificar la ruta de entrega según su preferencia.

---

## 🎯 Funcionalidad Requerida

1. **Desde cuando llega la minuta** (pedidos en estado PENDIENTE), el repartidor puede:
   - Ver todos sus pedidos asignados para una fecha específica
   - Reordenar manualmente los pedidos usando drag-and-drop o botones
   - Guardar ese orden personalizado

2. **El orden se mantiene** hasta que el repartidor lo cambie nuevamente

3. **La lista siempre muestra** los pedidos en el orden personalizado (si existe)

---

## 🔧 BACKEND - Cambios Necesarios

### 1. Migration SQL - Agregar campo `orden_repartidor`

**Archivo:** `/controlDeMinutasAPI/src/main/resources/db/migration/V{next}_add_orden_repartidor_to_pedidos.sql`

```sql
-- Agregar campo orden_repartidor a la tabla pedidos
ALTER TABLE pedidos
ADD COLUMN orden_repartidor INTEGER;

-- Crear índice para mejorar performance en queries ordenadas
CREATE INDEX idx_pedido_orden_repartidor
ON pedidos(repartidor_id, fecha_salida, orden_repartidor);

-- Inicializar valores existentes (orden por ID ascendente)
WITH pedidos_numerados AS (
    SELECT
        id,
        ROW_NUMBER() OVER (
            PARTITION BY repartidor_id, fecha_salida
            ORDER BY id ASC
        ) as nuevo_orden
    FROM pedidos
    WHERE estado = 'PENDIENTE'
)
UPDATE pedidos p
SET orden_repartidor = pn.nuevo_orden
FROM pedidos_numerados pn
WHERE p.id = pn.id;

COMMENT ON COLUMN pedidos.orden_repartidor IS
'Orden personalizado del pedido asignado por el repartidor. NULL = sin ordenar, usar orden por defecto';
```

---

### 2. Modelo Pedido - Agregar campo

**Archivo:** `/controlDeMinutasAPI/src/main/java/com/amybusiness/controlminutas/pedido/model/Pedido.java`

```java
// Agregar después de la línea 97 (después del campo estado)

// Orden personalizado por repartidor (para organizar ruta)
@Column(name = "orden_repartidor")
private Integer ordenRepartidor;
```

---

### 3. DTO para actualizar orden

**Archivo:** `/controlDeMinutasAPI/src/main/java/com/amybusiness/controlminutas/pedido/dto/ActualizarOrdenPedidosRequest.java` (NUEVO)

```java
package com.amybusiness.controlminutas.pedido.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

/**
 * Request para actualizar el orden personalizado de múltiples pedidos.
 * El repartidor envía una lista con el nuevo orden de sus pedidos.
 */
public record ActualizarOrdenPedidosRequest(

    @NotNull(message = "El ID del repartidor es obligatorio")
    String idRepartidor,

    @NotEmpty(message = "Debe proporcionar al menos un pedido para ordenar")
    List<PedidoOrden> pedidos

) {
    /**
     * Representa un pedido con su nueva posición en el orden
     */
    public record PedidoOrden(
        @NotNull(message = "El ID del pedido es obligatorio")
        Long pedidoId,

        @NotNull(message = "El orden es obligatorio")
        Integer orden
    ) {}
}
```

---

### 4. Repository - Agregar query ordenada

**Archivo:** `/controlDeMinutasAPI/src/main/java/com/amybusiness/controlminutas/pedido/repository/PedidoRepository.java`

```java
// Agregar estos métodos al repository existente

/**
 * Encuentra todos los pedidos de un repartidor para hoy,
 * ordenados por el orden personalizado (si existe) o por ID.
 */
@Query("""
    SELECT p FROM Pedido p
    LEFT JOIN FETCH p.productos
    WHERE p.repartidor.idRepartidor = :idRepartidor
    AND p.fechaSalida = CURRENT_DATE
    ORDER BY
        CASE WHEN p.ordenRepartidor IS NULL THEN 999999 ELSE p.ordenRepartidor END ASC,
        p.id ASC
""")
List<Pedido> findPedidosHoyOrdenados(@Param("idRepartidor") String idRepartidor);

/**
 * Encuentra todos los pedidos de un repartidor para una fecha específica,
 * ordenados por el orden personalizado (si existe) o por ID.
 */
@Query("""
    SELECT p FROM Pedido p
    LEFT JOIN FETCH p.productos
    WHERE p.repartidor.idRepartidor = :idRepartidor
    AND p.fechaSalida = :fechaSalida
    ORDER BY
        CASE WHEN p.ordenRepartidor IS NULL THEN 999999 ELSE p.ordenRepartidor END ASC,
        p.id ASC
""")
List<Pedido> findPedidosPorFechaOrdenados(
    @Param("idRepartidor") String idRepartidor,
    @Param("fechaSalida") LocalDate fechaSalida
);
```

---

### 5. Service - Lógica de actualización de orden

**Archivo:** `/controlDeMinutasAPI/src/main/java/com/amybusiness/controlminutas/pedido/service/PedidoService.java`

```java
// Agregar este método al servicio existente

/**
 * Actualiza el orden personalizado de los pedidos de un repartidor.
 * Valida que todos los pedidos pertenezcan al repartidor solicitante.
 *
 * @param request Contiene el idRepartidor y la lista de pedidos con su nuevo orden
 * @return Map con el resultado de la operación
 * @throws IllegalArgumentException si algún pedido no pertenece al repartidor
 */
@Transactional
public Map<String, Object> actualizarOrdenPedidos(ActualizarOrdenPedidosRequest request) {
    String idRepartidor = request.idRepartidor();
    List<Long> pedidoIds = request.pedidos().stream()
        .map(ActualizarOrdenPedidosRequest.PedidoOrden::pedidoId)
        .toList();

    // Cargar todos los pedidos de una vez
    List<Pedido> pedidos = pedidoRepository.findAllById(pedidoIds);

    // Validar que todos existen
    if (pedidos.size() != pedidoIds.size()) {
        throw new IllegalArgumentException(
            "Uno o más pedidos no existen. Solicitados: %d, Encontrados: %d"
                .formatted(pedidoIds.size(), pedidos.size())
        );
    }

    // Validar que todos los pedidos pertenecen al repartidor
    List<Pedido> pedidosAjenos = pedidos.stream()
        .filter(p -> !idRepartidor.equals(p.getRepartidor().getIdRepartidor()))
        .toList();

    if (!pedidosAjenos.isEmpty()) {
        throw new IllegalArgumentException(
            "No se puede actualizar el orden de pedidos que no pertenecen al repartidor %s. "
            + "Pedidos ajenos: %s"
                .formatted(
                    idRepartidor,
                    pedidosAjenos.stream().map(Pedido::getId).toList()
                )
        );
    }

    // Crear un mapa para acceso rápido por ID
    Map<Long, Pedido> pedidoMap = pedidos.stream()
        .collect(Collectors.toMap(Pedido::getId, p -> p));

    // Actualizar el orden de cada pedido
    int actualizados = 0;
    for (var pedidoOrden : request.pedidos()) {
        Pedido pedido = pedidoMap.get(pedidoOrden.pedidoId());
        if (pedido != null) {
            pedido.setOrdenRepartidor(pedidoOrden.orden());
            actualizados++;
        }
    }

    // Guardar cambios (batch update)
    pedidoRepository.saveAll(pedidos);

    log.info("[ORDEN] Repartidor {} actualizó el orden de {} pedidos",
        idRepartidor, actualizados);

    return Map.of(
        "idRepartidor", idRepartidor,
        "pedidosActualizados", actualizados,
        "timestamp", LocalDateTime.now()
    );
}

/**
 * Resetea el orden personalizado de todos los pedidos de un repartidor.
 * Útil si el repartidor quiere volver al orden por defecto.
 */
@Transactional
public Map<String, Object> resetearOrdenPedidos(String idRepartidor, LocalDate fechaSalida) {
    List<Pedido> pedidos = pedidoRepository.findPedidosPorFechaOrdenados(idRepartidor, fechaSalida);

    pedidos.forEach(p -> p.setOrdenRepartidor(null));
    pedidoRepository.saveAll(pedidos);

    log.info("[ORDEN] Repartidor {} reseteó el orden de {} pedidos para fecha {}",
        idRepartidor, pedidos.size(), fechaSalida);

    return Map.of(
        "idRepartidor", idRepartidor,
        "pedidosReseteados", pedidos.size(),
        "fechaSalida", fechaSalida,
        "timestamp", LocalDateTime.now()
    );
}
```

---

### 6. Controller - Endpoints REST

**Archivo:** `/controlDeMinutasAPI/src/main/java/com/amybusiness/controlminutas/pedido/controller/PedidoController.java`

```java
// Agregar estos endpoints al controlador existente

/**
 * Actualiza el orden personalizado de los pedidos de un repartidor.
 * El repartidor puede reordenar sus pedidos para organizar su ruta.
 *
 * POST /api/pedidos/actualizar-orden
 *
 * Body:
 * {
 *   "idRepartidor": "R001",
 *   "pedidos": [
 *     { "pedidoId": 123, "orden": 1 },
 *     { "pedidoId": 456, "orden": 2 },
 *     { "pedidoId": 789, "orden": 3 }
 *   ]
 * }
 */
@PostMapping("/actualizar-orden")
public ResponseEntity<Map<String, Object>> actualizarOrdenPedidos(
    @Valid @RequestBody ActualizarOrdenPedidosRequest request
) {
    try {
        Map<String, Object> resultado = pedidoService.actualizarOrdenPedidos(request);
        return ResponseEntity.ok(resultado);
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of(
            "error", e.getMessage(),
            "timestamp", LocalDateTime.now()
        ));
    }
}

/**
 * Resetea el orden personalizado de los pedidos de un repartidor.
 * Vuelve al orden por defecto (por ID).
 *
 * POST /api/pedidos/repartidor/{idRepartidor}/resetear-orden?fecha=2025-01-15
 */
@PostMapping("/repartidor/{idRepartidor}/resetear-orden")
public ResponseEntity<Map<String, Object>> resetearOrdenPedidos(
    @PathVariable String idRepartidor,
    @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha
) {
    LocalDate fechaSalida = fecha != null ? fecha : LocalDate.now();
    Map<String, Object> resultado = pedidoService.resetearOrdenPedidos(idRepartidor, fechaSalida);
    return ResponseEntity.ok(resultado);
}
```

---

### 7. Modificar query existente para usar orden

**Archivo:** `/controlDeMinutasAPI/src/main/java/com/amybusiness/controlminutas/pedido/service/PedidoService.java`

Modificar el método `obtenerPedidosRepartidorHoy()` para usar el nuevo repository method:

```java
// ANTES:
public List<PedidoListaDto> obtenerPedidosRepartidorHoy(String idRepartidor) {
    List<Pedido> pedidos = pedidoRepository.findPedidoListasDeHoy(idRepartidor);
    return pedidos.stream().map(this::toPedidoListaDto).toList();
}

// DESPUÉS:
public List<PedidoListaDto> obtenerPedidosRepartidorHoy(String idRepartidor) {
    List<Pedido> pedidos = pedidoRepository.findPedidosHoyOrdenados(idRepartidor);
    return pedidos.stream().map(this::toPedidoListaDto).toList();
}
```

---

## 📱 FRONTEND MOBILE - Cambios Necesarios

### 1. Servicio API - Agregar endpoints

**Archivo:** `/amy-mobile/src/services/repartidorApi.js`

```javascript
/**
 * Actualiza el orden personalizado de los pedidos del repartidor.
 *
 * @param {string} idRepartidor - ID del repartidor
 * @param {Array} pedidos - Array de objetos { pedidoId: number, orden: number }
 * @returns {Promise} Resultado de la actualización
 */
export async function actualizarOrdenPedidos(idRepartidor, pedidos) {
  try {
    const response = await apiClient.post('/api/pedidos/actualizar-orden', {
      idRepartidor,
      pedidos
    });

    return response.data;
  } catch (error) {
    console.error('[API] Error al actualizar orden de pedidos:', error);
    throw error;
  }
}

/**
 * Resetea el orden personalizado de los pedidos.
 * Vuelve al orden por defecto (por ID).
 *
 * @param {string} idRepartidor - ID del repartidor
 * @param {string} fecha - Fecha en formato YYYY-MM-DD (opcional, default: hoy)
 * @returns {Promise} Resultado del reset
 */
export async function resetearOrdenPedidos(idRepartidor, fecha = null) {
  try {
    const endpoint = `/api/pedidos/repartidor/${idRepartidor}/resetear-orden`;
    const params = fecha ? { fecha } : {};

    const response = await apiClient.post(endpoint, null, { params });

    return response.data;
  } catch (error) {
    console.error('[API] Error al resetear orden de pedidos:', error);
    throw error;
  }
}
```

---

### 2. Hook para drag-and-drop

**Archivo:** `/amy-mobile/src/hooks/usePedidosReorder.js` (NUEVO)

```javascript
import { useState, useCallback } from 'react';
import { actualizarOrdenPedidos } from '../services/repartidorApi';

/**
 * Hook para manejar el reordenamiento de pedidos con drag-and-drop.
 *
 * @param {Array} pedidosIniciales - Lista inicial de pedidos
 * @param {string} idRepartidor - ID del repartidor
 * @param {Function} onSuccess - Callback al guardar exitosamente
 * @param {Function} onError - Callback al ocurrir error
 */
export function usePedidosReorder(pedidosIniciales, idRepartidor, onSuccess, onError) {
  const [pedidos, setPedidos] = useState(pedidosIniciales);
  const [guardando, setGuardando] = useState(false);
  const [ordenModificado, setOrdenModificado] = useState(false);

  /**
   * Mueve un pedido a una nueva posición en la lista
   */
  const moverPedido = useCallback((fromIndex, toIndex) => {
    setPedidos(prevPedidos => {
      const nuevosPedidos = [...prevPedidos];
      const [elementoMovido] = nuevosPedidos.splice(fromIndex, 1);
      nuevosPedidos.splice(toIndex, 0, elementoMovido);
      setOrdenModificado(true);
      return nuevosPedidos;
    });
  }, []);

  /**
   * Guarda el orden actual en el backend
   */
  const guardarOrden = useCallback(async () => {
    if (!ordenModificado) {
      console.log('[REORDER] No hay cambios para guardar');
      return;
    }

    setGuardando(true);
    try {
      // Crear array con pedidoId y orden (índice + 1)
      const pedidosOrden = pedidos.map((pedido, index) => ({
        pedidoId: pedido.id,
        orden: index + 1
      }));

      const resultado = await actualizarOrdenPedidos(idRepartidor, pedidosOrden);

      console.log('[REORDER] Orden guardado exitosamente:', resultado);
      setOrdenModificado(false);

      if (onSuccess) {
        onSuccess(resultado);
      }
    } catch (error) {
      console.error('[REORDER] Error al guardar orden:', error);

      if (onError) {
        onError(error);
      }
    } finally {
      setGuardando(false);
    }
  }, [pedidos, idRepartidor, ordenModificado, onSuccess, onError]);

  /**
   * Resetea la lista al orden inicial
   */
  const resetearOrden = useCallback(() => {
    setPedidos(pedidosIniciales);
    setOrdenModificado(false);
  }, [pedidosIniciales]);

  return {
    pedidos,
    moverPedido,
    guardarOrden,
    resetearOrden,
    guardando,
    ordenModificado
  };
}
```

---

### 3. Componente de lista reordenable

**Archivo:** `/amy-mobile/src/components/PedidoReorderableItem.js` (NUEVO)

```javascript
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

/**
 * Item de pedido con botones para mover arriba/abajo.
 * Alternativa simple a drag-and-drop nativo.
 */
export default function PedidoReorderableItem({
  pedido,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onPress
}) {
  const isFirst = index === 0;
  const isLast = index === total - 1;

  return (
    <View style={styles.container}>
      {/* Controles de orden */}
      <View style={styles.orderControls}>
        <Text style={styles.orderNumber}>{index + 1}</Text>

        <View style={styles.arrows}>
          <TouchableOpacity
            style={[styles.arrowButton, isFirst && styles.arrowDisabled]}
            onPress={onMoveUp}
            disabled={isFirst}
          >
            <MaterialIcons
              name="keyboard-arrow-up"
              size={24}
              color={isFirst ? '#cbd5e1' : '#3b82f6'}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.arrowButton, isLast && styles.arrowDisabled]}
            onPress={onMoveDown}
            disabled={isLast}
          >
            <MaterialIcons
              name="keyboard-arrow-down"
              size={24}
              color={isLast ? '#cbd5e1' : '#3b82f6'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Contenido del pedido */}
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.info}>
          <Text style={styles.guia}>{pedido.numeroGuia}</Text>
          <Text style={styles.destinatario}>{pedido.destinatario}</Text>
          <Text style={styles.direccion} numberOfLines={1}>
            {pedido.direccion}
          </Text>
        </View>

        <MaterialIcons name="chevron-right" size={24} color="#94a3b8" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  orderControls: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
    paddingVertical: 8,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 4,
  },
  arrows: {
    alignItems: 'center',
  },
  arrowButton: {
    padding: 2,
  },
  arrowDisabled: {
    opacity: 0.3,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  info: {
    flex: 1,
  },
  guia: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  destinatario: {
    fontSize: 13,
    color: '#475569',
    marginBottom: 2,
  },
  direccion: {
    fontSize: 12,
    color: '#64748b',
  },
});
```

---

### 4. Modificar PaquetesScreen para incluir modo de reorden

**Archivo:** `/amy-mobile/src/screens/PaquetesScreen.js`

Agregar las siguientes modificaciones:

```javascript
import { usePedidosReorder } from '../hooks/usePedidosReorder';
import PedidoReorderableItem from '../components/PedidoReorderableItem';
import { actualizarOrdenPedidos, resetearOrdenPedidos } from '../services/repartidorApi';

// Dentro del componente, agregar estado para modo de reorden
const [modoReorden, setModoReorden] = useState(false);

// Hook de reorden (solo si está en modo reorden)
const {
  pedidos: pedidosReordenados,
  moverPedido,
  guardarOrden,
  resetearOrden,
  guardando: guardandoOrden,
  ordenModificado
} = usePedidosReorder(
  paquetes,
  usuario?.id,
  (resultado) => {
    Alert.alert('Éxito', `Orden guardado: ${resultado.pedidosActualizados} pedidos actualizados`);
    setModoReorden(false);
    cargarPaquetes(); // Recargar para reflejar el nuevo orden
  },
  (error) => {
    Alert.alert('Error', 'No se pudo guardar el orden. Intenta de nuevo.');
  }
);

// Función para activar/desactivar modo reorden
const toggleModoReorden = () => {
  if (modoReorden && ordenModificado) {
    Alert.alert(
      'Cambios sin guardar',
      '¿Deseas guardar los cambios en el orden antes de salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Descartar', onPress: () => { resetearOrden(); setModoReorden(false); } },
        { text: 'Guardar', onPress: async () => { await guardarOrden(); setModoReorden(false); } }
      ]
    );
  } else {
    setModoReorden(!modoReorden);
  }
};

// Renderizar botón de reorden en el header
<TouchableOpacity
  style={styles.reorderButton}
  onPress={toggleModoReorden}
>
  <MaterialIcons
    name={modoReorden ? "check" : "reorder"}
    size={24}
    color={modoReorden ? "#10b981" : "#3b82f6"}
  />
  <Text style={styles.reorderButtonText}>
    {modoReorden ? "Terminar" : "Ordenar"}
  </Text>
</TouchableOpacity>

// Renderizar lista según el modo
{modoReorden ? (
  // Modo reorden: lista con controles de orden
  <FlatList
    data={pedidosReordenados}
    keyExtractor={(item) => item.id.toString()}
    renderItem={({ item, index }) => (
      <PedidoReorderableItem
        pedido={item}
        index={index}
        total={pedidosReordenados.length}
        onMoveUp={() => moverPedido(index, index - 1)}
        onMoveDown={() => moverPedido(index, index + 1)}
        onPress={() => navigation.navigate('PaqueteDetalle', { paquete: item })}
      />
    )}
    ListFooterComponent={
      ordenModificado && (
        <View style={styles.reorderActions}>
          <TouchableOpacity
            style={[styles.reorderActionButton, styles.resetButton]}
            onPress={resetearOrden}
          >
            <Text style={styles.resetButtonText}>Resetear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.reorderActionButton, styles.saveButton]}
            onPress={guardarOrden}
            disabled={guardandoOrden}
          >
            <Text style={styles.saveButtonText}>
              {guardandoOrden ? 'Guardando...' : 'Guardar Orden'}
            </Text>
          </TouchableOpacity>
        </View>
      )
    }
  />
) : (
  // Modo normal: lista estándar
  <FlatList
    data={paquetes}
    // ... resto del código normal
  />
)}
```

---

## 📊 Flujo de Usuario

1. **Día 1 (Llega la minuta):**
   - Repartidor abre la app
   - Ve sus pedidos en estado PENDIENTE
   - Click en botón "Ordenar" (ícono de reorder)
   - Usa flechas arriba/abajo para reordenar
   - Click en "Guardar Orden"
   - Orden se guarda en backend

2. **Día 2 (Día de entrega):**
   - Repartidor abre la app
   - Ve sus pedidos en el orden personalizado
   - Click en "Comenzar Ruta"
   - Todos pasan a EN_RUTA
   - Va entregando en el orden que él organizó

3. **En cualquier momento:**
   - Puede volver a reordenar si lo desea
   - Puede resetear al orden por defecto

---

## ✅ Ventajas de esta Implementación

1. **Performance optimizado:** Índice en BD para queries rápidas
2. **Validación robusta:** Backend valida que los pedidos pertenezcan al repartidor
3. **Transaccional:** Todas las actualizaciones son atómicas
4. **UX simple:** Botones arriba/abajo son más confiables que drag-and-drop nativo
5. **Flexible:** Puede resetear al orden por defecto en cualquier momento
6. **Audit trail:** Los cambios de orden pueden registrarse como eventos
7. **Escalable:** Funciona con cualquier número de pedidos

---

## 🚀 Plan de Implementación

### Fase 1: Backend (1-2 horas)
1. Crear migration SQL
2. Actualizar modelo Pedido
3. Crear DTO ActualizarOrdenPedidosRequest
4. Agregar métodos al repository
5. Implementar lógica en service
6. Crear endpoints en controller
7. Probar con Postman/Insomnia

### Fase 2: Frontend (2-3 horas)
1. Actualizar servicio API
2. Crear hook usePedidosReorder
3. Crear componente PedidoReorderableItem
4. Modificar PaquetesScreen
5. Agregar estilos
6. Probar flujo completo

### Fase 3: Testing & Polish (1 hora)
1. Probar con diferentes cantidades de pedidos
2. Validar persistencia del orden
3. Probar casos edge (sin internet, etc.)
4. Ajustar UX según feedback

**TOTAL: 4-6 horas de desarrollo**

---

## 📝 Notas Adicionales

- El campo `orden_repartidor` acepta NULL (sin orden personalizado)
- Si es NULL, se ordena por ID ascendente (comportamiento original)
- El orden es específico por repartidor + fecha_salida
- Repartidores diferentes pueden tener órdenes diferentes para los mismos pedidos
- El orden se mantiene incluso después de cambiar a EN_RUTA o ENTREGADO

---

¿Procedemos con la implementación? ¿Hay algo que quieras modificar o agregar?
