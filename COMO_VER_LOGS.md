# Cómo ver logs del APK en dispositivo Android

## Pasos para ver logs:

### 1. Habilitar modo desarrollador en tu Android:
- Ve a **Configuración** > **Acerca del teléfono**
- Toca 7 veces en **Número de compilación**
- Verás un mensaje: "Ahora eres un desarrollador"

### 2. Habilitar depuración USB:
- Ve a **Configuración** > **Opciones de desarrollador**
- Activa **Depuración USB**

### 3. Conectar el dispositivo por USB a la computadora

### 4. Verificar que adb detecte el dispositivo:
```bash
adb devices
```
Deberías ver tu dispositivo en la lista.

### 5. Ver los logs en tiempo real:
```bash
# Limpiar logs anteriores
adb logcat -c

# Ver solo logs de la app
adb logcat | grep -E "ReactNativeJS|apiClient|authApi|=== API"
```

### 6. Abrir la app e intentar hacer login
Los logs aparecerán en la terminal mostrando:
- La configuración de API
- Las URLs que se están llamando
- Los errores si hay alguno

## Si no tienes adb instalado:

### En macOS:
```bash
brew install android-platform-tools
```

### En Windows:
Descarga Android Platform Tools de:
https://developer.android.com/studio/releases/platform-tools
