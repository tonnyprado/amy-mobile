# Estadísticas e Incidencias - Dashboard Admin

## 📊 Descripción General

Se ha implementado una sección completa de **Estadísticas e Incidencias** en la aplicación móvil para administradores. Esta pantalla ofrece una vista consolidada de todas las métricas, alertas y análisis de rendimiento en tiempo real.

---

## 🎯 Características Implementadas

### 1. Estadísticas Principales
- **Tasa de Éxito**: Porcentaje de pedidos entregados exitosamente
- **Total Entregados**: Cantidad de pedidos entregados del total
- **Repartidores Activos**: Cantidad de repartidores en ruta actualmente

### 2. Progreso del Día
- **Barra de Progreso Visual**: Muestra el avance del día con colores dinámicos
- **Desglose por Estado**:
  - Entregados (verde)
  - En Ruta (azul)
  - Pendientes (naranja)

### 3. Análisis de Ritmo
- **Velocidad de Entrega**: Comparación entre el progreso real vs esperado
- **Tres Estados**:
  - 🚀 **Adelante**: Van por encima del objetivo
  - ⚡ **Buen Ritmo**: Van según lo esperado
  - ⚠️ **Atrasado**: Necesitan acelerar

### 4. Alertas Activas
Sistema de alertas con severidad en tiempo real:

#### Severidad ALTA 🔴
- Batería < 10%
- Velocidad > 120 km/h
- Sin actualización > 45 minutos

#### Severidad MEDIA 🟡
- Batería < 20%
- Detenido > 30 minutos

### 5. Incidencias Detalladas
Desglose completo de rechazos por motivo:

| Icono | Motivo | Descripción |
|-------|--------|-------------|
| 🏠 | Cliente no estaba | Cliente ausente en domicilio |
| 📍 | Datos incorrectos | Dirección o teléfono incorrectos |
| ⚠️ | Alto riesgo | Zona peligrosa |
| 🚚 | Cambio de domicilio | Consultora cambió de dirección |
| ❌ | Rechazo | Cliente rechaza el pedido |
| ⁉️ | Otros motivos | Otros motivos no especificados |

**Resumen adicional**:
- Total de rechazos
- Tasa de rechazo (%)

### 6. Intentos de Entrega
Estadísticas de cuántos intentos se necesitaron:
- 1er intento (verde)
- 2do intento (naranja)
- 3er intento (rojo)
- Más de 3 intentos (rojo oscuro)

### 7. Pedidos Tipo AVISO
- Contador de pedidos que requieren atención especial
- Indica cuántos pedidos están marcados como AVISO

### 8. Top Repartidores
Ranking de los 3 mejores repartidores del día:
- 🥇 Primer lugar
- 🥈 Segundo lugar
- 🥉 Tercer lugar

Muestra:
- Tasa de éxito (%)
- Número de entregas realizadas

### 9. Métricas Generales
- Total de pedidos
- Promedio de entregas por repartidor
- Pedidos en ruta
- Pedidos pendientes

---

## 📁 Archivos Creados/Modificados

### Nuevos Archivos

1. **`src/screens/EstadisticasIncidenciasScreen.js`**
   - Pantalla principal del dashboard
   - Muestra todas las estadísticas e incidencias
   - Actualización automática mediante pull-to-refresh

2. **`src/components/admin/StatsComponents.js`**
   - Componentes reutilizables para estadísticas
   - Incluye: StatCard, MiniStatCard, AlertBadge, ProgressBar, etc.

### Archivos Modificados

3. **`src/services/adminApi.js`**
   - Agregadas funciones:
     - `obtenerTodosPedidosHoy()`: Obtiene todos los pedidos del día
     - `obtenerRepartidoresActivos()`: Obtiene repartidores en ruta
     - `obtenerHistorialUbicaciones()`: Historial GPS de repartidor
     - `obtenerEstadisticasDia()`: Calcula todas las estadísticas agregadas

4. **`src/screens/AdminScreen.js`**
   - Agregado nuevo botón "Estadísticas e Incidencias" en el menú principal

5. **`App.js`**
   - Agregada ruta de navegación `EstadisticasIncidencias`
   - Importado `EstadisticasIncidenciasScreen`

---

## 🔌 Endpoints Utilizados

La implementación usa **únicamente endpoints existentes** del backend:

```
GET /api/pedidos/hoy                          - Todos los pedidos de hoy
GET /api/usuarios                              - Lista de repartidores
GET /api/rastreo/activos                       - Repartidores activos en ruta
GET /api/rastreo/repartidor/{id}/historial     - Historial de ubicaciones
```

**No se requieren cambios en el backend**. Todos los cálculos se realizan en el frontend.

---

## 🎨 Diseño Visual

### Paleta de Colores

```javascript
Éxito:      #10b981 (Verde)
Error:      #ef4444 (Rojo)
Advertencia:#f59e0b (Naranja)
Info:       #3b82f6 (Azul)
Primario:   #2563eb (Azul primario)
Neutral:    #64748b (Gris)
```

### Componentes Visuales

- **Cards con sombras**: Todas las tarjetas tienen elevación para profundidad
- **Bordes de color**: Las StatCards tienen borde izquierdo de color según el tipo
- **Badges dinámicos**: Los contadores cambian de color según la severidad
- **Barras de progreso**: Visualización intuitiva del avance
- **Iconos emoji**: Facilitan la identificación rápida de cada sección

---

## 🚀 Cómo Usar

