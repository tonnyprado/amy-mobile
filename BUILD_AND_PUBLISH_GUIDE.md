# Guía Completa: Build y Publicación de AMY Delivery

Esta guía te llevará paso a paso desde configurar tu entorno hasta publicar la app en Play Store y App Store.

---

## 📋 Pre-requisitos

### 1. Cuentas Necesarias
- [ ] Cuenta de Expo (gratis): https://expo.dev
- [ ] Google Play Console ($25 one-time): https://play.google.com/console
- [ ] Apple Developer Program ($99/año): https://developer.apple.com

### 2. Software Instalado
- [ ] Node.js 18+ (`node --version`)
- [ ] npm o yarn
- [ ] EAS CLI: `npm install -g eas-cli`
- [ ] Expo CLI: `npm install -g expo-cli`

### 3. Archivos Configurados
- [ ] `.env` creado desde `.env.example`
- [ ] `app.config.js` con tus valores
- [ ] `eas.json` configurado (✅ ya lo tienes)

---

## 🚀 PARTE 1: Configuración Inicial

### Paso 1: Clonar y Configurar Proyecto

```bash
# 1. Navegar al proyecto
cd /Users/tonyprado/Documents/Proyectos/AMYBUSINESS/amy-mobile

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env desde el template
cp .env.example .env

# 4. Editar .env con tus valores
nano .env
```

**Configurar .env:**
```bash
APP_ENV=production
API_BASE_URL=https://amy-backend-minutaapi.onrender.com
GOOGLE_MAPS_API_KEY=TU_API_KEY_AQUI
```

### Paso 2: Login en EAS

```bash
# Login en Expo
eas login

# Verificar que estás logueado
eas whoami
```

### Paso 3: Configurar Proyecto en EAS

```bash
# Configurar proyecto (si es primera vez)
eas build:configure

# Esto creará/actualizará eas.json (ya lo tienes configurado ✅)
```

---

## 🤖 PARTE 2: Build para Android (Play Store)

### Paso 1: Configurar Keystore (Primera vez)

```bash
# EAS generará un keystore automáticamente
eas credentials

# Seleccionar:
# 1. Android
# 2. production
# 3. Set up a new keystore
```

**IMPORTANTE:** Guarda el keystore en un lugar seguro. Lo necesitarás para todas las actualizaciones futuras.

### Paso 2: Build de Producción

```bash
# Build para Play Store (app bundle)
eas build --platform android --profile production

# Esto tardará 10-20 minutos
# Al finalizar, te dará una URL para descargar el .aab
```

**Qué hace este comando:**
- Compila tu código React Native
- Genera un Android App Bundle (.aab)
- Firma con tu keystore
- Sube a servidores de Expo
- Te da URL de descarga

### Paso 3: Descargar AAB

```bash
# Opción 1: Desde el navegador (abre la URL que te dio EAS)
# Opción 2: Desde CLI
eas build:list

# Descargar el más reciente
# Guardar en: ~/Downloads/amy-delivery-production.aab
```

### Paso 4: Probar en Dispositivo Real (Opcional)

```bash
# Build de preview (APK instalable)
eas build --platform android --profile preview

# Instalar en tu dispositivo:
# 1. Descargar APK desde URL de EAS
# 2. Transferir a Android
# 3. Instalar (habilita "Instalar apps desconocidas" en Settings)
```

---

## 🍎 PARTE 3: Build para iOS (App Store)

### Paso 1: Configurar Apple Developer Account

```bash
eas credentials

# Seleccionar:
# 1. iOS
# 2. production
# 3. Set up App Store Connect API Key
```

