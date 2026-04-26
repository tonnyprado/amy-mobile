# Quick Start - AMY Delivery App

Guía rápida para empezar a desarrollar en minutos.

## 1. Instalación (5 min)

```bash
# Instalar dependencias
npm install

# Instalar Expo CLI globalmente (si no lo tienes)
npm install -g expo-cli
```

## 2. Configurar API (2 min)

Edita `src/config/api.js`:

```js
// Encuentra tu IP local:
// Mac/Linux: ifconfig | grep "inet "
// Windows: ipconfig

const DEV_API_URL = 'http://192.168.1.XXX:8080'; // Cambiar XXX por tu IP
const PROD_API_URL = 'https://tu-servidor.com'; // Tu servidor de producción
```

## 3. Ejecutar (1 min)

```bash
# Iniciar servidor
npm start

# O directamente en Android
npm run android
```

## 4. Probar en dispositivo (2 min)

### Opción A: Dispositivo físico (Recomendado)
1. Instala **Expo Go** desde Google Play
2. Escanea el código QR que aparece en la terminal
3. La app se cargará automáticamente

### Opción B: Emulador Android
1. Abre Android Studio
2. Inicia un emulador Android
3. Presiona `a` en la terminal de Expo

## Credenciales de Prueba

Si tu backend tiene datos de prueba:

```
Usuario: 0001 (o el ID de tu repartidor)
Contraseña: (la que configuraste en backend)
```

## Estructura Básica

```
src/
├── screens/          → Pantallas principales
├── components/       → Componentes reutilizables
├── services/         → APIs y llamadas al backend
├── hooks/            → Lógica reutilizable (GPS, etc)
└── contexts/         → Estado global (Auth, etc)
```

## Features Principales

✅ Login con autenticación
✅ Lista de pedidos del día
✅ GPS tracking automático
✅ Captura de fotos
✅ Marcar entregado/no entregado
✅ Sincronización en tiempo real

## Troubleshooting

### No conecta al backend
- Verifica que tu backend esté corriendo en `http://localhost:8080`
- Asegúrate de usar tu IP local, no `localhost`
- En emulador, usa `http://10.0.2.2:8080`

### GPS no funciona
- Acepta permisos de ubicación cuando la app lo solicite
- En emulador, envía coordenadas mock desde Android Studio

### App se crashea
```bash
# Limpiar caché
npm start -- --clear

# Reinstalar dependencias
rm -rf node_modules && npm install
```

## Siguientes Pasos

- [ ] Personalizar colores en `src/components/*.js`
- [ ] Agregar tu logo en `assets/icon.png`
- [ ] Configurar push notifications (opcional)
- [ ] Build APK para pruebas: `eas build --platform android --profile preview`

## Soporte

Revisa el `README.md` completo para documentación detallada.