### Acceso
1. Iniciar sesión como **ADMIN**
2. En el menú principal, seleccionar **"Estadísticas e Incidencias"**
3. La pantalla cargará automáticamente los datos más recientes

### Actualización
- **Pull to Refresh**: Deslizar hacia abajo para actualizar los datos
- **Botón de Actualización**: Presionar el ícono de refresh en el header

### Navegación
- **Botón Atrás**: Regresar al menú principal de admin
- **Scroll Vertical**: Desplazarse para ver todas las secciones

---

## 📊 Cálculos y Lógica

### Tasa de Éxito
```javascript
tasaExito = (entregados / totalPedidos) * 100
```

### Tasa de Rechazo
```javascript
tasaRechazo = (noEntregados / totalPedidos) * 100
```

### Velocidad de Entrega
Compara el progreso real vs el esperado según la hora del día:

```javascript
// Tiempo disponible: 8 AM a 10 PM = 14 horas
minutosDesde8AM = (horaActual - 8) * 60 + minutosActuales
porcentajeEsperado = (minutosDesde8AM / (14 * 60)) * 100

if (tasaExito >= porcentajeEsperado) {
  velocidad = 'adelante'
} else if (tasaExito >= porcentajeEsperado - 10) {
  velocidad = 'bien'
} else {
  velocidad = 'atrasado'
}
```

### Incidencias por Motivo
Cuenta los pedidos NO_ENTREGADO agrupados por `motivoNoEntrega`:
- CLIENTE_NO_ESTABA
- DATOS_INCORRECTOS
- ALTO_RIESGO
- CAMBIO_DOMICILIO
- RECHAZO
- OTRA_RAZON

### Top Repartidores
1. Calcula la tasa de éxito de cada repartidor
2. Ordena por tasa de éxito descendente
3. En caso de empate, ordena por número de entregas
4. Toma los 3 primeros

---

## 🔄 Actualización en Tiempo Real

La pantalla se actualiza:
- **Manualmente**: Pull-to-refresh o botón de actualización
- **Al entrar**: Cada vez que se accede a la pantalla

**Nota**: No hay actualización automática en segundo plano para preservar batería. El admin debe refrescar manualmente cuando desee ver datos actualizados.

---

## 🎯 Casos de Uso

### 1. Monitoreo Matutino
Al iniciar el día, el admin puede ver:
- Cuántos repartidores están activos
- Estado inicial de los pedidos
- Verificar que no haya alertas críticas

### 2. Supervisión Durante el Día
A lo largo del día:
- Verificar si van al ritmo esperado
- Identificar incidencias recurrentes
- Detectar alertas que requieren acción inmediata

### 3. Análisis de Cierre
Al finalizar el día:
- Revisar tasa de éxito global
- Identificar motivos principales de rechazo
- Reconocer a los mejores repartidores

### 4. Detección de Problemas
- **Muchos rechazos por datos incorrectos**: Revisar proceso de captura de direcciones
- **Alto riesgo frecuente**: Replantear rutas en zonas peligrosas
- **Cliente no estaba**: Implementar sistema de confirmación previa
- **Alertas de batería**: Recordar a repartidores cargar dispositivos

---

## 🛠️ Mantenimiento y Extensiones Futuras

### Posibles Mejoras
1. **Filtros por Fecha**: Ver estadísticas de días anteriores
2. **Filtros por Repartidor**: Ver estadísticas individuales
3. **Exportación**: Generar PDF o Excel con reportes
4. **Gráficas**: Agregar gráficos de tendencias
5. **Notificaciones**: Alertas push cuando hay problemas críticos
6. **Comparativas**: Comparar rendimiento día vs día, semana vs semana

### Componentes Reutilizables
Los componentes en `StatsComponents.js` pueden usarse en otras pantallas:
- Pantalla de perfil de repartidor
- Reportes personalizados
- Dashboard de métricas históricas

---

## 🐛 Troubleshooting

### Error: "No se pudieron cargar las estadísticas"
**Causa**: Problema de conexión con el backend
**Solución**:
- Verificar conectividad a internet
- Verificar que el backend esté disponible
- Revisar configuración en `src/config/api.js`

### No se muestran datos
**Causa**: No hay pedidos registrados para hoy
**Solución**:
- Normal si es muy temprano en la mañana
- Verificar que haya pedidos asignados en el backend

### Los datos no se actualizan
**Causa**: Datos en caché
**Solución**:
- Usar pull-to-refresh
- Cerrar y volver a abrir la pantalla

---

## 📞 Soporte

Para reportar bugs o solicitar nuevas funcionalidades:
1. Crear un issue en el repositorio
2. Incluir screenshots si es posible
3. Describir los pasos para reproducir el problema

---

## ✅ Checklist de Implementación

- [x] Crear componentes reutilizables de estadísticas
- [x] Implementar pantalla EstadisticasIncidenciasScreen
- [x] Agregar funciones de API en adminApi.js
- [x] Integrar en sistema de navegación
- [x] Agregar botón en AdminScreen
- [x] Implementar cálculo de estadísticas
- [x] Implementar incidencias por motivo
- [x] Implementar top repartidores
- [x] Implementar alertas por severidad
- [x] Implementar análisis de velocidad
- [x] Agregar pull-to-refresh
- [x] Diseño responsive y visual atractivo
- [x] Documentación completa

---

**Última actualización**: Mayo 20, 2026
**Versión**: 1.0.0
**Autor**: Claude Sonnet 4.5