**Necesitas:**
- Apple ID con Developer Program activo
- App Store Connect API Key (genera en: https://appstoreconnect.apple.com/access/api)

### Paso 2: Build de Producción

```bash
# Build para App Store
eas build --platform ios --profile production

# Esto tardará 15-25 minutos
# Al finalizar, te dará una URL para descargar el .ipa
```

### Paso 3: Probar en Simulador (Opcional)

```bash
# Build para simulador (más rápido)
eas build --platform ios --profile development

# Abrir con:
xcrun simctl install booted ~/Downloads/amy-delivery.app
```

---

## 📦 PARTE 4: Publicar en Play Store

### Paso 1: Crear Listing en Play Console

1. Ir a: https://play.google.com/console
2. "Crear aplicación"
3. Completar información básica:
   - **Nombre:** AMY Delivery
   - **Idioma predeterminado:** Español (España)
   - **Tipo de app:** Aplicación
   - **Gratis o de pago:** Gratis

### Paso 2: Configurar Store Listing

**Detalles de la app:**
```
Nombre de la aplicación: AMY Delivery
Descripción breve (80 caracteres):
Control de entregas en tiempo real con rastreo GPS y evidencia digital

Descripción completa (4000 caracteres):
AMY Delivery es la solución completa para gestión de entregas de productos
de venta por catálogo. Diseñada para repartidores y administradores,
la app permite:

🚚 PARA REPARTIDORES:
• Visualizar pedidos del día con mapa interactivo
• Navegación GPS con rutas optimizadas
• Registrar entregas con evidencia completa (fotos + firmas digitales)
• Rastreo automático de ubicación durante rutas activas
• Chat en tiempo real con administradores
• Estadísticas de desempeño personal

👨‍💼 PARA ADMINISTRADORES:
• Monitoreo en vivo de todos los repartidores
• Asignación inteligente de pedidos
• Dashboard con métricas y analíticas
• Scanner OCR para cajas y etiquetas
• Gestión completa de entregas y reportes

CARACTERÍSTICAS DESTACADAS:
✅ Rastreo GPS en tiempo real cada 15 segundos
✅ Evidencia fotográfica con firma digital
✅ Optimización automática de rutas
✅ Notificaciones push instantáneas
✅ Historial completo de entregas
✅ Funciona con conexión limitada

SEGURIDAD Y PRIVACIDAD:
🔒 Encriptación end-to-end
🔒 Autenticación segura con JWT
🔒 Almacenamiento en la nube AWS
🔒 Cumplimiento con políticas de privacidad

Ideal para empresas de venta por catálogo tipo Avon, distribuidoras
de productos, y servicios de delivery que necesitan control total
sobre sus entregas.

Descarga AMY Delivery y profesionaliza tu servicio de entregas hoy mismo.
```

**Gráficos de la tienda:**
- Icon: `assets/icon.png` (512x512px)
- Feature Graphic: Crear según `ASSETS_GUIDE.md`
- Screenshots: Mínimo 2, según `ASSETS_GUIDE.md`

**Categorización:**
- Categoría: **Productividad**
- Etiquetas: delivery, entregas, logística, rastreo GPS

**Información de contacto:**
- Email: soporte@amybusiness.com
- Sitio web: (pendiente)
- Teléfono: +52 81 XXXX-XXXX

### Paso 3: Completar Contenido de la App

**Declaración de privacidad:**
- URL: Subir `PRIVACY_POLICY.md` a tu sitio web y poner el link
- O usar GitHub Pages: https://tu-usuario.github.io/amy-mobile/privacy-policy

**Clasificación de contenido:**
- Completar cuestionario (seleccionar "No" a violencia, lenguaje adulto, etc.)
- Resultado esperado: **PEGI 3 / Everyone**

### Paso 4: Configurar Versión de Prueba (Internal Testing)

```bash
# Opción A: Subir manualmente
# 1. Ir a "Versiones de prueba" > "Prueba interna"
# 2. "Crear nueva versión"
# 3. Subir amy-delivery-production.aab
# 4. Agregar notas de la versión
# 5. Guardar y revisar

# Opción B: Usar EAS Submit (recomendado)
eas submit --platform android --latest

# Esto sube automáticamente el último build a Play Console
```

**Notas de la versión:**
```
Versión 1.0.0 - Lanzamiento inicial

✨ Nuevas características:
• Rastreo GPS en tiempo real de repartidores
• Registro de entregas con evidencia fotográfica y firma digital
• Chat en tiempo real entre repartidores y administradores
• Scanner OCR para cajas y etiquetas
• Dashboard de estadísticas y analíticas
• Notificaciones push de nuevos pedidos
• Optimización de rutas de entrega
```

### Paso 5: Invitar Testers

```
1. "Prueba interna" > "Testers"
2. Crear lista de emails
3. Agregar emails de tu equipo (hasta 100 personas)
4. Guardar
```

Los testers recibirán un link para instalar desde Play Store.

### Paso 6: Publicar en Producción

Después de probar 1-2 semanas en internal testing:

```
1. Ir a "Producción"
2. "Crear nueva versión"
3. Subir el mismo .aab
4. Completar todos los requisitos (store listing, content rating, etc.)
5. Enviar para revisión
```

**Tiempo de revisión:** 1-7 días (usualmente 1-2 días)

---

## 🍏 PARTE 5: Publicar en App Store

### Paso 1: Crear App en App Store Connect

1. Ir a: https://appstoreconnect.apple.com
2. "Apps" > "+" > "Nueva app"
3. Completar:
   - **Plataforma:** iOS
   - **Nombre:** AMY Delivery
   - **Idioma principal:** Español (ES)
   - **Bundle ID:** com.amybusiness.delivery
   - **SKU:** amy-delivery-001
   - **Acceso completo:** Sí

### Paso 2: Configurar Información de la App

**General:**
- Nombre: AMY Delivery
- Subtítulo: Control de Entregas en Tiempo Real
- Categoría primaria: Productividad
- Categoría secundaria: Negocios

**Descripción:**
```
AMY Delivery es la solución completa para gestión de entregas de productos
de venta por catálogo. Diseñada para repartidores y administradores.

🚚 PARA REPARTIDORES:
• Pedidos del día con mapa interactivo
• Navegación GPS optimizada
• Evidencia con fotos + firmas digitales
• Rastreo automático de ubicación
• Chat en tiempo real
• Estadísticas personales

👨‍💼 PARA ADMINISTRADORES:
• Monitoreo en vivo
• Asignación de pedidos
• Dashboard de métricas
• Scanner OCR
• Gestión de entregas

✅ GPS cada 15 segundos
✅ Evidencia fotográfica
✅ Optimización de rutas
✅ Notificaciones push
✅ Seguridad end-to-end

Ideal para empresas de catálogo y servicios de delivery.
```

**Palabras clave (100 caracteres max):**
```
delivery,entregas,rastreo,GPS,logística,paquetes,evidencia,repartidor
```

**URL de soporte:** https://amybusiness.com/support (o tu sitio)
**URL de marketing:** https://amybusiness.com

### Paso 3: Subir Screenshots

Según `ASSETS_GUIDE.md`, necesitas screenshots para:
- iPhone 6.7" (1290x2796px)
- iPhone 6.5" (1242x2688px)
- iPhone 5.5" (1242x2208px)

**Orden recomendado:**
1. MapScreen con ruta activa
2. OrdersScreen con lista de pedidos
3. DeliverySuccessScreen con evidencia
4. StatsScreen con métricas
5. ChatScreen con conversación

### Paso 4: Subir Build con EAS

```bash
# Opción A: Subir manualmente desde .ipa
# 1. Descargar .ipa desde EAS
# 2. Usar Transporter app de Apple
# 3. Drag & drop del .ipa

# Opción B: Usar EAS Submit (recomendado)
eas submit --platform ios --latest

# Esto sube automáticamente a App Store Connect
```

### Paso 5: Completar Información de Versión

En App Store Connect:
```
1. Seleccionar el build que subiste
2. Agregar "Notas de la versión" (mismas que Android)
3. Información de copyright: © 2026 AMY Business
4. Calificación por edades: 4+
```

### Paso 6: Configurar Disponibilidad y Precios

- **Precio:** Gratis
- **Disponibilidad:** México (puedes agregar más países después)

### Paso 7: Información de Privacidad

- **URL de Política de Privacidad:** (link a PRIVACY_POLICY.md)
- **Permisos usados:**
  - ✅ Ubicación (rastreo de entregas)
  - ✅ Cámara (evidencia fotográfica)
  - ✅ Galería (selección de fotos)
  - ✅ Notificaciones (alertas)

### Paso 8: Información para Revisión de App

**Información de contacto:**
- Nombre: Tu Nombre
- Teléfono: +52 81 XXXX-XXXX
- Email: soporte@amybusiness.com

**Credenciales de demostración:**
```
Usuario de prueba (REPARTIDOR):
Username: demo_repartidor
Password: Demo123!

Usuario de prueba (ADMIN):
Username: demo_admin
Password: Admin123!
```

**IMPORTANTE:** Crea estos usuarios en tu backend antes de enviar.

**Notas para el revisor:**
```
Esta app es un sistema de gestión de entregas para empresas de venta
por catálogo. Tiene dos tipos de usuarios:

1. REPARTIDOR: Puede ver pedidos, registrar entregas con fotos y firmas,
   y usar navegación GPS.

2. ADMIN: Puede monitorear repartidores en tiempo real, asignar pedidos,
   y ver reportes.

Para probar:
- Login como REPARTIDOR (credenciales arriba)
- Ver lista de pedidos en la pestaña "Pedidos"
- Abrir mapa en pestaña "Mapa"
- Ver estadísticas en pestaña "Estadísticas"

El rastreo GPS funciona en modo simulado si no hay movimiento real.
```

### Paso 9: Enviar para Revisión

```
1. Verificar que TODO esté completo (✅ verde en todos los campos)
2. "Enviar para revisión"
3. Confirmar
```

**Tiempo de revisión:** 1-3 días (primera vez), 24-48 horas después

---

## 🔄 PARTE 6: Actualizaciones Futuras

### Incrementar Versión

```bash
# 1. Actualizar versión en app.config.js
# Cambiar: version: '1.0.0' -> '1.0.1'
# Android: Incrementar versionCode: 1 -> 2

# 2. Hacer commit de cambios
git add .
git commit -m "chore: bump version to 1.0.1"

# 3. Build nueva versión
eas build --platform android --profile production
eas build --platform ios --profile production

# 4. Submit a tiendas
eas submit --platform android --latest
eas submit --platform ios --latest
```

### OTA Updates (Over-The-Air)

Para cambios de JS/assets SIN rebuild nativo:

```bash
# 1. Publicar update
eas update --branch production --message "Fix de bug en login"

# Los usuarios recibirán el update automáticamente
# Sin necesidad de descargar nueva versión de la tienda
```

**Cuándo usar OTA:**
- Fixes de bugs en JS
- Cambios de texto/traducción
- Actualizaciones de estilos
- Cambios en lógica de negocio

**Cuándo hacer rebuild completo:**
- Cambios en permisos nativos
- Agregar librerías nativas nuevas
- Cambios en íconos/splash screen
- Cambios en versión de Expo SDK

---

## 📊 PARTE 7: Monitoreo Post-Launch

### Herramientas de Análisis

```bash
# 1. Instalar Sentry (crash reporting)
npm install @sentry/react-native

# 2. Configurar en app.config.js
# 3. Ver crashes en: https://sentry.io
```

### Métricas Importantes

**Play Console:**
- Instalaciones totales
- Calificaciones y reseñas
- Crashes y ANRs
- Tiempo de uso

**App Store Connect:**
- Downloads
- Impresiones
- Calificaciones
- Crash rate

### Responder a Reseñas

```
Play Console > Reseñas de usuarios
App Store Connect > Calificaciones y reseñas

Tips:
- Responder en 24-48 horas
- Agradecer feedback positivo
- Ofrecer solución a problemas
- Ser profesional y cortés
```

---

## 🆘 Solución de Problemas

### Build falla en EAS

```bash
# Ver logs completos
eas build:list
eas build:view [BUILD_ID]

# Errores comunes:
# 1. Keystore inválido -> Regenerar con eas credentials
# 2. Dependencias faltantes -> npm install
# 3. Configuración incorrecta -> Revisar app.config.js
```

### App rechazada en Play Store

**Razones comunes:**
- Falta privacy policy
- Permisos no explicados
- Screenshots inadecuados
- Crash en inicio

**Solución:**
1. Leer email de rechazo
2. Corregir problema
3. Re-subir con: eas submit

### App rechazada en App Store

**Razones comunes:**
- Credenciales de demo no funcionan
- App crashes al abrir
- Metadata incorrecta
- Permisos no justificados

**Solución:**
1. Verificar credenciales de demo
2. Probar en TestFlight antes de enviar
3. Actualizar notas para revisor
4. Re-enviar

---

## ✅ Checklist Final

### Antes de Publicar
- [ ] Todos los endpoints apuntan a producción
- [ ] Variables de entorno configuradas (.env)
- [ ] Google Maps API key válida
- [ ] Assets creados (icon, screenshots, feature graphic)
- [ ] Privacy Policy subida a sitio público
- [ ] Terms of Service disponibles
- [ ] Usuarios de demo creados en backend
- [ ] Build exitoso en EAS
- [ ] Probado en dispositivos reales (Android/iOS)

### Durante Publicación
- [ ] Store listing completo (Play Store)
- [ ] Screenshots subidos (mínimo 2)
- [ ] Content rating completado
- [ ] App Store listing completo (iOS)
- [ ] Credenciales de demo proporcionadas
- [ ] Notas para revisor escritas
- [ ] Build subido correctamente

### Después de Publicación
- [ ] Monitorear crashes (primeros 3 días)
- [ ] Responder a reseñas
- [ ] Configurar analytics
- [ ] Planear actualizaciones futuras

---

## 📞 Soporte

**Documentación oficial:**
- Expo: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/introduction/
- Play Console: https://support.google.com/googleplay/android-developer
- App Store: https://developer.apple.com/app-store/review/guidelines/

**Comunidad:**
- Expo Discord: https://chat.expo.dev
- Stack Overflow: Tag [expo] [eas-build]
- Reddit: r/reactnative

---

¡Éxito con tu publicación! 🚀
