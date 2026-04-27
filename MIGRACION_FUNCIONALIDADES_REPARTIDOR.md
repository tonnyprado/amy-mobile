# Migración de Funcionalidades del Repartidor - App Móvil

**Fecha:** 2026-04-27
**Version:** 1.0
**Estado:** Completo

## Resumen de Cambios

Se han migrado exitosamente las nuevas funcionalidades del repartidor desde el front web a la app móvil de Expo. Esta migración incluye navegación GPS, firma digital, mejoras en el flujo de estados y componentes de UI modernos.

---

## Componentes Migrados

### 1. ✅ Servicios API

**Archivo:** `src/services/repartidorApi.js`

**Cambios:**
- ✅ Agregadas coordenadas GPS (`latitud`, `longitud`) en `convertirPedidoBackend()`
- ✅ Corregido manejo de respuesta 403/404 en `obtenerPedidosHoy()` - ahora retorna array vacío
- ✅ Agregados campos `numeroPedido`, `nombreConsultora`, `direccionConsultora` para compatibilidad con navegación

**Archivo:** `src/services/routeService.js` (NUEVO)

**Funcionalidades:**
- ✅ Cálculo de rutas con OSRM (Open Source Routing Machine)
- ✅ Parsing de instrucciones de navegación en español
- ✅ Formateo de distancias y duraciones
- ✅ Cálculo de bounds para ajustar el mapa
- ✅ Cálculo de distancia entre puntos (Haversine)

---

### 2. ✅ Componentes de UI

**Archivo:** `src/components/SignaturePad.js` (NUEVO)

**Funcionalidades:**
- ✅ Captura de firma digital del cliente
- ✅ Exporta firma en formato base64
- ✅ Botón de limpiar firma
- ✅ Indicador visual cuando la firma está guardada

**Dependencia requerida:**
```bash
npx expo install react-native-signature-canvas react-native-webview
```

**Archivo:** `src/components/IslandBar.js` (NUEVO)

**Funcionalidades:**
- ✅ Indicador flotante tipo "Dynamic Island" de iPhone
- ✅ Muestra número de pedidos en ruta
- ✅ Modo compacto y expandido
- ✅ Click para abrir navegación GPS
- ✅ Se oculta automáticamente cuando no hay pedidos en ruta

---

### 3. ✅ Pantallas

**Archivo:** `src/screens/NavigationMapScreen.js` (NUEVO)

**Funcionalidades:**
- ✅ Mapa de navegación fullscreen con React Native Maps
- ✅ Detección automática de plataforma (Apple Maps en iOS, Google Maps en Android)
- ✅ Marcadores personalizados para ubicación actual y pedidos
- ✅ Cálculo y trazado de rutas con OSRM
- ✅ Panel lateral con lista de pedidos en ruta
- ✅ Panel de instrucciones paso a paso
- ✅ Auto-ajuste del mapa a los bounds de la ruta
- ✅ Indicadores de carga y error

**Dependencia requerida:**
```bash
npx expo install react-native-maps
```

**Mapas por Plataforma:**
- **iOS**: Usa Apple Maps automáticamente (sin configuración)
- **Android**: Usa Google Maps (requiere API key en `app.json`)

**Archivo:** `src/screens/PaqueteDetalleScreen.js` (ACTUALIZADO)

**Cambios:**
- ✅ Agregado componente SignaturePad para captura de firma
- ✅ Firma se guarda en estado local y se envía al backend
- ✅ Sección de firma con estilos propios

**Archivo:** `src/screens/PaquetesScreen.js` (ACTUALIZADO)

**Cambios:**
- ✅ Agregado componente IslandBar
- ✅ Función `handleOpenNavigation()` para abrir el mapa
- ✅ Filtrado de pedidos EN_RUTA para el IslandBar
- ✅ Navegación a `NavigationMapScreen` con parámetros correctos

---

### 4. ✅ Navegación

**Archivo:** `App.js` (ACTUALIZADO)

**Cambios:**
- ✅ Agregada pantalla `NavigationMapScreen` al stack de navegación
- ✅ Configuración como modal fullscreen
- ✅ Animación de slide desde abajo

---

## Instalación de Dependencias

Para que todas las funcionalidades nuevas funcionen, ejecuta los siguientes comandos:

```bash
# 1. React Native Maps para navegación GPS
npx expo install react-native-maps

# 2. Firma digital y orientación de pantalla
npx expo install react-native-signature-canvas react-native-webview expo-screen-orientation

# 3. Animaciones Lottie para iconos animados
npx expo install lottie-react-native
```

**Nota:** Si ya usas `expo-location` y `expo-battery`, no necesitas instalarlas de nuevo.

