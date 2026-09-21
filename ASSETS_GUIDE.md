# Guía de Assets para Play Store y App Store

Este documento detalla todos los assets (imágenes, iconos, screenshots) necesarios para publicar la app en Google Play Store y Apple App Store.

## ✅ Assets Actuales

Ya tienes estos assets en `/assets/`:
- ✅ `icon.png` - 22 KB, 1024x1024px (funciona para ambas tiendas)
- ✅ `splash-icon.png` - 17 KB
- ✅ `adaptive-icon.png` - 17 KB (Android)
- ✅ `favicon.png` - 1.4 KB

---

## 📱 PLAY STORE (Android)

### 1. Icon de Aplicación
**Estado:** ✅ **LISTO**
- **Archivo:** `icon.png`
- **Tamaño:** 512x512px mínimo (tienes 1024x1024px ✅)
- **Formato:** PNG de 32 bits con transparencia
- **Tamaño máximo:** 1 MB

### 2. Adaptive Icon (Android 8.0+)
**Estado:** ✅ **LISTO**
- **Archivo:** `adaptive-icon.png`
- **Tamaño:** 512x512px
- **Formato:** PNG con transparencia
- **Nota:** Solo la imagen del foreground, el fondo se configura con color en app.json

### 3. Feature Graphic
**Estado:** ❌ **PENDIENTE CREAR**
- **Tamaño requerido:** 1024x500px
- **Formato:** JPEG o PNG de 24 bits
- **Tamaño máximo:** 1 MB
- **Descripción:** Banner que aparece en la parte superior de tu listing en Play Store
- **Dónde crearlo:**
  - Usar Canva: https://canva.com (template "Google Play Feature Graphic")
  - Figma: Crear un frame de 1024x500px
  - Photoshop/GIMP
