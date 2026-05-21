# Guía de Integración - AdminApp

## 📋 Resumen

Este documento describe los pasos necesarios para integrar el nuevo `AdminApp` en la aplicación principal, reemplazando el `AdminScreen` antiguo.

---

## ✅ Estado de Dependencias

Todas las dependencias necesarias **ya están instaladas**:

- ✅ `react-native-pager-view@6.9.1`
- ✅ `@expo-google-fonts/montserrat@^0.4.2`
- ✅ `@expo-google-fonts/manrope@^0.4.2`
- ✅ `react-native-gesture-handler@~2.28.0`
- ✅ `react-native-reanimated@~4.1.1`
- ✅ `expo-font@14.0.11` (incluido en Expo SDK)
- ✅ `lucide-react-native@^1.16.0`

**No se requiere instalar ninguna dependencia adicional.**

---

## ✅ Integración Completada

Los siguientes cambios ya han sido aplicados:

### 1. App.js ✅
- ✅ Agregado import de `AdminApp`
- ✅ Agregado import de `GestureHandlerRootView`
- ✅ Reemplazado `AdminScreen` por `AdminApp` en navegación
- ✅ Envuelta la aplicación con `GestureHandlerRootView`

### 2. babel.config.js ✅
- ✅ Agregado plugin `react-native-reanimated/plugin`

### 3. ChatDrawer.js ✅
- ✅ Movido import de `REPARTIDORES` al inicio del archivo

---

## 🔧 Pasos de Integración

### 1. Actualizar App.js para usar AdminApp

**Archivo**: `App.js`

```javascript
// Agregar import
import AdminApp from './src/admin/AdminApp';

// Reemplazar en la navegación ADMIN (línea 74)
// ANTES:
<Stack.Screen name="Admin" component={AdminScreen} />

// DESPUÉS:
<Stack.Screen
  name="Admin"
  component={AdminApp}
  options={{
    headerShown: false,
  }}
/>
```

### 2. Opcional: Cargar Fuentes Globalmente en App.js

Las fuentes ya se cargan en `useRepartidorFonts` para las pantallas de repartidor. Opcionalmente, puedes cargarlas globalmente en App.js para toda la aplicación:

```javascript
import { useFonts } from 'expo-font';
import {
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';
import {
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';

// En el componente App
export default function App() {
  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!fontsLoaded) {
    return <LoadingScreen message="Cargando..." />;
  }

  // ... resto del código
}
```

**Nota**: Si decides cargar las fuentes globalmente, puedes simplificar `AdminApp` y las pantallas de repartidor eliminando la llamada a `useRepartidorFonts`.

### 3. Opcional: Agregar GestureHandlerRootView en App.js

Si no existe, envolver la navegación con `GestureHandlerRootView`:

```javascript
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AnnouncementProvider>
          <NavigationContainer ref={navigationRef}>
            <AppNavigator navigationRef={navigationRef} />
          </NavigationContainer>
        </AnnouncementProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
```

**Nota**: Verifica si ya existe en App.js antes de agregarlo.

---

## 🔌 Conexión con API Real

### Reemplazar Mock Data

**Archivo**: `src/admin/data.js`

Actualmente contiene datos mock. Para conectar con la API real:

#### Opción 1: Actualizar data.js para hacer fetch

```javascript
// src/admin/data.js
import { obtenerEstadisticasDia } from '../services/adminApi';
import { obtenerRepartidores } from '../services/repartidorApi';

export async function fetchAdminData() {
  try {
    const [stats, repartidores] = await Promise.all([
      obtenerEstadisticasDia(),
      obtenerRepartidores(),
    ]);

    // Transformar datos según necesidad
    return {
      stats: transformStats(stats),
      repartidores: transformRepartidores(repartidores),
    };
  } catch (error) {
    console.error('Error fetching admin data:', error);
    throw error;
  }
}

function transformStats(apiStats) {
  // Transformar formato API al formato esperado por los componentes
  return {
    successRate: apiStats.tasaExito,
    delivered: apiStats.entregados,
    assigned: apiStats.totalPedidos,
    // ... más transformaciones
  };
}

function transformRepartidores(apiRepartidores) {
  // Transformar repartidores de la API
  return apiRepartidores.map(rep => ({
    id: rep._id,
    name: rep.nombre,
    tag: rep.nombre.substring(0, 2).toUpperCase(),
    color: generateColor(rep._id), // Función helper
    routes: rep.rutasAsignadas || [],
    status: rep.estado || 'libre',
    online: rep.online || false,
    progress: {
      total: rep.totalPedidos || 0,
      done: rep.pedidosEntregados || 0,
      route: rep.enRuta || 0,
      pct: calculatePercentage(rep.pedidosEntregados, rep.totalPedidos),
    },
    phone: rep.telefono,
  }));
}
```

#### Opción 2: Manejar fetch en AdminApp

```javascript
// src/admin/AdminApp.js
import { useState, useEffect } from 'react';
import { fetchAdminData } from './services/adminDataService';

export default function AdminApp() {
  const [adminData, setAdminData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await fetchAdminData();
      setAdminData(data);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Splash hidden={false} />;
  }

  // Pasar adminData a las pantallas como props
  // ...
}
```

### Integrar WebSocket para Chat en Tiempo Real

