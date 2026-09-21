# Política de Privacidad de AMY Delivery

**Última actualización:** 21 de septiembre de 2026

AMY Business ("nosotros", "nuestro" o "la empresa") opera la aplicación móvil AMY Delivery (el "Servicio"). Esta página le informa sobre nuestras políticas con respecto a la recopilación, uso y divulgación de datos personales cuando utiliza nuestro Servicio.

## 1. Información que Recopilamos

### 1.1 Información de Cuenta
- Nombre completo
- Número de teléfono
- Rol de usuario (Administrador o Repartidor)
- Credenciales de inicio de sesión

### 1.2 Información de Ubicación
Para repartidores, recopilamos:
- **Ubicación en tiempo real** mientras está en una ruta activa de entregas
- **Historial de ubicaciones** para rastreo de rutas completadas
- La ubicación se recopila cada 15 segundos cuando hay una ruta activa

**Propósito:** Rastrear entregas en tiempo real, optimizar rutas, y proporcionar evidencia de entrega.

**Control:** Puede desactivar el seguimiento de ubicación cerrando sesión o finalizando la ruta activa.

### 1.3 Fotografías y Evidencia de Entrega
- Fotografías de paquetes entregados
- Firmas digitales de receptores
- Información del receptor (nombre, relación con destinatario)
- Notas sobre intentos de entrega

### 1.4 Información del Dispositivo
- Modelo del dispositivo
- Sistema operativo y versión
- Nivel de batería (para optimización de rastreo GPS)
- Token de notificaciones push

### 1.5 Información de Uso
- Registros de actividad en la aplicación
- Historial de pedidos entregados
- Estadísticas de desempeño
- Mensajes de chat entre repartidores y administradores

## 2. Cómo Utilizamos su Información

Utilizamos los datos recopilados para:

- **Gestión de entregas:** Asignar, rastrear y completar entregas de paquetes
- **Monitoreo en tiempo real:** Permitir que administradores vean la ubicación de repartidores activos
- **Evidencia de entrega:** Registrar y almacenar pruebas de entregas exitosas o fallidas
- **Optimización de rutas:** Calcular las rutas más eficientes para entregas
- **Comunicación:** Facilitar chat en tiempo real entre repartidores y administradores
- **Notificaciones:** Enviar alertas sobre nuevos pedidos, cambios de estado, y mensajes
- **Análisis y reportes:** Generar estadísticas de desempeño y reportes de entregas
- **Seguridad:** Prevenir fraude y proteger la integridad del servicio

## 3. Almacenamiento y Seguridad de Datos

### 3.1 Ubicación de Servidores
Los datos se almacenan en servidores seguros ubicados en:
- Render.com (https://amy-backend-minutaapi.onrender.com)
- Amazon Web Services S3 (para fotografías de evidencia)

### 3.2 Medidas de Seguridad
- **Encriptación en tránsito:** Todas las comunicaciones usan HTTPS/TLS
- **Autenticación segura:** Tokens JWT con expiración de 24 horas
- **Almacenamiento seguro:** Contraseñas hasheadas, tokens en SecureStore
- **Acceso restringido:** Control de acceso basado en roles (RBAC)

### 3.3 Retención de Datos
- **Ubicaciones GPS:** Se retienen por 90 días
- **Fotografías de evidencia:** Se retienen por 1 año
- **Registros de entregas:** Se retienen indefinidamente para auditoría
- **Datos de cuenta:** Se retienen mientras la cuenta esté activa

## 4. Compartir Información con Terceros

**NO vendemos** sus datos personales a terceros.

Compartimos información limitada con:
- **Google Maps API:** Para geocodificación y cálculo de rutas (solo direcciones, no datos personales)
- **Expo Push Notifications:** Para enviar notificaciones a su dispositivo (solo token del dispositivo)
- **AWS S3:** Para almacenar fotografías de evidencia (encriptadas en reposo)

## 5. Sus Derechos

Usted tiene derecho a:

- **Acceder** a sus datos personales
- **Rectificar** información incorrecta
- **Eliminar** su cuenta y datos asociados
- **Restringir** el procesamiento de ciertos datos
- **Portabilidad** de datos a otro servicio
- **Oponerse** al procesamiento de sus datos

Para ejercer estos derechos, contacte a: **soporte@amybusiness.com**

## 6. Permisos de la Aplicación

La aplicación solicita los siguientes permisos:

| Permiso | Propósito | Requerido |
|---------|-----------|-----------|
| **Ubicación (GPS)** | Rastreo de entregas en tiempo real | Sí (solo repartidores) |
| **Cámara** | Tomar fotos de evidencia y escanear etiquetas | Sí |
| **Galería** | Seleccionar fotos existentes | Opcional |
| **Notificaciones** | Alertas de nuevos pedidos y mensajes | Opcional |
| **Micrófono** | Reconocimiento de voz (futuro) | No |

## 7. Ubicación en Segundo Plano (iOS/Android)

**Solo para repartidores:** La app puede acceder a su ubicación en segundo plano cuando tiene una ruta activa. Esto es necesario para:
- Rastrear la ruta completa de entrega
- Alertar a administradores sobre progreso en tiempo real
- Registrar evidencia de intentos de entrega

**Control:** Puede desactivar esto en la configuración del dispositivo o cerrando sesión.

## 8. Privacidad de Menores

Este servicio NO está dirigido a menores de 18 años. No recopilamos intencionalmente información de menores. Si descubre que un menor ha proporcionado datos personales, contáctenos para eliminarlos.

## 9. Cambios a esta Política

Podemos actualizar esta Política de Privacidad ocasionalmente. Le notificaremos sobre cambios importantes mediante:
- Notificación en la aplicación
- Correo electrónico (si proporcionó uno)
- Actualización de la fecha "Última actualización" en la parte superior

## 10. Cumplimiento Legal

Podemos divulgar su información si es requerido por ley o en respuesta a:
- Órdenes judiciales válidas
- Investigaciones gubernamentales
- Proteger nuestros derechos legales

## 11. Contacto

Si tiene preguntas sobre esta Política de Privacidad, contáctenos:

**AMY Business**
- Email: soporte@amybusiness.com
- Teléfono: +52 (81) XXXX-XXXX
- Dirección: Monterrey, Nuevo León, México

**Servicios de hosting:**
- Backend API: Render.com
- Storage: Amazon Web Services (AWS) S3

---

Al usar AMY Delivery, usted acepta la recopilación y uso de información de acuerdo con esta política.
