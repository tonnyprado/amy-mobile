# Guía de Distribución de APK/IPA

## Configuración Inicial

### 1. Instalar EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login en Expo

```bash
eas login
```

### 3. Configurar el Proyecto

```bash
cd /Users/tonyprado/Documents/Proyectos/AMYBUSINESS/amy-mobile
eas build:configure
```

### 4. Obtener Token de Expo

```bash
eas whoami
# Luego genera un token en: https://expo.dev/accounts/[username]/settings/access-tokens
```

### 5. Configurar Secretos de GitHub

Ve a tu repositorio: Settings > Secrets and variables > Actions

Agrega:
- `EXPO_TOKEN`: El token generado en el paso anterior

## Distribución Android (APK)

### Opción 1: Build Manual Local

```bash
# Build APK para distribución interna
eas build --platform android --profile preview

# El comando te dará un link para descargar el APK cuando termine
# Ejemplo: https://expo.dev/accounts/[usuario]/projects/amy-mobile/builds/[build-id]
```

### Opción 2: Build Automático con GitHub Actions

1. Push a la rama `main` o `production`:
```bash
git add .
git commit -m "Nueva versión"
git push origin main
```

2. El APK se generará automáticamente y estará disponible en:
   - GitHub Actions Artifacts (30 días)
   - GitHub Releases (si haces un tag)

### Opción 3: GitHub Release con Tag

```bash
# Crear un tag de versión
git tag v1.0.0
git push origin v1.0.0

# Esto disparará el build y creará un Release en GitHub con el APK adjunto
```

### Distribución del APK

#### A. Link Directo de GitHub Release

```
https://github.com/[usuario]/[repo]/releases/latest/download/amy-repartidor.apk
```

Los repartidores pueden:
1. Abrir el link en su teléfono Android
2. Permitir instalación de fuentes desconocidas (Settings > Security)
3. Instalar el APK

#### B. QR Code para Descargar

Genera un QR code con el link del APK:

```
https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://github.com/[usuario]/[repo]/releases/latest/download/amy-repartidor.apk
```

Imprime el QR o compártelo por WhatsApp.

#### C. Página Web de Descarga

Crea un archivo `index.html` en el repo:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Descargar AMY Repartidor</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: Arial, sans-serif;
            text-align: center;
            padding: 50px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            background: white;
            color: #333;
            padding: 30px;
            border-radius: 10px;
            max-width: 400px;
            margin: 0 auto;
        }
        .download-btn {
            background: #667eea;
            color: white;
            padding: 15px 30px;
            border: none;
            border-radius: 5px;
            font-size: 18px;
            cursor: pointer;
            text-decoration: none;
            display: inline-block;
            margin-top: 20px;
        }
        .qr-code {
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>AMY Repartidor</h1>
        <p>Versión 1.0.0</p>

        <div class="qr-code">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://github.com/[usuario]/[repo]/releases/latest/download/amy-repartidor.apk" alt="QR Code">
        </div>

        <a href="https://github.com/[usuario]/[repo]/releases/latest/download/amy-repartidor.apk" class="download-btn">
            Descargar para Android
        </a>

        <p style="margin-top: 20px; font-size: 14px; color: #666;">
            Solo dispositivos Android. Se requiere habilitar instalación de fuentes desconocidas.
        </p>
    </div>
</body>
</html>
```

Activa GitHub Pages en el repo y tendrás una URL tipo:
```
https://[usuario].github.io/[repo]/
```

## Distribución iOS (IPA)

### Opción 1: TestFlight (Recomendado para Beta)

#### Configuración Inicial

1. **Crear App en App Store Connect**
   - Ve a https://appstoreconnect.apple.com
   - Apps > + > Nueva App
   - Llena los datos básicos

2. **Configurar Credenciales**

```bash
# Genera credenciales con EAS
eas credentials

# Selecciona:
# - iOS
# - Distribution Certificate
# - Provisioning Profile (Ad Hoc o App Store)
```

3. **Build para TestFlight**

```bash
eas build --platform ios --profile production
```

4. **Submit a TestFlight**

```bash
eas submit --platform ios
```

#### Invitar Testers

1. App Store Connect > TestFlight > Testers
2. Agregar External Testers (hasta 10,000 usuarios)
3. Los repartidores recibirán invitación por email
4. Instalan TestFlight desde App Store
5. Aceptan invitación y descargan la app

### Opción 2: Ad-Hoc Distribution (Sin TestFlight)

```bash
# Build Ad-Hoc (hasta 100 dispositivos)
eas build --platform ios --profile preview
```

**Limitaciones:**
- Debes registrar UDIDs de dispositivos en Apple Developer
- Máximo 100 dispositivos por año
- Requiere instalación manual vía Xcode/Apple Configurator

## Actualización de Versiones

### 1. Actualizar Versión en app.json

```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    },
    "ios": {
      "buildNumber": "2"
    }
  }
}
```

### 2. Build y Deploy

```bash
# Crear tag de versión
git tag v1.0.1
git push origin v1.0.1

# GitHub Actions automáticamente:
# - Hace build del APK/IPA
# - Crea un Release
# - Sube los archivos
```

## Over-The-Air (OTA) Updates

Para actualizaciones sin rebuild (solo JavaScript):

```bash
# Instalar expo-updates
npx expo install expo-updates

# Publicar update
eas update --branch production --message "Fix crítico"
```

Los usuarios recibirán la actualización automáticamente al abrir la app.

## Monitoreo de Distribución

### Ver Builds

```bash
eas build:list
```

### Ver Submissions

```bash
eas submit:list
```

### Logs de Build

```bash
eas build:view [BUILD_ID]
```

## Troubleshooting

### APK no se instala en Android

1. Verifica que "Instalar apps desconocidas" esté habilitado
2. Asegúrate que el APK sea compatible con la versión de Android
3. Revisa que no haya otra versión instalada con firma diferente

### Build falla en GitHub Actions

1. Verifica que `EXPO_TOKEN` esté configurado
2. Revisa logs en Actions tab
3. Asegúrate que eas.json esté en el repo

### TestFlight tarda en revisar

- Review de TestFlight: 1-2 días típicamente
- Mientras tanto, usa Ad-Hoc distribution

## Costos

- **Expo EAS Free**:
  - 30 builds/mes gratis
  - Suficiente para desarrollo

- **Expo EAS Production**:
  - $29/mes
  - Builds ilimitados
  - Priority support

- **Apple Developer**:
  - $99/año (requerido para iOS)

- **Google Play**:
  - $25 una sola vez (si subes a Play Store)

## Próximos Pasos

1. Configura GitHub Actions con tu EXPO_TOKEN
2. Haz un push para probar el build automático
3. Crea un tag para generar tu primer Release
4. Comparte el link del APK con repartidores
5. Para iOS, configura TestFlight

## Comandos Rápidos

```bash
# Build Android local
eas build --platform android --profile preview

# Build iOS local
eas build --platform ios --profile preview

# Submit a stores
eas submit --platform android
eas submit --platform ios

# Ver builds
eas build:list

# Download build
eas build:download --platform android --latest

# Update OTA
eas update --branch production
```

## Links Útiles

- EAS Build Docs: https://docs.expo.dev/build/introduction/
- EAS Submit Docs: https://docs.expo.dev/submit/introduction/
- TestFlight Docs: https://developer.apple.com/testflight/
- GitHub Actions: https://docs.github.com/actions
