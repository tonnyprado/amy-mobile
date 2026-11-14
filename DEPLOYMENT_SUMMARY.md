# Resumen de Configuración de Deployment

## Archivos Creados

1. `.github/workflows/build-and-deploy.yml` - GitHub Actions workflow para builds automáticos
2. `DISTRIBUTION_GUIDE.md` - Guía completa de distribución

## Configuración ya Existente

- `eas.json` - Ya configurado con perfiles de build correcto

## Pasos para Activar Distribución Automática

### 1. Instalar EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login en Expo

```bash
eas login
```

### 3. Obtener Token de Expo

```bash
# Ver tu usuario
eas whoami

# Genera un token en: https://expo.dev/settings/access-tokens
```

### 4. Configurar GitHub Secret

1. Ve a: https://github.com/[tu-usuario]/amy-mobile/settings/secrets/actions
2. Click en "New repository secret"
3. Name: `EXPO_TOKEN`
4. Value: [pega el token del paso 3]
5. Click "Add secret"

### 5. Crear tu Primer Release

```bash
# Actualizar versión en app.json si es necesario

# Hacer commit
git add .
git commit -m "Setup automatic builds"
git push origin main

# Crear tag de versión
git tag v1.0.0
git push origin v1.0.0
```

### 6. Monitorear el Build

1. Ve a: https://github.com/[tu-usuario]/amy-mobile/actions
2. Verás el workflow "Build and Deploy APK/IPA" corriendo
3. Cuando termine, el APK estará en:
   - Releases: https://github.com/[tu-usuario]/amy-mobile/releases
   - Actions Artifacts (30 días)

### 7. Distribuir APK a Repartidores

El link de descarga será:
```
https://github.com/[tu-usuario]/amy-mobile/releases/latest/download/amy-repartidor.apk
```

Opciones para compartir:

#### A. Link Directo
Comparte el link por WhatsApp/Email

#### B. QR Code
Genera QR en: https://www.qr-code-generator.com/
Ingresa el link del APK

#### C. Página Web
Usa GitHub Pages con el HTML de ejemplo en `DISTRIBUTION_GUIDE.md`

## Builds Manuales Locales

### Android APK

```bash
# Preview build (internal distribution)
eas build --platform android --profile preview

# Production build (app bundle para Play Store)
eas build --platform android --profile production
```

### iOS IPA

```bash
# Preview build (ad-hoc, hasta 100 dispositivos)
eas build --platform ios --profile preview

# Production build (para App Store/TestFlight)
eas build --platform ios --profile production
```

## TestFlight para iOS (Beta Testing)

### Setup Inicial

1. Crea app en App Store Connect: https://appstoreconnect.apple.com
2. Configura credenciales:
```bash
eas credentials
```

3. Build para TestFlight:
```bash
eas build --platform ios --profile production
```

4. Submit:
```bash
eas submit --platform ios
```

5. Invita testers en App Store Connect > TestFlight

## Actualizaciones Over-The-Air (OTA)

Para updates de JS sin rebuild:

```bash
# Instalar expo-updates si no está
npx expo install expo-updates

# Publicar update
eas update --branch production --message "Descripción del cambio"
```

Los repartidores recibirán el update automáticamente al abrir la app.

## Comandos Útiles

```bash
# Ver lista de builds
eas build:list

# Descargar último build
eas build:download --platform android --latest

# Ver detalles de build
eas build:view [BUILD_ID]

# Submit a stores
eas submit --platform android
eas submit --platform ios
```

## Costos

### Opción 1: Free Tier
- 30 builds/mes gratis
- Suficiente para desarrollo y testing

### Opción 2: Production Plan
- $29/mes
- Builds ilimitados
- Priority builds
- Recomendado cuando tengas más repartidores

### Store Fees
- Apple Developer: $99/año (requerido para iOS)
- Google Play: $25 una sola vez (solo si subes a Play Store)

## Alternativa: Distribución Sin Stores

### Android
1. GitHub Releases (gratis)
2. Link directo del APK
3. No requiere Google Play Developer

### iOS
1. TestFlight (gratis, 10,000 testers)
2. Requiere Apple Developer ($99/año)
3. Ad-Hoc (máximo 100 dispositivos)

## Solución Temporal Recomendada

**Para Android:**
- Usa GitHub Releases con APK directo
- Comparte link/QR a repartidores
- Sin costo adicional

**Para iOS:**
- Usa TestFlight
- Invita a repartidores por email
- $99/año Apple Developer

**Cuando tengas más usuarios:**
- Sube a Google Play Store
- Sube a App Store
- Distribución oficial

## Próximos Pasos

1. Configura `EXPO_TOKEN` en GitHub Secrets
2. Haz push con tag para primer build
3. Espera ~15-20 min para el build
4. Descarga APK de GitHub Releases
5. Comparte link con repartidores
6. Para iOS, configura TestFlight

## Referencias

- Guía completa: `DISTRIBUTION_GUIDE.md`
- EAS Docs: https://docs.expo.dev/build/introduction/
- GitHub Actions: https://docs.github.com/actions
