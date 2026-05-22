import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts, Montserrat_700Bold, Montserrat_800ExtraBold } from '@expo-google-fonts/montserrat';
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { AnnouncementProvider } from './src/contexts/AnnouncementContext';
import LoginFlowWrapper from './src/screens/auth/LoginFlowWrapper';
import RepartidorMainScreenWrapper from './src/screens/repartidor/RepartidorMainScreenWrapper';
import PaqueteDetalleScreen from './src/screens/PaqueteDetalleScreen';
import AdminApp from './src/admin/AdminApp';
import AdminScreen from './src/screens/AdminScreen';
import BoxScannerScreen from './src/screens/BoxScannerScreen';
import RepartidoresScreen from './src/screens/RepartidoresScreen';
import MonitoreoScreen from './src/screens/MonitoreoScreen';
import EstadisticasIncidenciasScreen from './src/screens/EstadisticasIncidenciasScreen';
import ChatInboxScreen from './src/screens/chat/ChatInboxScreen';
import ChatConversationScreen from './src/screens/chat/ChatConversationScreen';
import ProfileScreen from './src/screens/repartidor/ProfileScreen';
import DeliverySuccessScreen from './src/screens/repartidor/DeliverySuccessScreen';
import LoadingScreen from './src/components/LoadingScreen';
import {
  addPushNotificationReceivedListener,
  addPushNotificationResponseListener,
  getLastNotificationResponse,
  registerForPushNotifications,
} from './src/services/pushNotificationService';

const Stack = createNativeStackNavigator();

function AppNavigator({ navigationRef }) {
  const { user, loading } = useAuth();
  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  React.useEffect(() => {
    if (!user) {
      return undefined;
    }

    registerForPushNotifications();

    const responseSubscription = addPushNotificationResponseListener((response) => {
      handleNotificationNavigation(response?.notification?.request?.content?.data, navigationRef);
    });

    const receivedSubscription = addPushNotificationReceivedListener((notification) => {
      console.log('📩 Push recibida en foreground:', notification.request.content.data);
    });

    getLastNotificationResponse().then((response) => {
      if (response) {
        handleNotificationNavigation(response.notification?.request?.content?.data, navigationRef);
      }
    });

    return () => {
      responseSubscription?.remove?.();
      receivedSubscription?.remove?.();
    };
  }, [navigationRef, user]);

  if (loading || !fontsLoaded) {
    return <LoadingScreen message="Iniciando..." />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      {!user ? (
        // No autenticado - Solo Login
        <Stack.Screen name="Login" component={LoginFlowWrapper} />
      ) : user.rol === 'ADMIN' ? (
        // Autenticado como Admin - Nueva UI de administración
        <>
          <Stack.Screen
            name="Admin"
            component={AdminApp}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="BoxScanner"
            component={BoxScannerScreen}
            options={{
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen
            name="Repartidores"
            component={RepartidoresScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Monitoreo"
            component={MonitoreoScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="EstadisticasIncidencias"
            component={EstadisticasIncidenciasScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="ChatInbox"
            component={ChatInboxScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="ChatConversation"
            component={ChatConversationScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_bottom',
              presentation: 'modal',
            }}
          />
        </>
      ) : (
        // Autenticado como Repartidor - Nueva UI
        <>
          <Stack.Screen
            name="Paquetes"
            component={RepartidorMainScreenWrapper}
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="PaqueteDetalle"
            component={PaqueteDetalleScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="DeliverySuccess"
            component={DeliverySuccessScreen}
            options={{
              headerShown: false,
              animation: 'fade',
              presentation: 'transparentModal',
            }}
          />
          <Stack.Screen
            name="ChatInbox"
            component={ChatInboxScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="ChatConversation"
            component={ChatConversationScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          />
          <Stack.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              headerShown: false,
              animation: 'slide_from_bottom',
              presentation: 'modal',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  const navigationRef = React.useRef(null);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <AnnouncementProvider>
          <NavigationContainer ref={navigationRef}>
            <AppNavigator navigationRef={navigationRef} />
          </NavigationContainer>
        </AnnouncementProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function handleNotificationNavigation(data, navigationRef) {
  if (!data || !navigationRef?.current?.isReady?.()) {
    return;
  }

  const conversationId = typeof data.conversationId === 'string'
    ? Number(data.conversationId)
    : data.conversationId;

  if (!conversationId) {
    navigationRef.current.navigate('ChatInbox');
    return;
  }

  navigationRef.current.navigate('ChatConversation', {
    conversationId,
    title: data.type === 'chat_announcement' ? 'Anuncio operativo' : 'Chat Operativo',
  });
}