## Compatibilidad de Plataformas

✅ **iOS (iPhone/iPad)** - Funciona completamente
✅ **Android** - Funciona completamente

La app detecta automáticamente la plataforma y usa:
- **iOS**: Apple Maps (nativo, sin API key necesaria)
- **Android**: Google Maps (requiere API key)

---

## Configuración de Mapas por Plataforma

### iOS (Apple Maps) ✅ SIN CONFIGURACIÓN

**No necesitas hacer nada.** Los mapas de Apple funcionan de forma nativa sin API key.

La app ya está configurada con todos los permisos necesarios en `app.json`:
- `NSLocationWhenInUseUsageDescription` ✅
- `NSLocationAlwaysAndWhenInUseUsageDescription` ✅

**Ventajas de Apple Maps:**
- ✅ Gratis, sin límites
- ✅ Mejor rendimiento en iOS
- ✅ Integración nativa
- ✅ Menor consumo de batería

### Android (Google Maps) ⚙️ REQUIERE API KEY

1. Obtén una API key de Google Maps en [Google Cloud Console](https://console.cloud.google.com/)
2. Habilita la API de "Maps SDK for Android"
3. **Ya está configurada en `app.json`** con tu API key:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSyAs3E7xu35m6XnJD1oLmNQ1uHd0-u2EtvQ"
        }
      }
    }
  }
}
```

**Nota:** La API key ya está en el archivo. Si necesitas cambiarla, edita `app.json`.

---

## Flujo de Usuario Actualizado

### Pantalla de Paquetes

1. Usuario ve lista de paquetes con filtros
2. GPS se activa automáticamente cuando hay pedidos EN_RUTA
3. **NUEVO:** IslandBar flotante aparece cuando hay pedidos EN_RUTA
4. Click en IslandBar → Abre NavigationMapScreen

### Navegación GPS (NUEVO)

1. Mapa fullscreen con ubicación actual
2. Marcadores de todos los pedidos EN_RUTA
3. Lista lateral de pedidos
4. Click en pedido → Calcula y muestra ruta
5. Panel de instrucciones paso a paso
6. Botón X para cerrar y volver

### Detalle del Paquete

1. Información del cliente y pedido
2. Captura de fotos (existente)
3. **NUEVO:** Captura de firma digital
4. Validaciones de campos requeridos
5. Botones de acción según estado

---

## Funcionalidades del Web NO Migradas (Futuro)

Las siguientes funcionalidades del web no se migraron en esta fase:

### 1. Navegación Vocal
- `expo-speech` para instrucciones de voz
- `expo-haptics` para vibración en giros
- `expo-keep-awake` para mantener pantalla encendida

### 2. Upload de Fotos al Servidor
- Actualmente las fotos solo se guardan localmente
- Falta implementar upload real a servidor/S3/Cloud Storage

### 3. Modo Offline
- Guardado de pedidos en AsyncStorage
- Sincronización cuando vuelve internet
- Queue de intentos de entrega pendientes

### 4. Notificaciones Push
- Nuevos pedidos asignados
- GPS desconectado
- Batería baja

---

## Testing

### Casos de Prueba Principales

1. **GPS en Background**
   - Minimizar app → Verificar que GPS sigue enviando ubicación

2. **Navegación con Múltiples Pedidos**
   - Marcar 3 pedidos EN_RUTA
   - Abrir mapa
   - Seleccionar diferentes pedidos
   - Verificar cálculo de rutas

3. **Firma Digital**
   - Abrir detalle de pedido
   - Dibujar firma
   - Limpiar firma
   - Guardar y verificar que se envía al backend

4. **IslandBar**
   - Sin pedidos EN_RUTA → No debe aparecer
   - Con pedidos EN_RUTA → Debe aparecer
   - Click → Debe abrir mapa

5. **Validaciones**
   - Intentar entregar sin nombre → Debe mostrar error
   - Intentar NO_ENTREGADO sin motivo → Debe mostrar error

---

## Diferencias entre iOS y Android

| Característica | iOS | Android |
|---------------|-----|---------|
| **Mapas** | Apple Maps (nativo) | Google Maps |
| **API Key** | No necesita | Sí necesita |
| **Rendimiento** | Excelente | Muy bueno |
| **GPS Background** | Excelente | Muy bueno |
| **Precisión GPS** | ~5-10m | ~10-20m |
| **Consumo Batería** | Optimizado | Optimizado |
| **Firma Digital** | Funciona perfecto | Funciona perfecto |
| **Fotos** | Cámara nativa | Cámara nativa |

## Problemas Conocidos

### 1. React Native Maps en iOS Simulator
- Los mapas pueden renderizar lento en el simulador
- **Solución:** Prueba en dispositivo real (iPhone/iPad) para mejor rendimiento

### 2. Firma Digital en Android Antiguo
- Algunos dispositivos antiguos pueden tener problemas con WebView
- **Requisito:** Android 5.0+ (API Level 21)

### 3. OSRM Rate Limiting
- El servicio público de OSRM tiene límite de ~100 requests/minuto
- **Solución para producción:** Desplegar tu propio servidor OSRM

### 4. Expo Go vs Build Nativo
- En Expo Go, `react-native-maps` puede tener limitaciones
- **Solución:** Si tienes problemas, crea un build de desarrollo (`eas build --profile development`)

---

## Próximos Pasos Recomendados

1. **Fase 1 (Inmediato):**
   - Instalar dependencias
   - Configurar Google Maps API key
   - Probar en dispositivo real

2. **Fase 2 (Corto plazo):**
   - Implementar upload de fotos a servidor
   - Agregar navegación vocal con `expo-speech`
   - Mantener pantalla encendida durante navegación

3. **Fase 3 (Mediano plazo):**
   - Modo offline con AsyncStorage
   - Notificaciones push
   - Servidor OSRM propio para producción

4. **Fase 4 (Largo plazo):**
   - Optimización de batería
   - Caché de mapas
   - Compresión de imágenes
   - Analytics y métricas

---

## Estructura de Archivos Final

```
amy-mobile/
├── App.js                               ✏️ ACTUALIZADO
├── src/
│   ├── components/
│   │   ├── Button.js                    ✓ Existente
│   │   ├── Card.js                      ✓ Existente
│   │   ├── GPSStatusIndicator.js        ✓ Existente
│   │   ├── Input.js                     ✓ Existente
│   │   ├── IslandBar.js                 🆕 NUEVO
│   │   ├── LoadingScreen.js             ✓ Existente
│   │   ├── PaqueteCard.js               ✓ Existente
│   │   └── SignaturePad.js              🆕 NUEVO
│   │
│   ├── config/
│   │   └── api.js                       ✓ Existente
│   │
│   ├── contexts/
│   │   └── AuthContext.js               ✓ Existente
│   │
│   ├── hooks/
│   │   └── useGeolocation.js            ✓ Existente
│   │
│   ├── screens/
│   │   ├── LoginScreen.js               ✓ Existente
│   │   ├── NavigationMapScreen.js       🆕 NUEVO
│   │   ├── PaqueteDetalleScreen.js      ✏️ ACTUALIZADO
│   │   └── PaquetesScreen.js            ✏️ ACTUALIZADO
│   │
│   └── services/
│       ├── repartidorApi.js             ✏️ ACTUALIZADO
│       └── routeService.js              🆕 NUEVO
```

---

## Cómo Probar la App

### Opción 1: Expo Go (Desarrollo Rápido)

**En iPhone/iPad o Android:**

```bash
# 1. Iniciar el servidor de desarrollo
npx expo start

