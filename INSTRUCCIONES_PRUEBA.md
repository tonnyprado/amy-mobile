# Instrucciones de Prueba - AMY Delivery App

Todo está configurado y listo para probar. Sigue estos pasos en orden.

## ✅ Configuración Completada

### Backend (`controlDeMinutasAPI`)
- ✅ Server configurado para aceptar conexiones de red local (0.0.0.0)
- ✅ CORS configurado para permitir peticiones desde app móvil (*)
- ✅ WebSocket habilitado para cualquier origen
- ✅ Todos los endpoints de rastreo funcionando

### App Móvil (`amy-mobile`)
- ✅ Proyecto Expo creado y configurado
- ✅ API URL apuntando a `http://192.168.0.9:8080`
- ✅ 3 pantallas: Login, Lista de Paquetes, Detalle
- ✅ GPS tracking automático cada 15 segundos
- ✅ Componentes reutilizables
- ✅ Navegación configurada

---

## 🚀 Paso 1: Iniciar el Backend

```bash
cd /Users/tonyprado/Documents/Proyectos/AMYBUSINESS/controlDeMinutasAPI

# Iniciar con perfil de desarrollo
./gradlew bootRun --args='--spring.profiles.active=dev'
```

**Espera a ver este mensaje:**
```
Started ControlMinutasApiApplication in X seconds
```

### Verificar que funciona:

```bash
# Desde otra terminal:
curl http://192.168.0.9:8080/api/usuarios/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"usuario":"test","contrasena":"test"}'
```

Debe responder (aunque sea error, debe conectar).

---

## 📱 Paso 2: Iniciar la App Móvil

### Opción A: En dispositivo físico (Recomendado)

```bash
cd /Users/tonyprado/Documents/Proyectos/AMYBUSINESS/amy-mobile

# Iniciar servidor Expo
npm start
```

**Luego:**
1. Instala **Expo Go** desde Google Play en tu Android
2. Escanea el **código QR** que aparece en la terminal
3. La app se cargará automáticamente

### Opción B: En emulador Android

```bash
# Asegúrate de tener Android Studio con un emulador corriendo

npm start

# Presiona 'a' para abrir en Android
```

---

## 🧪 Paso 3: Probar la App

### 1. Login

**Credenciales de prueba:**
- Usuario: `0001` (o el ID de un repartidor existente en tu BD)
- Contraseña: La que configuraste en el backend

**Qué esperar:**
- ✅ Pantalla de login con logo AMY
- ✅ Validación de campos
- ✅ Al hacer login, debe navegar a la pantalla de Paquetes

**Si falla:**
- Verifica que el backend esté corriendo
- Verifica la IP en `src/config/api.js`
- Revisa logs del backend para ver si llega la petición

### 2. Ver Pedidos

**Qué esperar:**
- ✅ Lista de pedidos asignados al repartidor
- ✅ Contadores: Asignados, En ruta, Entregados, Incidencias
- ✅ Filtros funcionando
- ✅ Pull-to-refresh para recargar

**Si no hay pedidos:**
- Verifica que el repartidor tenga pedidos en la BD
- Endpoint: `GET /api/pedidos/repartidor/0001/hoy`

### 3. GPS Tracking

**Qué esperar:**
- ✅ Al marcar un pedido "En Ruta", aparece banner verde "GPS Activo"
- ✅ Muestra precisión y velocidad
- ✅ Cada 15 segundos envía ubicación al backend

**En logs del backend deberías ver:**
```
POST /api/rastreo/ubicacion
Body: {
  "repartidorId": "0001",
  "latitud": 19.432608,
  "longitud": -99.133209,
  ...
}
```

**Permisos:**
- La app pedirá permisos de ubicación
- Acepta "Permitir mientras usas la app"
- En emulador: envía coordenadas mock desde Android Studio

### 4. Detalle de Pedido

**Qué esperar:**
- ✅ Al tocar un pedido, abre pantalla de detalle
- ✅ Botón para llamar al cliente
- ✅ Campos para capturar evidencias
- ✅ Botón "Tomar Foto" (pide permisos de cámara)
- ✅ Botones: En Ruta, Entregado, No Entregado

### 5. Marcar como Entregado

**Pasos:**
1. Abre un pedido
2. Llena "Nombre de quien recibe"
3. (Opcional) Tomar foto
4. Presiona "✅ Entregado"
5. Confirma en el diálogo

**Qué esperar:**
- ✅ Muestra mensaje de éxito
- ✅ Vuelve a lista de pedidos
- ✅ El pedido ahora tiene badge "Entregado" verde
- ✅ Contador de "Entregados" aumentó

**En backend:**
```
POST /api/rastreo/intento-entrega
{
  "pedidoId": 123,
  "resultado": "ENTREGADO",
  "latitudIntento": 19.432,
  "longitudIntento": -99.133,
  ...
}
```

---

## 🐛 Troubleshooting

### Error: "Network request failed"

**Posibles causas:**
1. Backend no está corriendo
2. IP incorrecta en `api.js`
3. No estás en la misma red WiFi
4. Firewall bloqueando conexiones

