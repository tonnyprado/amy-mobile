# Arquitectura - AMY Delivery App

Documentación de la arquitectura y componentes de la aplicación.

## Principios de Diseño

1. **Separación de responsabilidades**: Cada componente tiene un único propósito
2. **Reutilización**: Componentes pequeños y reutilizables
3. **Composición sobre herencia**: Componentes se componen entre sí
4. **Estado mínimo**: Solo el estado necesario en cada nivel
5. **API centralizada**: Un solo punto de configuración para el backend

## Estructura de Carpetas

```
src/
├── config/           → Configuración global
├── services/         → Lógica de negocio y APIs
├── hooks/            → Hooks personalizados de React
├── contexts/         → Estado global de la app
├── screens/          → Pantallas completas
└── components/       → Componentes reutilizables
```

## Componentes Principales

### 📱 Screens (Pantallas)

#### `LoginScreen.js`
- **Propósito**: Autenticación de repartidores
- **Responsabilidades**:
  - Validación de formulario
  - Llamada al servicio de login
  - Manejo de errores de autenticación
- **Navegación**: → `PaquetesScreen` (al autenticarse)

#### `PaquetesScreen.js`
- **Propósito**: Dashboard principal con lista de pedidos
- **Responsabilidades**:
  - Cargar pedidos del día
  - Filtrar por estado
  - Mostrar resumen de entregas
  - Iniciar/finalizar recorrido
  - Activar GPS tracking
- **Navegación**: → `PaqueteDetalleScreen` (al seleccionar pedido)
- **Hooks usados**: `useGeolocation`, `useAuth`

#### `PaqueteDetalleScreen.js`
- **Propósito**: Detalle de pedido individual y captura de evidencias
- **Responsabilidades**:
  - Mostrar información del pedido
  - Capturar fotos de evidencia
  - Registrar datos del receptor
  - Cambiar estado del pedido
  - Enviar datos al backend
- **Navegación**: ← `PaquetesScreen` (volver)

### 🧩 Components (Reutilizables)

#### `Button.js`
- **Props**:
  - `title`: Texto del botón
  - `onPress`: Callback al presionar
  - `variant`: 'primary' | 'secondary' | 'success' | 'danger'
  - `disabled`: Estado deshabilitado
  - `loading`: Mostrar spinner de carga
- **Uso**: Todos los botones de la app

#### `Input.js`
- **Props**:
  - `label`: Etiqueta del campo
  - `value`: Valor actual
  - `onChangeText`: Callback al cambiar
  - `placeholder`: Texto de placeholder
  - `secureTextEntry`: Para contraseñas
  - `error`: Mensaje de error
- **Uso**: Todos los inputs de texto

#### `Card.js`
- **Props**:
  - `children`: Contenido del card
  - `style`: Estilos adicionales
- **Uso**: Contenedores con sombra y bordes redondeados

#### `LoadingScreen.js`
- **Props**:
  - `message`: Mensaje a mostrar
- **Uso**: Pantallas de carga

#### `PaqueteCard.js`
- **Props**:
  - `paquete`: Objeto del pedido
  - `isSelected`: Si está seleccionado
  - `onPress`: Callback al presionar
- **Uso**: Lista de paquetes en `PaquetesScreen`
- **Responsabilidades**:
  - Mostrar información resumida del pedido
  - Badge de estado con colores
  - Footer con metadatos

#### `GPSStatusIndicator.js`
- **Props**:
  - `tracking`: Si el GPS está activo
  - `ubicacion`: Objeto con coordenadas actuales
  - `ultimoEnvio`: Timestamp del último envío
  - `error`: Mensaje de error del GPS
- **Uso**: Indicador de estado GPS en `PaquetesScreen`
- **Responsabilidades**:
  - Mostrar estado del GPS (activo/error)
  - Precisión y velocidad actuales
  - Último envío al servidor

## Servicios

### `config/api.js`
- **Propósito**: Configuración centralizada de API
- **Exporta**:
  - `API_BASE_URL`: URL del backend
  - `apiClient`: Cliente HTTP con métodos (get, post, put, delete)
- **Configuración**:
  - `DEV_API_URL`: Para desarrollo local
  - `PROD_API_URL`: Para producción

### `services/authApi.js`
- **Propósito**: Autenticación
- **Funciones**:
  - `login(username, password)`: Iniciar sesión
  - `esRepartidor(user)`: Verificar rol

### `services/repartidorApi.js`
- **Propósito**: API completa de repartidores
- **Funciones**:
  - **Pedidos**: `obtenerPedidosHoy()`, `obtenerDetallePedido()`
  - **Rastreo**: `enviarUbicacion()`
  - **Recorridos**: `iniciarRecorrido()`, `finalizarRecorrido()`
  - **Entregas**: `registrarIntentoEntrega()`, `obtenerIntentosEntrega()`
  - **Helpers**: `convertirPedidoBackend()`, `mapearEstadoBackend()`

## Hooks Personalizados

### `hooks/useGeolocation.js`
- **Propósito**: Tracking GPS en tiempo real
- **Parámetros**:
  - `repartidorId`: ID del repartidor
  - `enabled`: Activar/desactivar tracking
  - `estadoActividad`: Estado actual (EN_RUTA, EN_ALMACEN, etc)
  - `intervalo`: Frecuencia de envío (default: 15000ms)
- **Retorna**:
  - `ubicacion`: Coordenadas actuales
  - `error`: Error de GPS
  - `tracking`: Si está rastreando
  - `ultimoEnvio`: Timestamp del último envío
  - `solicitarPermisos()`: Función para solicitar permisos
  - `obtenerUbicacionUnaVez()`: Obtener ubicación puntual
