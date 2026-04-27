# 📦 Migración a AWS S3 para Evidencias

## 📋 Descripción

Este documento describe cómo habilitar AWS S3 para almacenar fotos y firmas de evidencias de entrega, en lugar de guardarlas como base64 en la base de datos.

## 🎯 Beneficios de migrar a S3

### Problemas actuales (base64 en BD):
- ❌ **Base64 es ~33% más grande** que el archivo binario original
- ❌ **BD inflada**: Cada firma/foto ocupa mucho espacio en la BD
- ❌ **Consultas lentas**: Filas con base64 grandes ralentizan las queries
- ❌ **Backup pesados**: Backups de BD muy grandes
- ❌ **Transferencia lenta**: Enviar base64 en JSON es ineficiente
- ❌ **No escalable**: Con miles de pedidos, la BD será insostenible

### Beneficios con S3:
- ✅ **BD ligera**: Solo se guarda la URL (ej: 80 bytes vs 500KB)
- ✅ **Queries rápidas**: Filas pequeñas, índices eficientes
- ✅ **CDN**: Acceso rápido a las imágenes desde cualquier lugar
- ✅ **Escalabilidad**: S3 maneja millones de archivos sin problema
- ✅ **Backup eficiente**: BD pequeña, S3 tiene versionado automático
- ✅ **Costo**: S3 es más barato que espacio en BD

---

## 🏗️ Arquitectura preparada

### Estado actual (S3_ENABLED = false):
```
Repartidor captura firma → Base64 → Backend → BD (campo TEXT/LONGTEXT)
```

### Estado futuro (S3_ENABLED = true):
```
Repartidor captura firma → Base64 → Upload Service → Backend → S3
                                                              ↓
                                         BD guarda URL: s3://bucket/firma.png
```

---

## 📁 Archivos creados

### 1. `/src/config/s3Config.js`
Configuración centralizada de S3:
- ✅ Feature flag `S3_ENABLED` (actualmente en `false`)
- ✅ Configuración de bucket, región, endpoints
- ✅ Límites de tamaño y formatos permitidos
- ✅ Funciones para generar nombres únicos de archivos

### 2. `/src/utils/fileHelpers.js`
Utilidades para manejo de archivos:
- ✅ Conversión de base64 a Blob
- ✅ Validación de tamaños y formatos
- ✅ Formateo de tamaños (KB, MB)
- ⚠️ Compresión de imágenes (pendiente de implementar)

### 3. `/src/services/uploadService.js`
Servicio de upload con fallback automático:
- ✅ `subirFirma()` - Sube firma a S3 o retorna base64
- ✅ `subirFotoEvidencia()` - Sube foto a S3 o retorna base64
- ✅ `subirMultiplesFotos()` - Sube múltiples fotos en paralelo
- ✅ Validaciones de tamaño y formato
- ✅ Manejo de errores con fallback a base64

### 4. `/src/screens/PaqueteDetalleScreen.js`
Pantalla actualizada para usar el servicio:
- ✅ Importa `uploadService` y `S3_ENABLED`
- ✅ Sube firma y fotos antes de registrar el intento
- ✅ Funciona transparentemente con base64 o S3
- ✅ Logs informativos en consola

---

## 🚀 Pasos para habilitar S3

### 📌 Paso 1: Backend - Configurar AWS S3

#### 1.1. Crear bucket en AWS S3
```bash
# En AWS Console o CLI
aws s3 mb s3://amy-delivery-evidencias --region us-east-1
```

