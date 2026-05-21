/**
 * AdminApp - Composición raíz con estado global
 * PagerView vertical con 3 pantallas + overlays + chat drawer
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

// Components
import Splash from './components/Splash';
import ChatFab from './components/ChatFab';
import SideRail from './components/SideRail';
import NotificationToast from './components/NotificationToast';

// Screens
import StatsScreen from './screens/StatsScreen';
import MonitoreoScreen from './screens/MonitoreoScreen';
import RepartidoresScreen from './screens/RepartidoresScreen';

// Overlays & Panels
import ChatDrawer from './screens/chat/ChatDrawer';
import MoreDetailsPanel from './screens/MoreDetailsPanel';
import ScannerOverlay from './screens/ScannerOverlay';
import AnalysisPanel from './screens/AnalysisPanel';

export default function AdminApp() {
  // Load fonts
  const [fontsLoaded] = useFonts({
    Montserrat_700Bold,
    Montserrat_800ExtraBold,
    Manrope_400Regular,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  // Pager state
  const [activeSection, setActiveSection] = useState(0);
  const pagerRef = useRef(null);

  // Splash state
  const [splashVisible, setSplashVisible] = useState(true);
  const [splashHidden, setSplashHidden] = useState(false);

  // Chat state
  const [chatOpen, setChatOpen] = useState(false);
  const [openConvId, setOpenConvId] = useState(null);
  const [unreadByConv, setUnreadByConv] = useState({
    r1: 2,
    r3: 1,
  });

  // Overlays state
  const [scannerOpen, setScannerOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [analysisOpen, setAnalysisOpen] = useState(false);

  // Toast state
  const [toast, setToast] = useState(null);

  // Stats refresh key (bump to trigger re-animation)
  const [statsAnimKey, setStatsAnimKey] = useState(0);

  // Handle page change
  const handlePageSelected = (e) => {
    const newPage = e.nativeEvent.position;
    setActiveSection(newPage);

    // Si volvemos a Stats (página 0), bumpeamos la key para re-animar
    if (newPage === 0) {
      setStatsAnimKey((prev) => prev + 1);
    }
  };

  // Handle FAB press
  const handleChatFabPress = () => {
    setChatOpen(true);
  };

  // Handle chat close
  const handleChatClose = () => {
    setChatOpen(false);
    setOpenConvId(null);
  };

  // Handle open chat for specific repartidor
  const handleOpenChat = (repartidor) => {
    setOpenConvId(repartidor.id);
    setChatOpen(true);

    // Clear unread count for this repartidor
    setUnreadByConv((prev) => {
      const newUnread = { ...prev };
      delete newUnread[repartidor.id];
      return newUnread;
    });
  };

  // Handle conversation change
  const handleConvChange = (convId) => {
    setOpenConvId(convId);

    // Clear unread count when opening conversation
    if (convId) {
      setUnreadByConv((prev) => {
        const newUnread = { ...prev };
        delete newUnread[convId];
        return newUnread;
      });
    }
  };

  // Calculate total unread
  const totalUnread = Object.values(unreadByConv).reduce((sum, count) => sum + count, 0);

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

  // Show toast notification
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Auto-hide splash after 1.7 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      // Trigger fade out
      setSplashHidden(true);
    }, 1700);

    return () => clearTimeout(timer);
  }, []);

  // Handle splash animation complete
  const handleSplashHidden = () => {
    setSplashVisible(false);
  };

  // Simulate incoming message (for demo)
  useEffect(() => {
    // Simulate a new message after 10 seconds
    const timer = setTimeout(() => {
      setUnreadByConv((prev) => ({
        ...prev,
        r2: (prev.r2 || 0) + 1,
      }));
      showToast('Nuevo mensaje de Juan Pérez');
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  // Wait for fonts to load (after all hooks)
  if (!fontsLoaded) {
    return <LoadingScreen message="Cargando fuentes..." />;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.accent} />

      {/* Main Content - Always rendered but hidden by Splash initially */}
      <>
          {/* PagerView con 3 pantallas verticales */}
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
                key={statsAnimKey}
                onOpenScanner={handleOpenScanner}
                onOpenMoreDetails={handleOpenMoreDetails}
                onRefresh={() => setStatsAnimKey((prev) => prev + 1)}
              />
            </View>

            {/* Página 1 - Monitoreo */}
            <View key="1" style={styles.page}>
              <MonitoreoScreen
                userName="Admin"
                onOpenAnalysis={handleOpenAnalysis}
              />
            </View>

            {/* Página 2 - Repartidores */}
            <View key="2" style={styles.page}>
              <RepartidoresScreen onOpenChat={handleOpenChat} />
            </View>
          </PagerView>

          {/* Side Rail (indicadores de pantalla) */}
          <SideRail activeSection={activeSection} />

          {/* Chat FAB */}
          <ChatFab
            unreadCount={totalUnread}
            onPress={handleChatFabPress}
          />

          {/* Notification Toast */}
          {toast && <NotificationToast message={toast} />}

          {/* Chat Drawer */}
          <ChatDrawer
            visible={chatOpen}
            onClose={handleChatClose}
            unreadByConv={unreadByConv}
            openConvId={openConvId}
            onConvChange={handleConvChange}
          />

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
        </>

      {/* Splash Screen - Renders on top */}
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
});
