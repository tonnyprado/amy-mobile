import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import PaquetesScreen from './src/screens/PaquetesScreen';
import PaqueteDetalleScreen from './src/screens/PaqueteDetalleScreen';
import NavigationMapScreen from './src/screens/NavigationMapScreen';
import LoadingScreen from './src/components/LoadingScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
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
        <Stack.Screen name="Login" component={LoginScreen} />
      ) : (
        // Autenticado - Pantallas principales
        <>
          <Stack.Screen name="Paquetes" component={PaquetesScreen} />
          <Stack.Screen
            name="PaqueteDetalle"
            component={PaqueteDetalleScreen}
            options={{
              headerShown: true,
              headerTitle: 'Detalle del Paquete',
              headerStyle: {
                backgroundColor: '#2563eb',
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: '700',
              },
            }}
          />
          <Stack.Screen
            name="NavigationMap"
            component={NavigationMapScreen}
            options={{
              headerShown: false,
              presentation: 'fullScreenModal',
              animation: 'slide_from_bottom',
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}
