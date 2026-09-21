# Mendiola Logistics - App Móvil para Repartidores

App móvil nativa (Android) para repartidores de Mendiola Logistics Platform. Desarrollada con Expo y React Native.

## Características

- **Autenticación segura** para repartidores
- **Tracking GPS en tiempo real** con envío automático al backend cada 15 segundos
- **Gestión de pedidos** (Pendiente, En Ruta, Entregado, No Entregado)
- **Captura de evidencias** (fotos, firma digital, datos del receptor)
- **Sincronización con backend** en tiempo real
- **Optimizada para Android** con soporte básico para iOS

## Stack Tecnológico

- **Expo** - Framework de desarrollo móvil
- **React Native** - Framework de UI nativo
- **React Navigation** - Navegación entre pantallas
- **Expo Location** - Tracking GPS
- **Expo Image Picker** - Captura de fotos
- **Expo Camera** - Acceso a cámara
- **AsyncStorage** - Almacenamiento local

## Requisitos Previos

- Node.js 18+
- npm o yarn
- Expo CLI (`npm install -g expo-cli`)
- Para pruebas en Android:
  - Android Studio con emulador configurado, O
  - Dispositivo Android físico con la app Expo Go instalada

## Instalación

```bash
# Clonar repositorio
git clone <url-del-repo>
cd amy-mobile

# Instalar dependencias
npm install

# Configurar API
# Edita src/config/api.js y actualiza las URLs:
# - DEV_API_URL: tu IP local (ej: http://192.168.1.100:8080)
# - PROD_API_URL: tu servidor de producción
```

## Desarrollo

### Ejecutar en modo desarrollo

```bash
# Iniciar servidor de desarrollo
npm start
# o
npx expo start

# Escanear el código QR con Expo Go (Android)
# O presionar 'a' para abrir en emulador Android
```

### Configurar IP local para desarrollo

1. Encuentra tu IP local:
   ```bash
   # Mac/Linux
   ifconfig | grep "inet "

   # Windows
   ipconfig
   ```

2. Actualiza `src/config/api.js`:
   ```js
   const DEV_API_URL = 'http://TU_IP_AQUI:8080';
   ```

3. Asegúrate de que tu backend esté corriendo en `http://localhost:8080`

### Estructura del Proyecto

```
amy-mobile/
├── App.js                          # Entry point con navegación
├── app.json                        # Configuración Expo
├── package.json
└── src/
    ├── config/
    │   └── api.js                  # Configuración de API
    ├── services/
    │   ├── authApi.js              # Servicio de autenticación
    │   └── repartidorApi.js        # API de pedidos y rastreo
    ├── hooks/
    │   └── useGeolocation.js       # Hook de GPS tracking
    ├── contexts/
    │   └── AuthContext.js          # Contexto de autenticación
    ├── screens/
    │   ├── LoginScreen.js          # Pantalla de login
    │   ├── PaquetesScreen.js       # Lista de paquetes
    │   └── PaqueteDetalleScreen.js # Detalle y evidencias
    └── components/
        ├── Button.js               # Botón reutilizable
        ├── Input.js                # Input reutilizable
        ├── Card.js                 # Card reutilizable
        ├── LoadingScreen.js        # Pantalla de carga
        ├── PaqueteCard.js          # Tarjeta de paquete
        └── GPSStatusIndicator.js   # Indicador de GPS
```

## Build para Producción

### Build APK (Android)

#### Opción 1: Build local con Expo

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Configurar EAS
eas login
eas build:configure

# Build APK para pruebas
eas build --platform android --profile preview

# Build APK de producción (firmado)
eas build --platform android --profile production
```

#### Opción 2: Build local sin EAS (más rápido para desarrollo)

```bash
# Generar bundle de producción
npx expo export --platform android

# Generar APK (requiere Android SDK)
cd android
./gradlew assembleRelease
```

El APK se generará en `android/app/build/outputs/apk/release/app-release.apk`

### Publicar en Google Play Store

1. **Crear cuenta de desarrollador** en Google Play Console ($25 USD pago único)

2. **Configurar firma de app**:
   ```bash
   eas credentials
   ```

3. **Build de producción firmado**:
   ```bash
   eas build --platform android --profile production
   ```

4. **Subir a Google Play**:
   - Ir a Google Play Console
   - Crear nueva aplicación
   - Subir el APK/AAB generado
   - Completar ficha de la tienda (descripción, screenshots, etc.)
   - Enviar para revisión

### Build para iOS (opcional)

```bash
# Requiere cuenta de Apple Developer ($99/año)
eas build --platform ios
```

## Configuración de Producción

### Variables de entorno

Edita `src/config/api.js`:

```js
const PROD_API_URL = 'https://tu-servidor-produccion.com';
```

### Permisos Android

Los permisos ya están configurados en `app.json`:
- `ACCESS_FINE_LOCATION` - GPS preciso
- `ACCESS_COARSE_LOCATION` - GPS aproximado
- `CAMERA` - Cámara para fotos
- `READ_EXTERNAL_STORAGE` - Leer galería
- `WRITE_EXTERNAL_STORAGE` - Guardar fotos

## Flujo de Uso

1. **Login** con credenciales de repartidor
2. **Ver pedidos asignados** del día
3. **Iniciar ruta** → Activa GPS tracking automático
4. **Marcar entregas**:
   - Tomar fotos de evidencia
   - Capturar nombre y firma del receptor
   - Marcar como Entregado o No Entregado
5. **GPS envía ubicación cada 15 segundos** mientras está en ruta
6. **Sincronización automática** con backend

## Endpoints del Backend

La app consume estos endpoints (definidos en `repartidorApi.js`):

### Autenticación
- `POST /api/usuarios/login` - Login

### Pedidos
- `GET /api/pedidos/repartidor/{id}/hoy` - Pedidos de hoy
- `GET /api/pedidos/{id}/boleta` - Detalle de pedido

### Rastreo GPS
- `POST /api/rastreo/ubicacion` - Enviar ubicación
- `POST /api/rastreo/recorrido/iniciar/{id}` - Iniciar recorrido
- `POST /api/rastreo/recorrido/finalizar/{id}` - Finalizar recorrido

### Entregas
- `POST /api/rastreo/intento-entrega` - Registrar entrega/no entrega
- `GET /api/rastreo/intento-entrega/pedido/{id}` - Historial de intentos

## Troubleshooting

### Error de conexión al backend

```
Error: Network request failed
```

**Solución**:
- Verifica que tu IP en `api.js` sea correcta
- Asegúrate de que el backend esté corriendo
- En emulador Android, usa `http://10.0.2.2:8080` en lugar de `localhost`

### GPS no funciona

**Solución**:
- Verifica permisos de ubicación en configuración del dispositivo
- En emulador, envía coordenadas mock desde Android Studio
- Revisa que `enabled={true}` en `useGeolocation`

### Fotos no se capturan

**Solución**:
- Verifica permisos de cámara
- En emulador, configura cámara virtual en Android Studio
- Prueba en dispositivo físico

## Mejoras Futuras

- [ ] Upload real de fotos a S3/Firebase Storage
- [ ] Firma digital con canvas
- [ ] Mapas con ruta optimizada
- [ ] Notificaciones push
- [ ] Modo offline con sincronización posterior
- [ ] Estadísticas del repartidor
- [ ] Chat con soporte

## Soporte

Para reportar bugs o solicitar features, crear un issue en el repositorio.

## Licencia

Propietario - Mendiola Logistics Platform © 2026
