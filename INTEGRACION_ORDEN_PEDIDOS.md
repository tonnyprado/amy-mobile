# Integración: Sistema de Ordenamiento de Pedidos

## 📦 Componentes Creados (Bloques de LEGO)

### 1. `pedidoOrdenApi.js`
**Responsabilidad**: Comunicación con backend para guardar/resetear orden.
- `guardarOrdenPedidos(idRepartidor, pedidos)`
- `resetearOrdenPedidos(idRepartidor, fecha)`

### 2. `usePedidosReorder.js` (Hook)
**Responsabilidad**: Lógica de reordenamiento en memoria.
- Mover pedidos arriba/abajo
- Guardar orden
- Resetear orden
- Aplicar nuevo orden (útil para OSRM)

### 3. `PedidoReorderableItem.js` (Componente de presentación)
**Responsabilidad**: Renderizar UN pedido con controles ↑↓.
- No maneja estado global
- Solo recibe callbacks

### 4. `OrdenPedidosControls.js` (Componente de presentación)
**Responsabilidad**: Botones de acción (Ordenar/Guardar/Resetear).
- Cambia según el modo (normal vs reorden)
- No maneja lógica de negocio

### 5. `PedidosListaConOrden.js` (Componente contenedor)
**Responsabilidad**: Orquestar el flujo completo de reorden.
- Maneja modo reorden (normal/edición)
- Usa el hook usePedidosReorder
- Renderiza componentes de presentación
- Maneja guardado en backend

---

## 🔧 Modificaciones en PaquetesScreen

### Paso 1: Importar el nuevo componente

```javascript
// Al inicio del archivo, agregar:
import PedidosListaConOrden from '../components/PedidosListaConOrden';
import { guardarOrdenPedidos } from '../services/pedidoOrdenApi';
```

### Paso 2: Modificar handleOptimizarRuta para guardar el orden

Después de aplicar el orden optimizado, guardarlo en el backend:

```javascript
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
```

### Paso 3: Opción A - Usar el componente todo-en-uno (Recomendado)

Si quieres que TODOS los pedidos sean reordenables (simple):

```javascript
// Reemplazar el FlatList actual (líneas 541-562) por:

<PedidosListaConOrden
  pedidos={paquetesFiltrados}
  idRepartidor={user?.repartidor?.idRepartidor}
  onPedidoPress={handlePaquetePress}
  onOrdenGuardado={(resultado) => {
    console.log('Orden guardado:', resultado);
    // Opcional: recargar pedidos para sincronizar con backend
    // cargarPaquetes();
  }}
  // Props de FlatList
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
```

### Paso 3: Opción B - Solo permitir reorden en PENDIENTE/EN_RUTA

Si quieres que solo los pedidos PENDIENTE o EN_RUTA sean reordenables:

```javascript
{/* Lista de paquetes */}
{(filtroActivo === 'PENDIENTE' || filtroActivo === 'EN_RUTA' || filtroActivo === 'TODOS') ? (
  <PedidosListaConOrden
    pedidos={paquetesFiltrados}
    idRepartidor={user?.repartidor?.idRepartidor}
    onPedidoPress={handlePaquetePress}
    onOrdenGuardado={(resultado) => {
      console.log('Orden guardado:', resultado);
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
  // Para ENTREGADO y NO_ENTREGADO, usar lista normal sin reorden
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
```

---

## ✅ Flujo Completo

### Escenario 1: Optimización Automática (OSRM)
```
1. Repartidor tiene pedidos EN_RUTA
2. Click en "Optimizar Ruta" 🎯
3. OSRM calcula ruta óptima
4. Se aplica el orden optimizado en UI
5. ✅ NUEVO: Se guarda orden en backend automáticamente
6. Repartidor ve pedidos reordenados
```

### Escenario 2: Ajuste Manual
```
1. Repartidor ve sus pedidos (orden actual)
2. Click en "Ordenar Manualmente" (modo reorden activado)
3. Usa flechas ↑↓ para mover pedidos
4. Click en "Guardar Orden"
5. Orden se guarda en backend
6. Vuelve al modo normal con el nuevo orden
```

### Escenario 3: Combinado (Optimizar + Ajustar)
```
1. Click en "Optimizar Ruta" → guarda automáticamente
2. Repartidor ve orden optimizado
3. Click en "Ordenar Manualmente"
4. Hace ajustes finos (mover 1-2 pedidos)
5. Click en "Guardar Orden"
6. Orden final se guarda
```

---

## 🎯 Separación de Responsabilidades

```
PaquetesScreen (Pantalla principal)
  ├─ Maneja: navegación, filtros, GPS, recorrido
  └─ USA ⤵

PedidosListaConOrden (Contenedor inteligente)
  ├─ Maneja: modo reorden, guardado, orquestación
  ├─ USA ⤵
  │   ├─ usePedidosReorder (Hook - lógica)
  │   └─ guardarOrdenPedidos (API - persistencia)
  └─ RENDERIZA ⤵
      ├─ OrdenPedidosControls (Botones de acción)
      └─ CONDICIONAL ⤵
          ├─ PedidoReorderableItem (modo reorden)
          └─ PaqueteCard (modo normal)
```

Cada componente tiene UNA responsabilidad clara.
Cada uno puede ser testeado independientemente.
Fácil de mantener y extender.

---

## 🔥 Próximos Pasos

1. **Backend**: Implementar los endpoints en Java Spring Boot
   - `POST /api/pedidos/actualizar-orden`
   - `POST /api/pedidos/repartidor/{id}/resetear-orden`

2. **Testing**: Probar el flujo completo
   - Optimización OSRM → orden guardado
   - Reorden manual → orden guardado
   - Persistencia → recargar app mantiene orden

3. **Mejoras opcionales**:
   - Drag & drop nativo (react-native-draggable-flatlist)
   - Animaciones al reordenar
   - Undo/Redo de cambios

---

¿Listo para implementar? Comienza con la **Opción A** del Paso 3 para la integración más simple.
