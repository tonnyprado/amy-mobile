import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { apiClient } from '../config/api';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

function getProjectId() {
  return (
    Constants?.expoConfig?.extra?.eas?.projectId ||
    Constants?.easConfig?.projectId ||
    null
  );
}

async function ensureNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('default', {
    name: 'Notificaciones Mendiola',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#ea580c',
    sound: 'default',
  });
}

export async function registerForPushNotifications() {
  try {
    // Configurar canal de notificaciones (Android)
    await ensureNotificationChannel();

    // Verificar si tenemos projectId de EAS
    const projectId = getProjectId();
    if (!projectId) {
      console.log('ℹ️ Push notifications deshabilitadas (sin EAS projectId). Los anuncios funcionan con WebSocket.');
      return null;
    }

    // Solicitar permisos
    const { status: currentStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = currentStatus;

    if (currentStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('ℹ️ Permisos de notificaciones no otorgados. Los anuncios funcionan con WebSocket.');
      return null;
    }

    // Obtener token de Expo
    const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
    const expoPushToken = tokenResponse?.data;

    if (!expoPushToken) {
      console.log('ℹ️ No se pudo obtener ExpoPushToken. Los anuncios funcionan con WebSocket.');
      return null;
    }

    // Registrar en el backend
    const response = await apiClient.post('/api/push/register-device', {
      expoPushToken,
      platform: Platform.OS,
      deviceLabel: `${Platform.OS}-${Constants?.deviceName || 'device'}`,
    });

    if (!response.ok) {
      throw new Error('No se pudo registrar el dispositivo push');
    }

    console.log('✅ Push notifications configuradas correctamente');
    return expoPushToken;
  } catch (error) {
    console.log('ℹ️ Push notifications no disponibles:', error.message);
    console.log('ℹ️ Los anuncios en tiempo real funcionan con WebSocket (no requiere EAS)');
    return null;
  }
}

export function addPushNotificationReceivedListener(listener) {
  return Notifications.addNotificationReceivedListener(listener);
}

export function addPushNotificationResponseListener(listener) {
  return Notifications.addNotificationResponseReceivedListener(listener);
}

export async function getLastNotificationResponse() {
  return Notifications.getLastNotificationResponseAsync();
}
