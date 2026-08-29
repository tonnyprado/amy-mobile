# Estado del Proyecto AMY Mobile

**Fecha:** 29 de Agosto 2026
**Backend:** https://amy-backend-minutaapi.onrender.com (AWS RDS + S3)

---

## Resumen de la Sesión

Migramos el backend de Railway a AWS (RDS + S3) y estamos preparando la app móvil para su publicación en las tiendas mientras los repartidores usan la versión web mobile-first como alternativa temporal.

---

## Cambios Realizados Hoy

### 1. Backend y API
- [x] Migración completa a AWS RDS y S3
- [x] Backend desplegado en Render: `amy-backend-minutaapi.onrender.com`

### 2. amy-platform (Web)
- [x] Rediseño de `RepartidorPanel` con layout mobile-first sin sidebar
- [x] Panel de detalle como bottom sheet modal deslizable
- [x] Experiencia táctil tipo app móvil para repartidores en web
- [x] En desktop se muestra centrado simulando un teléfono (430px)
- [x] Corrección de campos faltantes en `repartidorApi.js`:
  - `nombreReceptor`
  - `recibidoPor`
  - `subtipoAviso`

### 3. amy-mobile (App)
- [x] Agregar `amy-backend-minutaapi.onrender.com` a hosts autorizados en `networkSecurity.js`
- [x] Cambiar `USE_HTTPS_IN_DEV = true` para usar Render
- [x] Corrección de campos faltantes en `repartidorApi.js`:
  - `subtipoAviso`
  - `fotoMapaUrl`
  - `fotoLlamadaUrl`
  - `mensajesAdicionales`
- [x] Rediseño de `DriverWarningBanner` con tema violet (sin emojis, estilo consistente)
- [x] Eliminar subtítulos numerados de pantallas admin ("01 — OPERACIÓN DE HOY", etc.)
- [x] Agregar `deploymentTarget: "15.1"` en app.json para ML Kit

---

## Pendiente por Hacer

### Prioritario: Build iOS
1. **Actualizar macOS** - Necesario para instalar Xcode más reciente
2. **Instalar Xcode** - Requerido para `npx expo run:ios`
3. **Ejecutar build local:**
   ```bash
   cd /Users/tonyprado/Documents/Proyectos/AMYBUSINESS/amy-mobile
   npx expo run:ios
   ```

### Para Publicar en Tiendas

#### iOS (Apple App Store)
- [ ] Cuenta Apple Developer ($99 USD/año)
- [ ] Build con EAS: `eas build --platform ios`
- [ ] Subir a TestFlight para pruebas
- [ ] Enviar a revisión de App Store

#### Android (Google Play Store)
- [ ] Cuenta Google Play ($25 USD único)
- [ ] Build con EAS: `eas build --platform android`
- [ ] Subir APK/AAB a Play Console
- [ ] Enviar a revisión

### Mientras tanto: Versión Web
Los repartidores pueden usar la versión web mobile-first desde:
```
https://[tu-dominio-vercel]/login
```
Iniciar sesión como repartidor y usar desde el navegador del celular.

---

## Archivos Clave Modificados

### amy-platform
- `src/pages/RepartidorView/RepartidorPanel.jsx`
- `src/pages/RepartidorView/RepartidorPanel.css`
- `src/pages/RepartidorView/components/ListaPaquetes.jsx`
- `src/pages/RepartidorView/components/ListaPaquetes.css`
- `src/services/repartidorApi.js`

### amy-mobile
- `src/config/api.js` - URL de backend
- `src/utils/networkSecurity.js` - Hosts autorizados
- `src/services/repartidorApi.js` - Campos de intento de entrega
- `src/components/DriverWarningBanner.js` - Rediseño modal
- `src/admin/screens/StatsScreen.js` - Sin subtítulo
- `src/admin/screens/MonitoreoScreen.js` - Sin subtítulo
- `src/admin/screens/RepartidoresScreen.js` - Sin subtítulo
- `src/admin/screens/ChatListScreen.js` - Sin subtítulo
- `app.json` - iOS deploymentTarget 15.1

---

## Comandos Útiles

```bash
# Iniciar app móvil (Expo Go - limitado)
cd amy-mobile
npx expo start

# Build iOS local (requiere Xcode)
npx expo run:ios

# Build Android local
npx expo run:android

# Build con EAS (cloud)
eas build --platform ios
eas build --platform android

# Limpiar caché
npx expo start --clear
```

---

## Notas Importantes

1. **Expo Go tiene limitaciones** - La cámara avanzada y ML Kit no funcionan. Necesitas build nativo.

2. **ML Kit requiere iOS 15.1+** - Ya configurado en app.json

3. **Costos de publicación:**
   - Apple Developer: $99 USD/año
   - Google Play: $25 USD (único)

4. **Backend en Render** - Puede tener cold start de ~30s si no hay tráfico. El primer request puede tardar.

---

## Próximos Pasos Después del Reinicio

1. Terminar de actualizar macOS
2. Instalar Xcode desde App Store
3. Ejecutar `npx expo run:ios`
4. Probar la app completa en simulador o dispositivo
5. Si todo funciona, hacer build para tiendas