#### 1.2. Configurar políticas del bucket
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::amy-delivery-evidencias/*"
    }
  ]
}
```

#### 1.3. Configurar CORS (si es necesario)
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### 📌 Paso 2: Backend - Implementar endpoint de upload

#### 2.1. Instalar SDK de AWS
```bash
npm install aws-sdk
# o
npm install @aws-sdk/client-s3
```

#### 2.2. Crear endpoint `/api/upload` (ejemplo en Node.js)
```javascript
const express = require('express');
const multer = require('multer');
const AWS = require('aws-sdk');

const upload = multer({ storage: multer.memoryStorage() });
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: 'us-east-1'
});

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const { pedidoId, tipo } = req.body;
    const file = req.file;

    // Generar key única
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const key = `evidencias/${tipo}s/pedido-${pedidoId}-${tipo}-${timestamp}-${random}.png`;

    // Subir a S3
    const params = {
      Bucket: 'amy-delivery-evidencias',
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read'
    };

    const result = await s3.upload(params).promise();

    res.json({ url: result.Location });
  } catch (error) {
    console.error('Error uploading to S3:', error);
    res.status(500).json({ error: 'Error al subir archivo' });
  }
});
```

#### 2.3. Configurar variables de entorno
```bash
# .env
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=amy-delivery-evidencias
```

### 📌 Paso 3: Base de datos - Preparar columnas

#### 3.1. Verificar que las columnas puedan almacenar URLs
```sql
-- Verificar estructura actual
DESCRIBE intentos_entrega;

-- Si firmaUrl y fotoEvidenciaUrl son TEXT o VARCHAR(255+), están OK
-- Si no existen, crearlas:
ALTER TABLE intentos_entrega
  ADD COLUMN firmaUrl VARCHAR(500) NULL,
  ADD COLUMN fotoEvidenciaUrl VARCHAR(500) NULL;
```

### 📌 Paso 4: App móvil - Habilitar S3

#### 4.1. Cambiar el feature flag
```javascript
// src/config/s3Config.js
export const S3_ENABLED = true; // ← Cambiar de false a true
```

#### 4.2. Verificar configuración
```javascript
// src/config/s3Config.js
export const S3_CONFIG = {
  uploadEndpoint: '/api/upload', // ← Verificar que coincida con tu backend
  bucket: 'amy-delivery-evidencias',
  region: 'us-east-1',
  // ... resto de configuración
};
```

### 📌 Paso 5: Testing

#### 5.1. Probar upload de firma
1. Abrir la app
2. Ir a un paquete PENDIENTE
3. Capturar una firma
4. Marcar como ENTREGADO
5. Verificar logs en consola:
   ```
   [UPLOAD] S3 habilitado, subiendo firma...
   [UPLOAD] Firma subida a S3: https://amy-delivery-evidencias.s3...
   ```
6. Verificar en BD que `firmaUrl` contenga una URL, no base64

#### 5.2. Probar upload de foto
1. Tomar una foto de evidencia
2. Marcar como ENTREGADO
3. Verificar logs similares

#### 5.3. Verificar en AWS Console
- Ir a S3 → `amy-delivery-evidencias`
- Verificar que existan carpetas: `evidencias/fotos/` y `evidencias/firmas/`
- Verificar que las imágenes sean accesibles públicamente

---

## 🔄 Plan de migración de datos existentes

Si ya tienes pedidos con firmas/fotos en base64:

### Opción 1: Migración en background (Recomendado)
```javascript
// Script de migración (ejecutar en backend)
async function migrarEvidenciasABase64() {
  const intentos = await db.query(
    'SELECT id, firmaUrl, fotoEvidenciaUrl FROM intentos_entrega WHERE firmaUrl LIKE "data:image%"'
  );

  for (const intento of intentos) {
    // Migrar firma
    if (intento.firmaUrl && intento.firmaUrl.startsWith('data:image')) {
      const s3Url = await uploadBase64ToS3(intento.firmaUrl, 'firma', intento.id);
      await db.query('UPDATE intentos_entrega SET firmaUrl = ? WHERE id = ?', [s3Url, intento.id]);
    }

    // Migrar foto
    if (intento.fotoEvidenciaUrl && intento.fotoEvidenciaUrl.startsWith('data:image')) {
      const s3Url = await uploadBase64ToS3(intento.fotoEvidenciaUrl, 'foto', intento.id);
      await db.query('UPDATE intentos_entrega SET fotoEvidenciaUrl = ? WHERE id = ?', [s3Url, intento.id]);
    }
  }
}
```

### Opción 2: Migración bajo demanda
- Al consultar una boleta, si detectas base64, subirlo a S3 y actualizar
- Más lento pero no requiere downtime

### Opción 3: No migrar (Aceptable)
- Dejar los datos antiguos en base64
- Solo nuevos pedidos usan S3
- Eventualmente los pedidos antiguos se archivan

---

## 🧪 Testing del feature flag

### Test 1: S3 deshabilitado (estado actual)
```javascript
// s3Config.js
export const S3_ENABLED = false;
```
✅ Debe seguir funcionando con base64
✅ Logs: `[UPLOAD] S3 deshabilitado, usando base64`

### Test 2: S3 habilitado pero endpoint falla
```javascript
// s3Config.js
export const S3_ENABLED = true;
```
✅ Debe hacer fallback a base64 automáticamente
✅ Logs: `[UPLOAD] Error al subir... Usando base64 como fallback`

### Test 3: S3 habilitado y funcionando
✅ Debe subir a S3 correctamente
✅ BD debe tener URLs, no base64
✅ Logs: `[UPLOAD] Firma subida a S3: https://...`

---

## 📊 Estimación de costos

### AWS S3 (región us-east-1)
- **Storage**: $0.023 por GB/mes
- **Requests PUT**: $0.005 por 1,000 requests
- **Requests GET**: $0.0004 por 1,000 requests
- **Transfer OUT**: $0.09 por GB (primeros 10TB/mes)

### Ejemplo: 1,000 pedidos/mes
- Firma: 50KB promedio
- Foto: 500KB promedio
- Total por pedido: ~550KB

**Cálculo:**
- Storage: 1,000 × 0.55MB = 550MB = $0.013/mes
- PUT requests: 2,000 (firma + foto) = $0.01
- GET requests: ~10,000/mes = $0.004
- **Total: ~$0.03/mes por 1,000 pedidos**

### Comparación con BD:
- BD RDS: ~$0.10 por GB/mes (más caro)
- Backup: ~$0.095 por GB/mes
- Con S3, la BD se reduce drásticamente

**Conclusión: S3 es más barato y eficiente**

---

## 🔐 Seguridad

### Recomendaciones:
1. ✅ **No exponer credenciales AWS en frontend**: Usar backend como proxy
2. ✅ **Validar tamaños y formatos**: Ya implementado en `uploadService`
3. ✅ **Limitar acceso al bucket**: Solo el backend debe escribir
4. ✅ **URLs firmadas** (opcional): Para evidencias privadas
5. ✅ **Antivirus scanning**: Considerar AWS Lambda + ClamAV

---

## 📝 Checklist de implementación

### Backend:
- [ ] Crear bucket S3 en AWS
- [ ] Configurar políticas y CORS
- [ ] Implementar endpoint `/api/upload`
- [ ] Configurar variables de entorno (AWS keys)
- [ ] Verificar columnas en BD (firmaUrl, fotoEvidenciaUrl)
- [ ] Testing del endpoint con Postman

### App móvil:
- [ ] Cambiar `S3_ENABLED = true` en `s3Config.js`
- [ ] Verificar configuración en `S3_CONFIG`
- [ ] Probar upload de firma
- [ ] Probar upload de foto
- [ ] Verificar logs en consola
- [ ] Verificar URLs en BD

### Migración de datos (opcional):
- [ ] Decidir estrategia (background, bajo demanda, o no migrar)
- [ ] Crear script de migración si es necesario
- [ ] Probar en staging
- [ ] Ejecutar en producción

---

## 🐛 Troubleshooting

### Problema: "Error al subir archivo a S3"
- Verificar que el endpoint `/api/upload` esté funcionando
- Verificar credenciales AWS en backend
- Verificar que el bucket exista y tenga permisos correctos

### Problema: "Archivo muy grande"
- Verificar `S3_CONFIG.maxSizes` en `s3Config.js`
- Implementar compresión de imágenes (ver `fileHelpers.js`)

### Problema: "Formato no permitido"
- Verificar `S3_CONFIG.allowedFormats`
- Verificar que `SignaturePad` esté generando PNG

### Problema: URLs de S3 no accesibles
- Verificar que el bucket tenga política de lectura pública
- Verificar CORS si accedes desde web

---

## 🎓 Recursos adicionales

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)
- [React Native Image Upload](https://reactnative.dev/docs/image)
- [FormData en React Native](https://github.com/github/fetch#sending-data)

---

## 📞 Soporte

Si tienes problemas al habilitar S3:
1. Revisa los logs en consola (tanto app como backend)
2. Verifica que `S3_ENABLED` esté en `true`
3. Verifica las credenciales AWS
4. Prueba el endpoint `/api/upload` directamente con Postman

**Nota importante**: El código está preparado para funcionar con o sin S3. Si hay algún error, automáticamente hará fallback a base64 para no bloquear las entregas.