- **Tecnologías**: `expo-location`, `expo-battery`
- **Funcionamiento**:
  1. Solicita permisos de ubicación
  2. Inicia `watchPosition` con alta precisión
  3. Actualiza estado local en cada cambio
  4. Envía al backend cada X segundos
  5. Incluye datos de batería del dispositivo

## Contextos (Estado Global)

### `contexts/AuthContext.js`
- **Propósito**: Gestión de autenticación global
- **Estado**:
  - `user`: Usuario autenticado
  - `loading`: Estado de carga inicial
  - `isAuthenticated`: Si hay sesión activa
- **Funciones**:
  - `login(username, password)`: Iniciar sesión y guardar en AsyncStorage
  - `logout()`: Cerrar sesión y limpiar AsyncStorage
- **Tecnologías**: `@react-native-async-storage/async-storage`
- **Persistencia**: Guarda sesión en AsyncStorage para mantener login entre reinicios

## Flujo de Datos

### Autenticación
```
LoginScreen → authApi.login() → AuthContext.login()
→ AsyncStorage → Navega a PaquetesScreen
```

### Carga de Pedidos
```
PaquetesScreen → repartidorApi.obtenerPedidosHoy()
→ Backend → Convierte con convertirPedidoBackend()
→ Estado local → Renderiza PaqueteCard[]
```

### GPS Tracking
```
useGeolocation hook → Expo Location → watchPosition
→ Estado local (ubicacion) → setInterval(15s)
→ repartidorApi.enviarUbicacion() → Backend
```

### Cambio de Estado de Pedido
```
PaqueteDetalleScreen → Validar formulario
→ repartidorApi.registrarIntentoEntrega()
→ Backend → Callback a PaquetesScreen
→ Actualiza estado local → Re-renderiza
```

## Navegación

```
App.js
└── NavigationContainer
    └── Stack.Navigator
        ├── LoginScreen (sin autenticación)
        └── (con autenticación)
            ├── PaquetesScreen
            └── PaqueteDetalleScreen (modal)
```

**Tipo**: Stack Navigation (React Navigation Native Stack)
**Animación**: slide_from_right

## Permisos Android

Configurados en `app.json`:

| Permiso | Uso |
|---------|-----|
| `ACCESS_FINE_LOCATION` | GPS de alta precisión |
| `ACCESS_COARSE_LOCATION` | GPS aproximado (fallback) |
| `CAMERA` | Tomar fotos de evidencia |
| `READ_EXTERNAL_STORAGE` | Leer galería |
| `WRITE_EXTERNAL_STORAGE` | Guardar fotos |

## Dependencias Principales

| Paquete | Versión | Uso |
|---------|---------|-----|
| `expo` | ^52.x | Framework base |
| `expo-location` | latest | GPS tracking |
| `expo-image-picker` | latest | Captura de fotos |
| `expo-camera` | latest | Acceso a cámara |
| `expo-battery` | latest | Nivel de batería |
| `@react-navigation/native` | latest | Navegación |
| `@react-navigation/native-stack` | latest | Stack navigation |
| `@react-native-async-storage/async-storage` | latest | Almacenamiento local |
| `react-native-gesture-handler` | latest | Gestos táctiles |
| `react-native-signature-canvas` | latest | Firma digital (por implementar) |

## Patrones de Código

### Props Destructuring
```js
export default function Button({ title, onPress, variant = 'primary' }) {
  // ...
}
```

### Hooks con Cleanup
```js
useEffect(() => {
  startTracking();
  return () => stopTracking(); // Cleanup
}, [enabled]);
```

### Estado con Callback
```js
setPaquetes(prevPaquetes =>
  prevPaquetes.map(p => p.id === id ? { ...p, estado } : p)
);
```

### Error Handling
```js
try {
  await apiCall();
} catch (error) {
  console.error('Error:', error);
  Alert.alert('Error', error.message);
}
```

## Convenciones de Código

- **Nombres de archivos**: PascalCase para componentes (`Button.js`)
- **Nombres de funciones**: camelCase (`obtenerPedidos`)
- **Constantes**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Estilos**: StyleSheet.create al final del archivo
- **Comentarios**: JSDoc para funciones públicas
- **Imports**: Ordenados (React → Libs → Componentes → Estilos)

## Testing (Por implementar)

- **Unit tests**: Jest para servicios y hooks
- **Component tests**: React Native Testing Library
- **E2E tests**: Detox o Maestro

## Performance

### Optimizaciones Aplicadas
1. **FlatList** para listas largas de paquetes
2. **useCallback** para funciones en hooks
3. **Memoización** con useMemo donde sea necesario
4. **GPS**: Envío cada 15s (no cada segundo)
5. **Imágenes**: Compresión al capturar (quality: 0.7)

### Optimizaciones Futuras
- [ ] React.memo para componentes pesados
- [ ] Virtualización de lista con windowSize
- [ ] Lazy loading de pantallas
- [ ] Caché de imágenes
- [ ] Debounce en búsquedas

## Seguridad

- ✅ No se almacenan contraseñas en AsyncStorage
- ✅ HTTPS en producción
- ✅ Validación de rol (solo REPARTIDOR)
- ⚠️ Por implementar: JWT tokens con refresh
- ⚠️ Por implementar: Encriptación de AsyncStorage

## Mejoras Futuras

### Corto Plazo
- [ ] Upload real de fotos (Firebase/S3)
- [ ] Firma digital funcional
- [ ] Modo offline con cola de sincronización

### Mediano Plazo
- [ ] Push notifications
- [ ] Mapas con ruta optimizada
- [ ] Chat con soporte
- [ ] Escáner de códigos QR/Barcode

### Largo Plazo
- [ ] IA para sugerir rutas óptimas
- [ ] Reconocimiento de firma con ML
- [ ] Analytics de rendimiento del repartidor