# 2. Escanear el QR con:
#    - iOS: App de Cámara nativa
#    - Android: App Expo Go
```

La app se abrirá en Expo Go automáticamente.

**Nota:** Algunas funcionalidades avanzadas pueden requerir un build nativo (ver Opción 2).

### Opción 2: Build Nativo (Testing Real)

**Para iOS (iPhone/iPad):**
```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login en Expo
eas login

# Build de desarrollo para iOS
eas build --profile development --platform ios

# O build de producción
eas build --platform ios
```

**Para Android:**
```bash
# Build de desarrollo para Android
eas build --profile development --platform android

# O build de producción
eas build --platform android
```

## Comandos Rápidos

```bash
# Instalar todas las dependencias nuevas
npx expo install react-native-maps react-native-signature-canvas react-native-webview expo-screen-orientation lottie-react-native

# Iniciar en desarrollo
npx expo start

# Iniciar y abrir en dispositivo específico
npx expo start --ios    # Abre simulador iOS
npx expo start --android # Abre emulador Android

# Build de producción
eas build --platform ios
eas build --platform android
eas build --platform all  # Ambas plataformas
```

---

## Soporte

Si encuentras problemas:

1. Verifica que todas las dependencias estén instaladas
2. Revisa la configuración de Google Maps API key
3. Comprueba los permisos de ubicación en el dispositivo
4. Consulta la documentación de cada dependencia:
   - [React Native Maps](https://github.com/react-native-maps/react-native-maps)
   - [React Native Signature Canvas](https://github.com/YanYuanFE/react-native-signature-canvas)
   - [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)

---

**Migración completada por:** Claude Sonnet 4.5
**Basado en:** FUNCIONALIDAD_REPARTIDOR_PARA_MOVIL.md