```javascript
// src/admin/AdminApp.js
import { chatRealtimeService } from '../services/chatRealtimeService';

export default function AdminApp() {
  // ... estado existente

  useEffect(() => {
    // Conectar al WebSocket
    chatRealtimeService.connect();

    // Escuchar nuevos mensajes
    const unsubscribe = chatRealtimeService.on('newMessage', (message) => {
      // Actualizar unreadByConv
      setUnreadByConv(prev => ({
        ...prev,
        [message.senderId]: (prev[message.senderId] || 0) + 1,
      }));

      // Mostrar toast
      showToast(`Nuevo mensaje de ${message.senderName}`);
    });

    return () => {
      chatRealtimeService.disconnect();
      unsubscribe();
    };
  }, []);

  // ... resto del código
}
```

---

## 🧪 Verificación Post-Integración

### Checklist de Funcionalidades

- [ ] **Splash Screen**: Se muestra al iniciar y desaparece después de 1.7s
- [ ] **Scroll Vertical**: Las 3 pantallas se pueden navegar con swipe vertical
- [ ] **Animaciones**:
  - [ ] CountUp en números (Stats)
  - [ ] Card-in con stagger (Stats)
  - [ ] Bar-grow en barras de progreso (MoreDetailsPanel)
  - [ ] Pulse en CriticalAlert (Monitoreo)
- [ ] **SideRail**: Indicadores de puntos actualizan según pantalla activa
- [ ] **ChatFab**:
  - [ ] Badge muestra contador de no leídos
  - [ ] Al presionar, abre ChatDrawer
- [ ] **ChatDrawer**:
  - [ ] Se desliza desde la derecha
  - [ ] Swipe to close funciona
  - [ ] Lista de conversaciones muestra repartidores
  - [ ] Al seleccionar repartidor, muestra ConversationView
  - [ ] Botón atrás regresa a lista
- [ ] **Overlays**:
  - [ ] Scanner se abre desde botón en StatsScreen
  - [ ] MoreDetails se abre desde botón en StatsScreen
  - [ ] Analysis se abre desde botón en MonitoreoScreen
  - [ ] Todos se cierran correctamente
- [ ] **RepartidoresScreen**:
  - [ ] Búsqueda filtra en tiempo real
  - [ ] Botón "Llamar" abre dialer
  - [ ] Botón "Chat" abre ChatDrawer con conversación
  - [ ] Botón "Info" muestra alert con detalles
- [ ] **Fuentes**: Montserrat y Manrope se cargan correctamente
- [ ] **Notificaciones Toast**: Aparecen y desaparecen después de 3s

### Pruebas de Integración

1. **Login como ADMIN**: Verificar que se muestra AdminApp en lugar de AdminScreen
2. **Navegación Vertical**: Hacer swipe up/down entre pantallas
3. **Estado Persistente**: Los datos del chat se mantienen al navegar entre pantallas
4. **Gesturas**: Probar swipe to close en ChatDrawer
5. **Rendimiento**: Verificar que las animaciones sean fluidas (60fps)

---

## 🐛 Troubleshooting

### Las fuentes no se cargan

```javascript
// Verificar que las fuentes están correctamente instaladas
npm list @expo-google-fonts/montserrat @expo-google-fonts/manrope

// Si faltan, reinstalar
npm install @expo-google-fonts/montserrat @expo-google-fonts/manrope
```

### PagerView no funciona

```javascript
// Verificar instalación
npm list react-native-pager-view

// Si falta, instalar
npm install react-native-pager-view

// En iOS, ejecutar
cd ios && pod install && cd ..
```

### Gestos no funcionan

```javascript
// Verificar que GestureHandlerRootView envuelve la app
// En App.js:
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* ... resto de la app */}
    </GestureHandlerRootView>
  );
}
```

### Animaciones lentas o entrecortadas

```javascript
// Verificar que useNativeDriver está habilitado
// En todos los Animated.timing/spring, asegurar:
Animated.timing(value, {
  toValue: 1,
  duration: 300,
  useNativeDriver: true, // ← Importante
}).start();
```

---

## 📝 Notas Adicionales

### Compatibilidad con AdminScreen Antiguo

El nuevo `AdminApp` es completamente independiente del `AdminScreen` antiguo. Puedes:

1. **Reemplazar completamente**: Cambiar `AdminScreen` por `AdminApp` en App.js
2. **Coexistir temporalmente**: Agregar una ruta adicional para probar (ej: `AdminNew`)
3. **Migración gradual**: Mantener ambos hasta validar todas las funcionalidades

### Pantallas de Navegación que Puede Remover

Una vez integrado `AdminApp`, puedes considerar remover las siguientes pantallas antiguas de la navegación ADMIN en App.js (si ya no se usan):

- `MonitoreoScreen` (reemplazado por el interno de AdminApp)
- `RepartidoresScreen` (reemplazado por el interno de AdminApp)
- `EstadisticasIncidenciasScreen` (reemplazado por StatsScreen)

**Importante**: Verificar que no haya enlaces directos a estas pantallas antes de removerlas.

### Personalización de Colores

Si necesitas ajustar la paleta de colores, edita:

```javascript
// src/admin/theme.js
export const theme = {
  accent: '#FF7849', // ← Cambiar color coral
  // ... otros colores
};
```

### Agregar Nuevas Secciones

Para agregar una 4ta pantalla al PagerView:

```javascript
// src/admin/AdminApp.js
<PagerView>
  {/* ... 3 pantallas existentes */}

  {/* Nueva pantalla */}
  <View key="3" style={styles.page}>
    <NuevaPantallaScreen />
  </View>
</PagerView>

// Actualizar SideRail para incluir 4to punto
<SideRail activeSection={activeSection} totalSections={4} />
```

---

**Última actualización**: Mayo 20, 2026
**Autor**: Claude Sonnet 4.5