**Soluciones:**
```bash
# 1. Verifica backend
curl http://192.168.0.9:8080/api/usuarios/login

# 2. Verifica tu IP actual
ifconfig | grep "inet "
# Usa la IP que empieza con 192.168.x.x (NO 127.0.0.1)

# 3. Verifica misma red WiFi
# Mac y teléfono deben estar conectados a la misma red

# 4. Desactiva firewall temporalmente (Mac)
# System Preferences > Security & Privacy > Firewall
```

### Error: "CORS policy"

**Solución:**
- Verifica que `application-dev.yml` tenga `allowed-origins: "*"`
- Reinicia el backend

### GPS no funciona

**Solución:**
1. Acepta permisos de ubicación
2. En emulador: Envía ubicación mock desde Android Studio
   - Tools > Device Manager > Virtual Device > Extended Controls (...)
   - Location > Set custom location
3. En dispositivo físico: Activa GPS en configuración

### No aparecen pedidos

**Solución:**
```sql
-- Verifica que haya pedidos en la BD
SELECT * FROM pedidos WHERE repartidor_id = '0001';

-- Si no hay, crea uno de prueba
INSERT INTO pedidos (numero_pedido, nombre_consultora, direccion_consultora, estado, repartidor_id, fecha_emision)
VALUES ('TEST-001', 'Cliente Test', 'Calle Test 123', 'PENDIENTE', '0001', CURRENT_DATE);
```

### App se crashea

```bash
# Limpiar caché de Expo
cd /Users/tonyprado/Documents/Proyectos/AMYBUSINESS/amy-mobile
npm start -- --clear

# Si persiste, reinstalar dependencias
rm -rf node_modules
npm install
```

---

## 📊 Monitorear la App

### Logs del Backend (Terminal 1)
```bash
cd /Users/tonyprado/Documents/Proyectos/AMYBUSINESS/controlDeMinutasAPI
./gradlew bootRun --args='--spring.profiles.active=dev'
```

Verás:
- `POST /api/usuarios/login` - Logins
- `GET /api/pedidos/repartidor/0001/hoy` - Cargar pedidos
- `POST /api/rastreo/ubicacion` - GPS tracking (cada 15s)
- `POST /api/rastreo/intento-entrega` - Entregas registradas

### Logs de la App (Terminal 2)
```bash
cd /Users/tonyprado/Documents/Proyectos/AMYBUSINESS/amy-mobile
npm start
```

En la consola de Expo verás:
- `📍 Ubicación enviada: { lat: ..., lng: ... }`
- Errores de red
- Warnings de React Native

### Herramientas de Debug

**React Native Debugger:**
```bash
# Abrir menu de desarrollo en la app:
# - Android: Shake el dispositivo
# - Emulador: Cmd+M (Mac) o Ctrl+M (Windows)

# Seleccionar "Debug" para abrir Chrome DevTools
```

---

## ✅ Checklist de Funcionalidades

Verifica que todo funcione:

- [ ] **Login**
  - [ ] Validación de campos
  - [ ] Error en credenciales incorrectas
  - [ ] Navegación exitosa tras login

- [ ] **Lista de Pedidos**
  - [ ] Carga pedidos del backend
  - [ ] Muestra contadores correctos
  - [ ] Filtros funcionan
  - [ ] Pull-to-refresh recarga

- [ ] **GPS Tracking**
  - [ ] Solicita permisos
  - [ ] Banner verde cuando está activo
  - [ ] Muestra precisión/velocidad
  - [ ] Envía al backend cada 15s

- [ ] **Detalle de Pedido**
  - [ ] Muestra información completa
  - [ ] Botón llamar funciona
  - [ ] Formulario de evidencias editable

- [ ] **Captura de Fotos**
  - [ ] Solicita permisos de cámara
  - [ ] Toma foto y la muestra

- [ ] **Cambio de Estado**
  - [ ] Marca como "En Ruta"
  - [ ] Marca como "Entregado" (con validación)
  - [ ] Marca como "No Entregado" (con motivo)
  - [ ] Sincroniza con backend

- [ ] **Recorridos**
  - [ ] Inicia recorrido al primer "En Ruta"
  - [ ] Finaliza al completar todos

---

## 🎯 Próximos Pasos

Una vez que todo funcione:

1. **Personalizar diseño**
   - Cambiar colores en componentes
   - Agregar logo en `assets/icon.png`

2. **Build APK para pruebas**
   ```bash
   npm install -g eas-cli
   eas login
   eas build --platform android --profile preview
   ```

3. **Probar en múltiples dispositivos**

4. **Preparar para producción**
   - Actualizar `PROD_API_URL` en `api.js`
   - Configurar CORS específico en backend
   - Build de producción firmado

---

## 📞 Soporte

Si encuentras problemas:

1. Revisa `CONFIGURACION_APP_MOVIL.md` en el backend
2. Revisa `README.md` y `ARCHITECTURE.md` en la app
3. Verifica logs de backend y app
4. Prueba endpoints manualmente con `curl`

**Documentación:**
- Backend: `/controlDeMinutasAPI/CONFIGURACION_APP_MOVIL.md`
- App: `/amy-mobile/README.md`
- Arquitectura: `/amy-mobile/ARCHITECTURE.md`
- Quick Start: `/amy-mobile/QUICK_START.md`
