/**
 * ChatDrawer - Drawer principal del chat
 * Alterna entre lista de conversaciones y conversación abierta
 * Incluye swipe gesture para abrir/cerrar
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { theme } from '../../theme';
import { REPARTIDORES } from '../../data';
import ConversationList from './ConversationList';
import ConversationView from './ConversationView';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.9; // 90% del ancho
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3; // 30% para activar cierre

export default function ChatDrawer({
  visible,
  onClose,
  unreadByConv = {},
  openConvId = null,
  onConvChange,
}) {
  const [activeConversation, setActiveConversation] = useState(null);
  const slideAnim = useRef(new Animated.Value(SCREEN_WIDTH)).current;
  const dragX = useRef(new Animated.Value(0)).current;

  // Abrir/cerrar drawer
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 25,
        stiffness: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_WIDTH,
        duration: 320,
        useNativeDriver: true,
      }).start(() => {
        // Reset al cerrar
        setActiveConversation(null);
        dragX.setValue(0);
      });
    }
  }, [visible]);

  // Abrir conversación específica desde el exterior
  useEffect(() => {
    if (openConvId && visible) {
      const rep = REPARTIDORES.find((r) => r.id === openConvId);
      if (rep) {
        setActiveConversation(rep);
      }
    }
  }, [openConvId, visible]);

  const handleSelectConversation = (repartidor) => {
    setActiveConversation(repartidor);
    if (onConvChange) {
      onConvChange(repartidor.id);
    }
  };

  const handleBackToList = () => {
    setActiveConversation(null);
    if (onConvChange) {
      onConvChange(null);
    }
  };

  const handleSendAnnouncement = (repartidor) => {
    // Placeholder para enviar anuncio
    console.log('Enviar anuncio a:', repartidor.name);
  };

  // Gesture handler para swipe to close
  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: dragX } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;

      // Si se desliza más del threshold o con velocidad alta, cerrar
      if (translationX > SWIPE_THRESHOLD || velocityX > 500) {
        onClose();
      } else {
        // Volver a la posición original
        Animated.spring(dragX, {
          toValue: 0,
          damping: 20,
          stiffness: 150,
          useNativeDriver: true,
        }).start();
      }
    }
  };

  if (!visible) return null;

  const drawerTranslateX = Animated.add(
    slideAnim,
    dragX.interpolate({
      inputRange: [0, SCREEN_WIDTH],
      outputRange: [0, SCREEN_WIDTH],
      extrapolate: 'clamp',
    })
  );

  return (
    <>
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Drawer */}
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={10}
        failOffsetX={-10}
      >
        <Animated.View
          style={[
            styles.drawer,
            {
              width: DRAWER_WIDTH,
              transform: [{ translateX: drawerTranslateX }],
            },
          ]}
        >
          {activeConversation ? (
            <ConversationView
              repartidor={activeConversation}
              onBack={handleBackToList}
              onSendAnnouncement={handleSendAnnouncement}
            />
          ) : (
            <ConversationList
              onClose={onClose}
              onSelectConversation={handleSelectConversation}
              unreadByConv={unreadByConv}
            />
          )}
        </Animated.View>
      </PanGestureHandler>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 150,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: theme.surface,
    zIndex: 151,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
});