- **Contenido sugerido:**
  - Logo de AMY Delivery
  - Tagline: "Control de Entregas en Tiempo Real"
  - Colores de tu tema (coral/violet: #FF7849 o #C5B4FF)
  - Iconos de delivery/GPS/paquetes

### 4. Screenshots de Teléfono
**Estado:** ❌ **PENDIENTE CREAR**
- **Cantidad:** Mínimo 2, máximo 8
- **Tamaños aceptados:**
  - 16:9 landscape: 1920x1080px, 2560x1440px
  - 9:16 portrait: 1080x1920px, 1440x2560px ✅ **RECOMENDADO**
- **Formato:** JPEG o PNG de 24 bits
- **Tamaño máximo:** 8 MB cada una

**Screenshots recomendados (en este orden):**
1. **Mapa con ruta activa** - Mostrar MapScreen con pedidos
2. **Lista de pedidos** - OrdersScreen con filtros
3. **Detalle de entrega** - Captura de evidencia (foto + firma)
4. **Estadísticas del día** - StatsScreen con métricas
5. **Chat en tiempo real** - Conversación con admin
6. **Login screen** - Pantalla de bienvenida

**Cómo capturar:**
```bash
# Desde tu emulador/dispositivo Android
# 1. Abrir la app en el dispositivo
# 2. Navegar a cada pantalla
# 3. Tomar screenshot con:
#    - Botón Power + Volume Down (dispositivo físico)
#    - Desde Android Studio: Camera icon en emulador
```

### 5. Screenshots de Tablet (Opcional)
**Estado:** ❌ **OPCIONAL** - Puedes omitir por ahora
- Solo si quieres optimizar para tablets

---

## 🍎 APP STORE (iOS)

### 1. App Icon
**Estado:** ✅ **LISTO**
- **Archivo:** `icon.png`
- **Tamaño:** 1024x1024px ✅
- **Formato:** PNG sin transparencia (alpha channel)
- **Nota:** NO debe tener bordes redondeados (iOS los agrega automáticamente)

### 2. Screenshots de iPhone
**Estado:** ❌ **PENDIENTE CREAR**

Apple requiere screenshots para DIFERENTES TAMAÑOS de dispositivos:

#### A. iPhone 6.7" Display (iPhone 14 Pro Max, 15 Pro Max)
**REQUERIDO** ✅
- **Tamaño:** 1290x2796px (portrait) o 2796x1290px (landscape)
- **Cantidad:** Mínimo 1, máximo 10
- **Formato:** JPEG o PNG

#### B. iPhone 6.5" Display (iPhone 11 Pro Max, XS Max)
**REQUERIDO** ✅
- **Tamaño:** 1242x2688px (portrait) o 2688x1242px (landscape)
- **Cantidad:** Mínimo 1, máximo 10

#### C. iPhone 5.5" Display (iPhone 8 Plus)
**REQUERIDO** ✅
- **Tamaño:** 1242x2208px (portrait) o 2208x1242px (landscape)
- **Cantidad:** Mínimo 1, máximo 10

**NOTA IMPORTANTE:** Necesitas proporcionar al menos UN set de screenshots para cada tamaño. Puedes:
- Opción A: Capturar en 3 simuladores diferentes (tedioso)
- Opción B: Usar herramientas de resize/upscale (más rápido)

**Cómo capturar en iOS Simulator:**
```bash
# 1. Abrir Xcode
# 2. Abrir iOS Simulator: Xcode > Open Developer Tool > Simulator
# 3. Seleccionar dispositivo: Hardware > Device > iPhone 14 Pro Max
# 4. Abrir tu app con: npx expo run:ios
# 5. Capturar: Cmd + S (guarda en Desktop)
# 6. Repetir para iPhone 11 Pro Max y iPhone 8 Plus
```

### 3. Screenshots de iPad (Opcional)
**Estado:** ❌ **OPCIONAL** - Recomiendo omitir ya que tu app es phone-only

---

## 🎨 HERRAMIENTAS PARA CREAR ASSETS

### Para Feature Graphic (Android)
1. **Canva** (Gratis): https://canva.com
   - Buscar "Google Play Feature Graphic"
   - Dimensiones: 1024x500px
2. **Figma** (Gratis): https://figma.com
3. **Photoshop/GIMP**

### Para Screenshots con Frames
1. **Previewed** (Gratis): https://previewed.app
   - Agrega frames de dispositivos a tus screenshots
2. **Mockuphone**: https://mockuphone.com
3. **Screenshot Designer** (Figma plugin)

### Para Resize de Screenshots iOS
1. **Figma** - Crear frames de diferentes tamaños
2. **ImageMagick** (CLI):
```bash
# Resize a 1290x2796 (iPhone 14 Pro Max)
convert screenshot.png -resize 1290x2796! screenshot-6.7.png
```

---

## 📋 CHECKLIST FINAL DE ASSETS

### Play Store
- [ ] ✅ App Icon (512x512px) - YA TIENES
- [ ] ✅ Adaptive Icon - YA TIENES
- [ ] ❌ Feature Graphic (1024x500px) - **PENDIENTE**
- [ ] ❌ Screenshots teléfono (mínimo 2) - **PENDIENTE**

### App Store
- [ ] ✅ App Icon (1024x1024px) - YA TIENES
- [ ] ❌ Screenshots iPhone 6.7" (mínimo 1) - **PENDIENTE**
- [ ] ❌ Screenshots iPhone 6.5" (mínimo 1) - **PENDIENTE**
- [ ] ❌ Screenshots iPhone 5.5" (mínimo 1) - **PENDIENTE**

---

## 🚀 PLAN DE ACCIÓN RÁPIDO

### Opción A: Mínimo Viable (2-3 horas)
1. **Feature Graphic:**
   - Ir a Canva.com
   - Buscar "Google Play Feature Graphic"
   - Agregar logo + texto "AMY Delivery - Control de Entregas"
   - Exportar 1024x500px
   - Guardar en: `/assets/store/feature-graphic.png`

2. **Screenshots Android (2 pantallas):**
   - Abrir app en Android emulador
   - Capturar: MapScreen con ruta + OrdersScreen con lista
   - Exportar desde emulador
   - Guardar en: `/assets/store/screenshots/android/`

3. **Screenshots iOS (usar tool de resize):**
   - Tomar screenshots en un simulador (iPhone 14 Pro Max)
   - Usar Figma o ImageMagick para crear versiones en los 3 tamaños
   - Guardar en: `/assets/store/screenshots/ios/`

### Opción B: Profesional (1 día)
1. Diseñar Feature Graphic profesional en Figma
2. Capturar 5-8 screenshots por plataforma
3. Agregar frames de dispositivos con Previewed.app
4. Agregar texto descriptivo sobre cada screenshot
5. Crear promo video corto (30 segundos)

---

## 📌 NOTAS ADICIONALES

- **Consistencia de marca:** Usa siempre los colores de tu tema (coral #FF7849 o violet #C5B4FF)
- **Localización:** Por ahora solo español, pero puedes agregar inglés después
- **Screenshots con datos reales:** Usa datos de prueba que se vean profesionales
- **Texto visible:** Asegúrate que el texto en screenshots sea legible (tamaño mínimo 14-16px)

---

## 🔗 RECURSOS ÚTILES

- **Play Console Help:** https://support.google.com/googleplay/android-developer/answer/9866151
- **App Store Guidelines:** https://developer.apple.com/app-store/product-page/
- **Asset Generator:** https://appicon.co (genera iconos de diferentes tamaños)
- **Screenshot Mockups:** https://mockuphone.com

---

**PRÓXIMO PASO:** Después de crear estos assets, actualiza la ruta en `eas.json` y los listings de las tiendas.
