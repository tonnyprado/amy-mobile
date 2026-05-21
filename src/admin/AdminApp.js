/**
 * AdminApp - Composición raíz con estado global
 * PagerView vertical con 2 pantallas: Stats + Monitoreo
 * ChatFAB abre lista de chats
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useFonts } from 'expo-font';
import {
  Montserrat_700Bold,
  Montserrat_800ExtraBold,
} from '@expo-google-fonts/montserrat';
import {
  Manrope_400Regular,
  Manrope_600SemiBold,
  Manrope_700Bold,
} from '@expo-google-fonts/manrope';
import { theme } from './theme';
import LoadingScreen from '../components/LoadingScreen';
import useAdminData from './hooks/useAdminData';
import { enviarAnuncioChat } from '../services/chatApi';
import { useAuth } from '../contexts/AuthContext';

// Components
import Splash from './components/Splash';
import ChatFab from './components/ChatFab';
import SideRail from './components/SideRail';
import NotificationToast from './components/NotificationToast';
import BroadcastAnnouncementModal from './components/BroadcastAnnouncementModal';

// Screens
import StatsScreen from './screens/StatsScreen';
import MonitoreoScreen from './screens/MonitoreoScreen';
import ChatListScreen from './screens/ChatListScreen';
import SettingsScreen from './screens/SettingsScreen';

// Overlays & Panels
import MoreDetailsPanel from './screens/MoreDetailsPanel';
import ScannerOverlay from './screens/ScannerOverlay';
import AnalysisPanel from './screens/AnalysisPanel';

export default function AdminApp() {
  // Auth context
  const { logout, user } = useAuth();

  // Load fonts
  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  // Cargar datos reales desde API y WebSocket
  const {
    repartidores,
    estadisticas,
    unreadByConv,
    loading: dataLoading,
    wsConnected,
    refrescar,
    limpiarNoLeidos
  } = useAdminData();

  // Pager state
  const [activeSection, setActiveSection] = useState(0);
  const pagerRef = useRef(null);

  // Splash state
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashHidden, setSplashHidden] = useState(false);

  // Chat list state
  const [chatListOpen, setChatListOpen] = useState(false);

  // Broadcast modal state
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);

  // Overlays state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);

  // Handle page change
  const handlePageSelected = (e) => {
    const newPage = e.nativeEvent.position;
    setActiveSection(newPage);
  };

  // Handle scanner open
  const handleOpenScanner = () => {
    setScannerOpen(true);
  };

  // Handle more details open
  const handleOpenMoreDetails = () => {
    setMoreOpen(true);
  };

  // Handle analysis open
  const handleOpenAnalysis = () => {
    setAnalysisOpen(true);
  };

  // Handle ChatFAB press - Abre la lista de chats
  const handleChatFabPress = () => {
    setChatListOpen(true);
  };

  // Handle chat list close
  const handleChatListClose = () => {
    setChatListOpen(false);
  };

  // Handle broadcast modal open
  const handleOpenBroadcast = () => {
    setBroadcastModalOpen(true);
  };

  // Handle broadcast send
  const handleSendBroadcast = async (message) => {
    try {
      console.log('📢 Enviando anuncio masivo:', message);

      await enviarAnuncioChat({
        body: message,
        recipientIds: repartidores.map(r => r.userId) // Enviar a todos los repartidores
      });

      showToast('Anuncio enviado a todos los repartidores');
      console.log('✅ Anuncio enviado correctamente');
    } catch (error) {
      console.error('❌ Error enviando anuncio:', error);
      showToast(`Error: ${error.message}`);
    }
  };

  // Handle open chat from list
  const handleOpenChatFromList = (repartidorId) => {
    // Clear unread count
    limpiarNoLeidos(repartidorId);
  };

  // Handle settings open
  const handleOpenSettings = () => {
    setSettingsOpen(true);
  };

  // Handle logout
  const handleLogout = async () => {
    console.log('👋 Cerrando sesión...');
    await logout();
  };

  // Show toast notification
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Calculate total unread
  const totalUnread = Object.values(unreadByConv).reduce((sum, count) => sum + count, 0);

  // Auto-hide splash after 1.7 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashHidden(true);
    }, 1700);

    return () => clearTimeout(timer);
  }, []);

  // Handle splash animation complete
  const handleSplashHidden = () => {
    setSplashVisible(false);
  };

  // Wait for fonts to load (after all hooks)
  if (!fontsLoaded) {
    return <LoadingScreen message="Cargando fuentes..." />;
  }

  // Wait for initial data to load
  if (dataLoading && !estadisticas) {
    return <LoadingScreen message="Cargando datos..." />;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.accent} />

      {/* PagerView con 2 pantallas verticales */}
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        orientation="vertical"
        onPageSelected={handlePageSelected}
        scrollEnabled={true}
      >
        {/* Página 0 - Stats */}
        <View key="0" style={styles.page}>
          <StatsScreen
            data={estadisticas}
            onOpenScanner={handleOpenScanner}
            onOpenMoreDetails={handleOpenMoreDetails}
            onRefresh={async () => {
              showToast('Actualizando...');
              await refrescar();
              showToast('Datos actualizados');
            }}
            onOpenSettings={handleOpenSettings}
          />
        </View>

        {/* Página 1 - Monitoreo */}
        <View key="1" style={styles.page}>
          <MonitoreoScreen
            data={estadisticas}
            repartidores={repartidores}
            userName="Admin"
            onOpenAnalysis={handleOpenAnalysis}
          />
        </View>
      </PagerView>

      {/* Side Rail (2 puntos) */}
      <SideRail activeSection={activeSection} />

      {/* Chat FAB */}
      <ChatFab
        unreadCount={totalUnread}
        onPress={handleChatFabPress}
      />

      {/* Notification Toast */}
      {toast && <NotificationToast message={toast} />}

      {/* Chat List Overlay */}
      {chatListOpen && (
        <View style={styles.chatListOverlay}>
          <ChatListScreen
            repartidores={repartidores}
            onBack={handleChatListClose}
            onClearUnread={handleOpenChatFromList}
            onOpenBroadcast={handleOpenBroadcast}
            unreadByConv={unreadByConv}
          />
        </View>
      )}

      {/* More Details Panel */}
      <MoreDetailsPanel
        visible={moreOpen}
        onClose={() => setMoreOpen(false)}
        onOpenAnalysis={() => {
          setMoreOpen(false);
          setTimeout(() => setAnalysisOpen(true), 400);
        }}
      />

      {/* Scanner Overlay */}
      <ScannerOverlay
        visible={scannerOpen}
        onClose={() => setScannerOpen(false)}
      />

      {/* Analysis Panel */}
      <AnalysisPanel
        visible={analysisOpen}
        onClose={() => setAnalysisOpen(false)}
      />

      {/* Broadcast Announcement Modal */}
      <BroadcastAnnouncementModal
        visible={broadcastModalOpen}
        onClose={() => setBroadcastModalOpen(false)}
        onSend={handleSendBroadcast}
      />

      {/* Settings Screen */}
      <SettingsScreen
        visible={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Splash Screen */}
      {splashVisible && (
        <Splash hidden={splashHidden} onHidden={handleSplashHidden} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: theme.canvas,
  },
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  chatListOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 100,
  },
});
