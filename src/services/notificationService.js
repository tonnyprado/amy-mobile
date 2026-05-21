/**
 * Servicio de Notificaciones Locales
 * Gestiona las notificaciones programadas diarias para repartidores
 */

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configuración de comportamiento de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Solicita permisos de notificaciones al usuario
 * @returns {Promise<boolean>} true si se otorgaron permisos
 */
export async function solicitarPermisosNotificaciones() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Si no hay permisos, solicitarlos
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('⚠️ Permisos de notificaciones denegados');
      return false;
    }

    // Configurar canal de notificaciones en Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notificaciones de Ruta',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#2563eb',
        sound: 'default',
      });
    }

    console.log('✅ Permisos de notificaciones otorgados');
    return true;
  } catch (error) {
    console.error('❌ Error al solicitar permisos de notificaciones:', error);
    return false;
  }
}

/**
 * Programa la notificación de inicio de ruta (7 AM)
 * @returns {Promise<string>} ID de la notificación programada
 */
export async function programarNotificacionInicioRuta() {
  try {
    // DESHABILITADO temporalmente - causaba errores
    console.log('ℹ️ Notificaciones diarias deshabilitadas temporalmente');
    return null;

    /* // Cancelar notificaciones previas con este identificador
    await cancelarNotificacionesPorIdentificador('inicio-ruta');

    // Configurar notificación para las 7 AM todos los días
    const notificationId = await Notifications.scheduleNotificationAsync({
      identifier: 'inicio-ruta',
      content: {
        title: '🚀 ¡Comienza tu ruta!',
        body: 'Buenos días. Es hora de iniciar tu jornada de entregas.',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: { type: 'inicio-ruta' },
      },
      trigger: {
        hour: 7,
        minute: 0,
        repeats: true,
      },
    });

    console.log('✅ Notificación de inicio programada (7 AM):', notificationId);
    return notificationId; */
  } catch (error) {
    console.error('❌ Error al programar notificación de inicio:', error);
    return null;
  }
}

/**
 * Programa la notificación de progreso (10 AM)
 * @returns {Promise<string>} ID de la notificación programada
 */
export async function programarNotificacionProgreso() {
  try {
    // DESHABILITADO temporalmente - causaba errores
    console.log('ℹ️ Notificaciones diarias deshabilitadas temporalmente');
    return null;
  } catch (error) {
    console.error('❌ Error al programar notificación de progreso:', error);
    return null;
  }
}

/**
 * Programa todas las notificaciones diarias
 * @returns {Promise<Object>} IDs de las notificaciones programadas
 */
export async function programarNotificacionesDiarias() {
  try {
    const permisosOtorgados = await solicitarPermisosNotificaciones();

    if (!permisosOtorgados) {
      console.warn('⚠️ No se pueden programar notificaciones sin permisos');
      return null;
    }

    const inicioRutaId = await programarNotificacionInicioRuta();
    const progresoId = await programarNotificacionProgreso();

    console.log('✅ Todas las notificaciones diarias programadas exitosamente');

    return {
      inicioRuta: inicioRutaId,
      progreso: progresoId,
    };
  } catch (error) {
    console.error('❌ Error al programar notificaciones diarias:', error);
    throw error;
  }
}

/**
 * Cancela todas las notificaciones programadas
 */
export async function cancelarTodasLasNotificaciones() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('✅ Todas las notificaciones canceladas');
  } catch (error) {
    console.error('❌ Error al cancelar notificaciones:', error);
  }
}

/**
 * Cancela notificaciones por identificador
 * @param {string} identifier - Identificador de la notificación
 */
async function cancelarNotificacionesPorIdentificador(identifier) {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const notificacionesACancelar = scheduledNotifications
      .filter(notif => notif.identifier === identifier)
      .map(notif => notif.identifier);

    for (const id of notificacionesACancelar) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }

    if (notificacionesACancelar.length > 0) {
      console.log(`✅ Canceladas ${notificacionesACancelar.length} notificaciones con identificador: ${identifier}`);
    }
  } catch (error) {
    console.error('❌ Error al cancelar notificaciones por identificador:', error);
  }
}

/**
 * Obtiene todas las notificaciones programadas (útil para debugging)
 * @returns {Promise<Array>} Lista de notificaciones programadas
 */
export async function obtenerNotificacionesProgramadas() {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    console.log('📋 Notificaciones programadas:', scheduled.length);
    return scheduled;
  } catch (error) {
    console.error('❌ Error al obtener notificaciones programadas:', error);
    return [];
  }
}

/**
 * Envía una notificación inmediata (para testing)
 * @param {string} title - Título de la notificación
 * @param {string} body - Cuerpo de la notificación
 */
export async function enviarNotificacionInmediata(title, body) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data: { type: 'test' },
      },
      trigger: null, // null = inmediata
    });
    console.log('✅ Notificación inmediata enviada');
  } catch (error) {
    console.error('❌ Error al enviar notificación inmediata:', error);
  }
}

export default {
  solicitarPermisosNotificaciones,
  programarNotificacionInicioRuta,
  programarNotificacionProgreso,
  programarNotificacionesDiarias,
  cancelarTodasLasNotificaciones,
  obtenerNotificacionesProgramadas,
  enviarNotificacionInmediata,
};
