// src/screens/repartidor/RepartidorMainScreen.js
// Pantalla principal del repartidor que combina Map, Orders y Stats

import React, { useState, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import PagerView from 'react-native-pager-view';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '../../contexts/AuthContext';
import { getTheme, DEFAULT_PALETTE } from '../../theme/repartidorTheme';
import { useRepartidorFonts } from '../../hooks/useRepartidorFonts';
import MapScreen from './MapScreen';
import OrdersScreen from './OrdersScreen';
import StatsScreen from './StatsScreen';
import ProfileScreen from './ProfileScreen';
import SideRail from '../../components/repartidor/SideRail';
import ChatFab from '../../components/repartidor/ChatFab';
import NotificationToast from '../../components/repartidor/NotificationToast';
import LoadingScreen from '../../components/LoadingScreen';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const SECTIONS = [
  { id: 'map', label: '01' },
  { id: 'orders', label: '02' },
  { id: 'stats', label: '03' },
];

export default function RepartidorMainScreen({
  navigation,
  pedidos,
  ubicacion,
  unreadCount = 0,
  toastNotification,
  onToastPress,
}) {
  const { user } = useAuth();
  const { fontsLoaded, fontError } = useRepartidorFonts();
  const [activeSection, setActiveSection] = useState(0);
  const pagerRef = useRef(null);

  const theme = getTheme(DEFAULT_PALETTE);

  const handlePageSelected = (e) => {
    setActiveSection(e.nativeEvent.position);
  };

  const handleGoToSection = (index) => {
    pagerRef.current?.setPage(index);
  };

  const handlePedidoPress = (pedido) => {
    navigation.navigate('PaqueteDetalle', {
      paquete: pedido,
      ubicacion,
    });
  };

  const handleChatPress = () => {
    navigation.navigate('ChatInbox');
  };

  // Mock stats - replace with real data from API
  const stats = {
    deliveriesToday: pedidos?.filter(p => p.estado === 'ENTREGADO').length || 0,
    assignedToday: pedidos?.length || 0,
    weekBars: [3, 5, 4, 7, 6, 9, 18],
    weekDays: ['L', 'M', 'M', 'J', 'V', 'S', 'D'],
    distance: '124',
    rating: '4.9',
    efficiency: '94',
    income: '2,840',
  };

  if (!fontsLoaded && !fontError) {
    return <LoadingScreen message="Cargando fuentes..." />;
  }

  if (fontError) {
    console.error('Error loading fonts:', fontError);
    // Continue anyway - will use fallback fonts
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        orientation="vertical"
        onPageSelected={handlePageSelected}
      >
        <View key="map" style={styles.page}>
          <MapScreen
            theme={theme}
            pedidos={pedidos || []}
            ubicacionActual={ubicacion}
            userName={user?.nombre || 'Usuario'}
          />
        </View>

        <View key="orders" style={styles.page}>
          <OrdersScreen
            theme={theme}
            pedidos={pedidos || []}
            onPedidoPress={handlePedidoPress}
          />
        </View>

        <View key="stats" style={styles.page}>
          <StatsScreen theme={theme} stats={stats} />
        </View>
      </PagerView>

      <SideRail
        sections={SECTIONS}
        activeSection={activeSection}
        onGoTo={handleGoToSection}
        hidden={false}
        theme={theme}
      />

      <ChatFab
        theme={theme}
        onAccentBg={activeSection === 2}
        unreadCount={unreadCount}
        onPress={handleChatPress}
        hidden={false}
      />

      <NotificationToast
        toast={toastNotification}
        theme={theme}
        onPress={onToastPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pager: {
    flex: 1,
  },
  page: {
    height: SCREEN_HEIGHT,
  },
});
