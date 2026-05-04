# 📦 Escáner de Cajas - Documentación

## ✅ Implementación Completada

Se ha implementado la funcionalidad de escaneo de cajas con OCR local para la app móvil de administradores.

---

## 🎯 Funcionalidades Implementadas

### 1. **Pantalla BoxScannerScreen** (`/src/screens/BoxScannerScreen.js`)
- ✅ Vista de cámara en tiempo real
- ✅ Escaneo automático cada 1 segundo
- ✅ Botón manual de escaneo
- ✅ OCR local usando ML Kit (react-native-text-recognition)
- ✅ Procesamiento rápido (<1 segundo)
- ✅ Vibración de confirmación
- ✅ Panel de resultados visual
- ✅ Text-to-speech en español (lee los resultados en voz alta)

### 2. **Servicio API Admin** (`/src/services/adminApi.js`)
- ✅ Función `buscarInformacionCaja()` con estructura lista
- ✅ Función `registrarEscaneo()` para logging
- ✅ Manejo de errores
- ✅ Estructura preparada para futuras funcionalidades admin

### 3. **Navegación**
- ✅ Botón en AdminScreen para acceder al escáner
- ✅ Navegación modal desde Admin → BoxScanner
- ✅ Animación slide desde abajo

### 4. **Librerías Instaladas**
- ✅ `react-native-text-recognition` (v1.0.2) - OCR local con ML Kit
- ✅ `react-native-tts` (v4.1.1) - Text-to-speech
- ✅ `expo-camera` (v17.0.10) - Ya existente

---

## ⚙️ Configuración Pendiente

### 🔴 PASO 1: Definir Formato de Etiqueta

**Necesitas proporcionar:**
- 📸 **Foto de ejemplo de una etiqueta**
- 📋 **Formato exacto del texto** en la etiqueta

**Ejemplo de formato esperado:**
```
RUTA: 123
DIRECCIÓN: Calle Principal #456, Colonia Centro
CONSULTORÍA: María García López
```

**Archivo a editar:** `/src/screens/BoxScannerScreen.js`
- **Función:** `parsearTextoEtiqueta()` (líneas 127-163)
- **Actual:** Parser genérico que busca palabras clave
- **Por hacer:** Ajustar regex según formato real de tus etiquetas

---

### 🔴 PASO 2: Configurar Endpoint del Backend

**Necesitas crear en el backend:**

#### Endpoint recomendado: `POST /api/cajas/buscar`

**Request body:**
```json
{
  "ruta": "123",
  "direccion": "Calle Principal #456",
  "consultoria": "María García López"
}
```

**Response esperado:**
```json
{
  "ruta": "123",
  "color": "AZUL",
  "numeroCarrito": "15",
  "encontrado": true
}
```

**Errores posibles:**
- `404` - No se encontró la caja
- `400` - Datos inválidos
- `500` - Error del servidor

**Archivo a editar:** `/src/services/adminApi.js`
- **Función:** `buscarInformacionCaja()` (líneas 18-56)
- **Actual:** Simulación con datos falsos
- **Por hacer:** Descomentar el código real y ajustar endpoint

---

## 🚀 Cómo Probar la Funcionalidad

### 1. Iniciar la app
```bash
cd /Users/tonyprado/Documents/Proyectos/AMYBUSINESS/amy-mobile
npm start
```

### 2. Hacer login como ADMIN
- Usuario con `rol: 'ADMIN'`

### 3. Abrir el escáner
- En AdminScreen, pulsar el botón **"📦 Escáner de Cajas"**

### 4. Probar escaneo
- Apuntar la cámara a una etiqueta
- Esperar 1 segundo (escaneo automático)
- O pulsar **"📸 Escanear Ahora"** manualmente

### 5. Ver resultados
- **Visual:** Panel blanco con RUTA, COLOR, CARRITO
- **Audio:** La app dice "Ruta X, Color Y, Carrito Z"
- **Vibración:** Confirmación táctil

---

## 📝 Ejemplo de Flujo Completo

```
1. Usuario admin abre app móvil
2. Login exitoso → Ve AdminScreen
3. Pulsa "Escáner de Cajas" → Abre cámara
4. Apunta cámara a etiqueta
5. OCR detecta texto:
   "RUTA: 123
    DIRECCIÓN: Calle X #456
    CONSULTORÍA: María García"
6. Parser extrae: { ruta: "123", direccion: "Calle X #456", consultoria: "María García" }
7. Búsqueda en BDD → { color: "AZUL", numeroCarrito: "15" }
8. Muestra resultado: "RUTA 123 - AZUL - CARRITO 15"
9. Audio: "Ruta ciento veintitrés, Color azul, Carrito quince"
10. Vibración de confirmación
```

---

## 🛠️ Archivos Modificados/Creados

### Archivos Nuevos
- ✅ `/src/screens/BoxScannerScreen.js` (439 líneas)
- ✅ `/src/services/adminApi.js` (98 líneas)
- ✅ Este README

### Archivos Modificados
- ✅ `/src/screens/AdminScreen.js` - Agregado botón de navegación
- ✅ `/App.js` - Agregado BoxScannerScreen al stack
- ✅ `/package.json` - Dependencias instaladas

---

## 🔧 Próximos Pasos

### Inmediatos (para que funcione con datos reales)
1. ⏳ Enviar foto de etiqueta real
2. ⏳ Ajustar `parsearTextoEtiqueta()` según formato
3. ⏳ Crear endpoint en backend: `POST /api/cajas/buscar`
4. ⏳ Descomentar código real en `adminApi.js`
5. ⏳ Probar con etiquetas reales

### Futuros (mejoras opcionales)
- [ ] Historial de escaneos
- [ ] Estadísticas de cajas procesadas
- [ ] Modo offline con caché local
- [ ] Exportar lista de escaneos
- [ ] Buscar por código de barras (QR)

---

## 📱 Permisos Configurados

### iOS (`app.json`)
```json
"NSCameraUsageDescription": "Camera required for delivery evidence photos"
```

### Android (`app.json`)
```json
"permissions": ["CAMERA"]
```

**Nota:** Los permisos ya estaban configurados porque usaban la cámara para fotos de evidencia.

---

## 🐛 Troubleshooting

### La cámara no se abre
- Verificar permisos en Settings del dispositivo
- Reiniciar la app

### OCR no detecta texto
- Asegurar buena iluminación
- Mantener cámara estable 1-2 segundos
- Verificar que el texto sea legible (no manuscrito)

### No habla los resultados
- Verificar que TTS esté habilitado en el dispositivo
- Verificar volumen del dispositivo
- En Android: Instalar datos de voz en español (Settings → Language → Text-to-speech)

### Error "No se encontró información"
- Verificar que el backend esté corriendo
- Verificar `API_BASE_URL` en `/src/config/api.js`
- Verificar logs del backend

---

## 📞 Contacto

Para dudas o ajustes, contacta al desarrollador con:
1. 📸 Foto de la etiqueta real
2. 📋 Formato exacto del texto
3. 🔌 Endpoint del backend disponible

---

## ✨ Características Técnicas

- **OCR Engine:** Google ML Kit (local, offline)
- **Velocidad:** <1 segundo por escaneo
- **Idioma TTS:** Español México
- **Frecuencia escaneo:** Cada 1 segundo (automático)
- **Cooldown:** 2 segundos entre escaneos exitosos
- **Calidad foto OCR:** 80% (balance velocidad/precisión)
