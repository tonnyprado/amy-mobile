# Cómo Probar la App en tu iPhone/iPad

**Actualizado:** 2026-04-27

## Método Rápido: Expo Go

### 1. Instala Expo Go en tu iPhone/iPad
- Abre la **App Store**
- Busca **"Expo Go"**
- Descarga e instala

### 2. Inicia el Servidor en tu Mac
```bash
cd /Users/tonyprado/Documents/Proyectos/AMYBUSINESS/amy-mobile
npx expo start
```

### 3. Conecta tu iPhone
Asegúrate de que tu iPhone/iPad y tu Mac estén en la **misma red WiFi**.

### 4. Escanea el QR
- Abre la app de **Cámara** en tu iPhone/iPad
- Apunta a la pantalla de tu Mac donde aparece el código QR
- Toca la notificación que aparece
- La app se abrirá en Expo Go

### 5. ¡Listo!
La app se cargará y podrás:
- ✅ Ver lista de pedidos
- ✅ Marcar pedidos en ruta
- ✅ Ver GPS en tiempo real
- ✅ Abrir navegación con Apple Maps
- ✅ Tomar fotos
- ✅ Capturar firmas
- ✅ Todas las funcionalidades del repartidor

---

## Ventajas de iOS

✅ **No necesita Google Maps API key**
   - Usa Apple Maps de forma nativa
   - Completamente gratis

✅ **Mejor rendimiento**
   - Mapas más fluidos
   - Menor consumo de batería

✅ **GPS más preciso**
   - Precisión de 5-10 metros
   - Mejor tracking en background

✅ **Experiencia nativa**
   - Gestos naturales de iOS
   - Animaciones suaves

---

## Permisos

Cuando abras la app por primera vez, te pedirá:

1. **📍 Ubicación**
   - Necesario para GPS tracking
   - Elige: "Permitir mientras usas la app"

2. **📷 Cámara**
   - Para tomar fotos de evidencia
   - Elige: "Permitir"

3. **📸 Fotos**
   - Para guardar fotos
   - Elige: "Permitir"

Todos estos permisos son necesarios para que la app funcione correctamente.

---

## Problemas Comunes

### "No se puede conectar al servidor"
- Verifica que tu iPhone y Mac estén en la misma red WiFi
- Desactiva el firewall en tu Mac temporalmente
- Reinicia el servidor: `npx expo start -c`

### "Los mapas no cargan"
- Asegúrate de tener conexión a internet
- Verifica que hayas dado permisos de ubicación
- Cierra y vuelve a abrir la app

### "GPS no funciona"
- Ve a Ajustes → Privacidad → Localización
- Verifica que esté activado
- Busca "Expo Go" y asegúrate que tenga permisos

### "La app se ve lenta"
- Es normal en Expo Go durante desarrollo
- Para mejor rendimiento, crea un build nativo:
  ```bash
  npx eas-cli login
  npx eas build --profile development --platform ios
  ```

---

## Build Nativo (Opcional - Para mejor rendimiento)

Si quieres instalar la app directamente en tu iPhone sin Expo Go:

### 1. Instala EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login en Expo
```bash
eas login
```

### 3. Configura el proyecto
```bash
eas build:configure
```

### 4. Crea el build para iOS
```bash
# Build de desarrollo (para testing)
eas build --profile development --platform ios

# O build de producción
eas build --platform ios
```

### 5. Instala en tu iPhone
- EAS te dará un link para descargar el archivo `.ipa`
- Instálalo usando TestFlight o directamente

---

## Características de Apple Maps

Cuando abras la navegación GPS en iOS, verás:

🗺️ **Mapas de Apple**
- Estilo nativo de iOS
- Datos actualizados
- Traffic en tiempo real

🧭 **Navegación**
- Rutas calculadas con OSRM
- Instrucciones en español
- Distancia y tiempo estimado

📍 **Tracking**
- Tu ubicación en tiempo real
- Marcadores de todos los pedidos
- Ruta trazada en el mapa

---

## Testing Recomendado

Para probar todas las funcionalidades:

1. **Login**
   - Usuario: tu repartidor
   - Password: tu contraseña

2. **Ver Pedidos**
   - Verifica que carguen los pedidos del día
   - Prueba los filtros (Todos, Pendientes, En Ruta, etc.)

3. **GPS Tracking**
   - Marca un pedido como "En Ruta"
   - Verifica que aparezca el indicador GPS verde
   - Sal a caminar y verifica que se actualice la ubicación

4. **Navegación**
   - Click en la barra flotante (IslandBar)
   - Selecciona un pedido de la lista
   - Verifica que se trace la ruta
   - Verifica las instrucciones paso a paso

5. **Entrega**
   - Abre el detalle de un pedido
   - Toma una foto
   - Captura una firma
   - Marca como entregado

6. **No Entrega**
   - Marca un pedido como "No Entregado"
   - Escribe el motivo
   - Verifica que se registre

---

## Soporte

Si tienes problemas:

1. Revisa esta guía
2. Verifica los permisos en Ajustes
3. Reinicia la app
4. Reinicia el servidor con `npx expo start -c`
5. Reinicia tu iPhone

Para bugs o problemas específicos, contacta al equipo de desarrollo.

---

**¡Disfruta probando la app en iOS!** 🚀📱
