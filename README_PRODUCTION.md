# Mendiola Logistics - App Móvil Nativa 📱

<div align="center">
  <h3>Control de Entregas en Tiempo Real</h3>
  <p>App móvil para repartidores y administradores de Mendiola Logistics Platform</p>

  ![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
  ![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)
  ![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB.svg)
  ![Expo](https://img.shields.io/badge/Expo-~54.0.33-000020.svg)
</div>

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Stack Tecnológico](#️-stack-tecnológico)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Desarrollo](#-desarrollo)
- [Build y Publicación](#-build-y-publicación)
- [Arquitectura](#️-arquitectura)
- [Documentación](#-documentación)
- [Contribución](#-contribución)

---

## ✨ Características

### 🚚 Para Repartidores
- **Rastreo GPS en tiempo real** - Ubicación cada 15 segundos durante rutas activas
- **Gestión de pedidos** - Ver, filtrar y gestionar entregas del día
- **Evidencia digital** - Captura múltiples fotos + firma digital del receptor
- **Navegación optimizada** - Integración con Google Maps para rutas eficientes
- **Chat en tiempo real** - Comunicación directa con administradores
- **Estadísticas personales** - Dashboard con métricas de desempeño
- **Modo offline** - Funcionamiento con conectividad limitada

### 👨‍💼 Para Administradores
- **Monitoreo en vivo** - Ver ubicación de todos los repartidores en tiempo real
- **Gestión de pedidos** - Asignar, reasignar y monitorear entregas
- **Dashboard de analíticas** - Métricas, gráficos y reportes en tiempo real
- **Scanner OCR** - Lectura automática de etiquetas de cajas con ML Kit
- **Chat multiusuario** - Mensajería con repartidores y anuncios broadcast
- **Gestión de incidencias** - Seguimiento de intentos fallidos y resolución

---

## 🛠️ Stack Tecnológico

### Core
- **Framework:** Expo SDK ~54.0.33
- **Runtime:** React Native 0.81.5
- **Language:** JavaScript (React 19.1.0)
- **State Management:** React Context API + Hooks

### Navegación y UI
- **Navegación:** React Navigation 7.x (Stack + Tab navigators)
- **Animaciones:** React Native Reanimated 4.1.1
- **Gestures:** React Native Gesture Handler 2.28.0
- **Iconos:** Lucide React Native 1.16.0
- **Fonts:** Montserrat + Manrope (Google Fonts)

### Mapas y Localización
- **Maps:** react-native-maps 1.20.1 (Google Maps nativos)
- **Location:** expo-location 19.0.8
- **Routing:** Integración con OSRM para optimización de rutas

### Media y Captura
- **Cámara:** expo-camera 17.0.10
- **OCR:** vision-camera-ocr 1.0.0 + Google ML Kit
- **Image Picking:** expo-image-picker 17.0.10
- **Image Manipulation:** expo-image-manipulator 14.0.8
- **Signature:** react-native-signature-canvas 5.0.2

### Comunicación
- **WebSocket:** STOMP over WebSocket para real-time
- **HTTP Client:** Fetch API con wrapper custom
- **Push Notifications:** expo-notifications 0.32.17

### Almacenamiento y Seguridad
- **Secure Storage:** expo-secure-store 14.2.3 (JWT tokens)
- **Async Storage:** @react-native-async-storage/async-storage 2.2.0
- **Authentication:** JWT con refresh automático

### Testing y Quality
- **Testing Framework:** Jest 29.7.0
- **Coverage:** Minimum 40% (configurado en package.json)

---

## 📸 Capturas de Pantalla

> **Nota:** Las capturas de pantalla estarán disponibles en `/assets/store/screenshots/` después de generarlas según `ASSETS_GUIDE.md`

| MapScreen | OrdersScreen | DeliveryScreen | StatsScreen |
|-----------|--------------|----------------|-------------|
| ![Map](./docs/screenshots/map.png) | ![Orders](./docs/screenshots/orders.png) | ![Delivery](./docs/screenshots/delivery.png) | ![Stats](./docs/screenshots/stats.png) |

---

## 🚀 Instalación

### Pre-requisitos

```bash
# Verificar versiones
node --version  # >= 18.0.0
npm --version   # >= 9.0.0
```

### Instalación de Herramientas

```bash
# Instalar Expo CLI y EAS CLI globalmente
npm install -g expo-cli eas-cli

# Verificar instalación
expo --version
eas --version
```

### Clonar Proyecto

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/amy-mobile.git
cd amy-mobile

# Instalar dependencias
npm install
```

---

## ⚙️ Configuración

### 1. Variables de Entorno

```bash
# Crear archivo .env desde el template
cp .env.example .env

# Editar con tus valores
nano .env
```

**Contenido de .env:**
```env
# Entorno (development, staging, production)
APP_ENV=development

# URL del backend API
API_BASE_URL=http://192.168.0.14:8080

# Google Maps API Key
GOOGLE_MAPS_API_KEY=tu_google_maps_api_key_aqui
```

### 2. Obtener Google Maps API Key

1. Ir a: https://console.cloud.google.com/apis/credentials
2. Crear nuevo proyecto o seleccionar existente
3. "Crear credenciales" > "Clave de API"
4. Restringir la API key:
   - **Android:** Agregar SHA-1 de tu keystore
   - **iOS:** Agregar Bundle ID: `com.amybusiness.delivery`
5. Habilitar APIs necesarias:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Geocoding API
   - Directions API

### 3. Configurar Backend

Asegúrate de que tu backend esté corriendo en la URL configurada:

```bash
# Verificar conectividad
curl http://192.168.0.14:8080/api/usuarios/login

# Debería retornar: {"error": "Method not allowed"} o similar
```

---

## 💻 Desarrollo

### Iniciar Servidor de Desarrollo

```bash
# Iniciar Expo Dev Server
npm start

# O con modo específico:
npm run android    # Abrir en emulador Android
npm run ios        # Abrir en simulador iOS
npm run web        # Abrir en navegador
```

### Probar en Dispositivo Físico

#### Opción A: Expo Go (Desarrollo rápido)

1. Instalar **Expo Go** desde Play Store o App Store
2. Escanear QR code del terminal
3. La app se abre automáticamente

**Limitaciones:** No funciona con módulos nativos custom (vision-camera-ocr)

#### Opción B: Development Build (Recomendado)

```bash
# Crear development build
eas build --profile development --platform android

# Instalar el .apk en tu dispositivo
# Abrir la app y presionar "Enter URL manually"
# Pegar la URL del dev server (ej: exp://192.168.0.14:8081)
```

### Estructura de Carpetas

```
amy-mobile/
├── src/
│   ├── screens/           # Pantallas principales
│   │   ├── auth/          # Login, Onboarding
│   │   ├── repartidor/    # Pantallas de repartidor
│   │   ├── admin/         # Pantallas de admin
│   │   └── chat/          # Chat screens
│   ├── components/        # Componentes reutilizables
│   │   ├── repartidor/    # Componentes UI repartidor
│   │   ├── chat/          # Componentes de chat
│   │   └── SafeScreen.js  # Wrapper con SafeAreaView
│   ├── services/          # Servicios de API
│   │   ├── repartidorApi.js
│   │   ├── adminApi.js
│   │   └── chatRealtimeService.js
│   ├── hooks/             # Custom hooks
│   │   ├── useGeolocation.js
│   │   └── useChatInbox.js
│   ├── contexts/          # React Contexts
│   │   ├── AuthContext.js
│   │   └── AnnouncementContext.js
│   ├── config/            # Configuración
│   │   ├── api.js
│   │   └── s3Config.js
│   ├── theme/             # Estilos y temas
│   │   ├── repartidorTheme.js
│   │   └── mapStyles.js
│   └── utils/             # Utilidades
│       ├── platformStyles.js  # Estilos cross-platform
│       └── secureStorage.js
├── assets/                # Assets estáticos
│   ├── icon.png
│   ├── splash-icon.png
│   └── store/            # Assets para tiendas (crear)
├── app.config.js         # Configuración de Expo
├── eas.json              # Configuración de EAS Build
├── .env                  # Variables de entorno
└── package.json

```

### Scripts Disponibles

```bash
# Desarrollo
npm start              # Iniciar dev server
npm run android        # Abrir en Android
npm run ios            # Abrir en iOS

# Testing
npm test               # Ejecutar tests
npm run test:watch     # Modo watch
npm run test:coverage  # Con coverage

# Linting
npm run lint           # (si está configurado)
```

---

## 📦 Build y Publicación

### Guías Completas

Para instrucciones detalladas de build y publicación, consulta:

- **[BUILD_AND_PUBLISH_GUIDE.md](./BUILD_AND_PUBLISH_GUIDE.md)** - Guía completa paso a paso
- **[ASSETS_GUIDE.md](./ASSETS_GUIDE.md)** - Crear assets para las tiendas
- **[PRIVACY_POLICY.md](./PRIVACY_POLICY.md)** - Política de privacidad
- **[TERMS_OF_SERVICE.md](./TERMS_OF_SERVICE.md)** - Términos de servicio

### Build Rápido

```bash
# Login en EAS
eas login

# Build para Android (Play Store)
eas build --platform android --profile production

# Build para iOS (App Store)
eas build --platform ios --profile production

# Submit a tiendas (después de build)
eas submit --platform android --latest
eas submit --platform ios --latest
```

### Configuración de Builds (eas.json)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" }
    },
    "production": {
      "autoIncrement": true,
      "android": { "buildType": "app-bundle" }
    }
  }
}
```

---

## 🏗️ Arquitectura

### Flujo de Autenticación

```
LoginScreen → AuthContext.login()
           → authApi.login(username, password)
           → Backend JWT Token
           → SecureStore.save('token')
           → Navigate según rol (ADMIN/REPARTIDOR)
```

### Flujo de Rastreo GPS

```
RepartidorMainScreen → useGeolocation hook
                    → Cada 15 segundos (si en ruta)
                    → repartidorApi.enviarUbicacion()
                    → Backend guarda en DB
                    → WebSocket broadcast a admins
                    → Admins ven en mapa en tiempo real
```

### Flujo de Entrega con Evidencia

```
OrdersScreen → Seleccionar pedido → PaqueteDetalleScreen
           → Capturar fotos (expo-image-picker)
           → Capturar firma (signature-canvas)
           → Datos del receptor
           → repartidorApi.registrarIntento()
           → Upload fotos a S3
           → Backend actualiza estado
           → WebSocket notifica a admin
           → DeliverySuccessScreen (animación)
```

### Comunicación Real-time

```
WebSocket (STOMP):
- /topic/rastreo → Ubicaciones GPS
- /topic/pedido/actualizado → Cambios de estado
- /topic/conversations/{id} → Mensajes de chat
- /topic/announcements → Anuncios broadcast
```

---

## 📚 Documentación

### Documentación del Proyecto

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Arquitectura detallada (si existe)
- **[BUILD_AND_PUBLISH_GUIDE.md](./BUILD_AND_PUBLISH_GUIDE.md)** - Guía de publicación
- **[ASSETS_GUIDE.md](./ASSETS_GUIDE.md)** - Assets para tiendas
- **[PRIVACY_POLICY.md](./PRIVACY_POLICY.md)** - Política de privacidad
- **[TERMS_OF_SERVICE.md](./TERMS_OF_SERVICE.md)** - Términos de servicio

### Documentación Externa

- [Expo Documentation](https://docs.expo.dev)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [EAS Build & Submit](https://docs.expo.dev/build/introduction/)

### API Backend

Ver documentación del backend en:
`/Users/tonyprado/Documents/Proyectos/AMYBUSINESS/controlDeMinutasAPI/README.md`

**Endpoints principales:**
```
POST   /api/usuarios/login
GET    /api/pedidos/repartidor/{id}/hoy
POST   /api/rastreo/ubicacion
POST   /api/rastreo/intento-entrega
GET    /api/rastreo/intento-entrega/pedido/{id}
```

---

## 🤝 Contribución

### Flujo de Trabajo

1. Crear branch desde `main`:
   ```bash
   git checkout -b feature/nueva-funcionalidad
   ```

2. Hacer cambios y commits:
   ```bash
   git add .
   git commit -m "feat: agregar nueva funcionalidad"
   ```

3. Push y crear Pull Request:
   ```bash
   git push origin feature/nueva-funcionalidad
   ```

### Convenciones de Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: nueva funcionalidad
fix: corrección de bug
docs: cambios en documentación
style: formateo de código
refactor: refactorización
test: agregar tests
chore: tareas de mantenimiento
```

### Estándares de Código

- **ESLint:** Configurado en `.eslintrc.js` (si existe)
- **Prettier:** Para formateo automático
- **Componentes:** PascalCase (`MapScreen.js`)
- **Funciones:** camelCase (`enviarUbicacion()`)
- **Constantes:** UPPER_SNAKE_CASE (`API_BASE_URL`)

---

## 📱 Plataformas y Compatibilidad

### Android
- **Versión mínima:** Android 6.0 (API 23)
- **Versión target:** Android 14 (API 34)
- **Arquitecturas:** armeabi-v7a, arm64-v8a, x86_64

### iOS
- **Versión mínima:** iOS 15.1
- **Dispositivos:** iPhone 8 y posteriores
- **Arquitecturas:** arm64

### Cross-Platform Features

La app usa `platformStyles.js` para adaptar UI según plataforma:
- **Shadows:** iOS (shadowOffset) vs Android (elevation)
- **Status Bar:** Manejo diferente por plataforma
- **Safe Areas:** Notch de iPhone, navigation bars de Android
- **Font Rendering:** Ajuste de tamaños para renderizado diferente

---

## 🔐 Seguridad

### Medidas Implementadas

- ✅ **JWT Authentication:** Tokens con expiración de 24 horas
- ✅ **Secure Storage:** Tokens en expo-secure-store (Keychain/Keystore)
- ✅ **HTTPS Only:** Todas las comunicaciones encriptadas
- ✅ **API Key Protection:** Google Maps API key en variables de entorno
- ✅ **Input Validation:** Validación de todos los inputs de usuario
- ✅ **Rate Limiting:** Manejo de rate limits del backend

### Mejores Prácticas

```javascript
// ✅ BIEN: Token en SecureStore
await SecureStore.setItemAsync('token', jwt);

// ❌ MAL: Token en AsyncStorage
await AsyncStorage.setItem('token', jwt);

// ✅ BIEN: API key desde env
const API_KEY = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY;

// ❌ MAL: API key hardcoded
const API_KEY = "AIzaSy...";
```

---

## 🐛 Troubleshooting

### Problemas Comunes

#### 1. "Unable to connect to backend"

```bash
# Verificar que el backend esté corriendo
curl http://192.168.0.14:8080/api/usuarios/login

# Verificar firewall
# Asegúrate de que el puerto 8080 esté abierto

# Verificar .env
cat .env  # Debe tener API_BASE_URL correcta
```

#### 2. "Google Maps no se muestra"

```bash
# Verificar API key
echo $GOOGLE_MAPS_API_KEY

# Verificar que esté habilitada en Google Cloud Console
# Maps SDK for Android + Maps SDK for iOS

# Verificar restricciones de API key
# Debe permitir tu package name + SHA-1
```

#### 3. "Location permissions denied"

```
# Android: Ir a Settings > Apps > AMY Delivery > Permissions
# iOS: Settings > Privacy & Security > Location Services > AMY Delivery

# Asegúrate de seleccionar "Always" para background tracking
```

#### 4. "Build fails en EAS"

```bash
# Ver logs completos
eas build:list
eas build:view [BUILD_ID]

# Verificar dependencias
npm install

# Limpiar caché
npm run clean  # (si existe script)
expo start --clear
```

---

## 📊 Performance

### Métricas Target

- **Tiempo de inicio:** < 3 segundos
- **Framerate:** 60 FPS en navegación
- **Memory usage:** < 200 MB
- **Battery drain:** < 5% por hora (con GPS activo)
- **App size:** < 50 MB

### Optimizaciones Implementadas

- ✅ **Lazy Loading:** Pantallas cargadas bajo demanda
- ✅ **Image Compression:** Fotos comprimidas antes de upload
- ✅ **GPS Throttling:** Solo cada 15 segundos (no continuo)
- ✅ **WebSocket Reconnection:** Manejo inteligente de reconexión
- ✅ **Memoization:** useMemo/useCallback donde corresponde

---

## 📄 Licencia

Copyright © 2026 AMY Business. Todos los derechos reservados.

Este software es propiedad de AMY Business y está protegido por leyes de propiedad intelectual.
No se permite su distribución, modificación o uso comercial sin autorización expresa.

---

## 📞 Contacto y Soporte

**AMY Business**
- **Email:** soporte@amybusiness.com
- **Teléfono:** +52 (81) XXXX-XXXX
- **Ubicación:** Monterrey, Nuevo León, México

**Desarrollador:**
- Tony Prado / Marco
- GitHub: [@tu-usuario](https://github.com/tu-usuario)

**Reportar Issues:**
- GitHub Issues: [amy-mobile/issues](https://github.com/tu-usuario/amy-mobile/issues)
- Email: soporte@amybusiness.com

---

## 🎯 Roadmap

### v1.1.0 (Próxima)
- [ ] Modo offline completo
- [ ] Sincronización diferida de evidencias
- [ ] Optimización de consumo de batería
- [ ] Dark mode

### v1.2.0
- [ ] Soporte multiidioma (Inglés)
- [ ] Reconocimiento de voz para notas
- [ ] Integración con Waze
- [ ] Widget de Android

### v2.0.0
- [ ] Rediseño de UI
- [ ] Machine Learning para predicción de tiempos
- [ ] Integración con sistemas ERP externos
- [ ] API pública para integraciones

---

<div align="center">
  <p>Hecho con ❤️ por AMY Business</p>
  <p>
    <a href="./BUILD_AND_PUBLISH_GUIDE.md">Guía de Publicación</a> •
    <a href="./PRIVACY_POLICY.md">Privacidad</a> •
    <a href="./TERMS_OF_SERVICE.md">Términos</a>
  </p>
</div>
