// src/screens/chat/ChatInboxScreen.js
// Nueva UI del Chat - Lista de conversaciones ordenada

import React, { useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useChatInbox } from '../../hooks/useChatInbox';
import { crearORecuperarConversacionDirecta } from '../../services/chatApi';
import Icon from '../../components/repartidor/Icon';
import { getTheme, DEFAULT_PALETTE, FONTS } from '../../theme/repartidorTheme';
import { useRepartidorFonts } from '../../hooks/useRepartidorFonts';
import LoadingScreen from '../../components/LoadingScreen';

export default function ChatInboxScreen({ navigation }) {
  const { user } = useAuth();
  const { fontsLoaded } = useRepartidorFonts();
  const { contacts, conversations, loading, reloadInbox } = useChatInbox();
  const theme = getTheme(DEFAULT_PALETTE);

  const isAdmin = user?.rol === 'ADMIN';

  // State para la animación de circle reveal
  const [isAnimating, setIsAnimating] = useState(false);
  const revealAnim = useRef(new Animated.Value(0)).current;
  const revealColor = useRef('#FF7849');
  const revealPosition = useRef({ x: 0, y: 0 });

  useFocusEffect(
    React.useCallback(() => {
      reloadInbox();
      // Reset animation when screen comes into focus
      setIsAnimating(false);
      revealAnim.setValue(0);
    }, [reloadInbox, revealAnim])
  );

  const openConversationWithContact = async (contact, event) => {
    // Extraer coordenadas ANTES de cualquier operación async
    const { pageX, pageY } = event.nativeEvent;

    try {
      const conversation = await crearORecuperarConversacionDirecta(contact.id);

      // Trigger circle reveal animation
      revealPosition.current = { x: pageX, y: pageY };
      revealColor.current = getContactColor(contact);

      setIsAnimating(true);
      revealAnim.setValue(0);
      Animated.timing(revealAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start(() => {
        setIsAnimating(false);
      });

      setTimeout(() => {
        navigation.navigate('ChatConversation', {
          conversationId: conversation.id,
          title: conversation.displayName || contact.nombre,
          contactColor: getContactColor(contact),
        });
      }, 200);
    } catch (error) {
      console.error('Error opening conversation:', error);
    }
  };

  const openConversation = (conversation, event) => {
    // Extraer coordenadas inmediatamente
    const { pageX, pageY } = event.nativeEvent;

    // Trigger circle reveal animation
    revealPosition.current = { x: pageX, y: pageY };
    revealColor.current = conversation.color || theme.accent;

    setIsAnimating(true);
    revealAnim.setValue(0);
    Animated.timing(revealAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      setIsAnimating(false);
    });

    setTimeout(() => {
      navigation.navigate('ChatConversation', {
        conversationId: conversation.id,
        title: conversation.displayName,
        contactColor: conversation.color || theme.accent,
      });
    }, 200);
  };

  const getContactColor = (contact) => {
    const colors = ['#FF7849', '#3D6BFF', '#7C5CFF', '#10b981'];
    const index = contact.id % colors.length;
    return colors[index];
  };

  // Ya no se usa onlineCount global, se calcula por sección

  if (loading || !fontsLoaded) {
    return <LoadingScreen message="Cargando chat..." />;
  }

  // Circle reveal animation
  const revealScale = revealAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 60],
  });

  const revealOpacity = revealAnim.interpolate({
    inputRange: [0, 0.3, 0.7, 1],
    outputRange: [0.8, 0.8, 0.6, 0],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.canvas }]} edges={['top', 'bottom']}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <Icon name="chevron-right" size={18} color={theme.ink} strokeWidth={2.2} />
        </TouchableOpacity>

        <View style={styles.headerTitle}>
          <Text style={[styles.headerKicker, { color: theme.muted }]}>COMUNICACIÓN</Text>
          <Text style={[styles.headerText, { color: theme.ink }]}>Chat operativo</Text>
        </View>

        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Icon name="search" size={17} color={theme.ink} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Profile')}
        >
          <Icon name="user-round-cog" size={17} color={theme.ink} />
        </TouchableOpacity>
      </View>

      {/* Announcement Banner - only show if there's an active announcement from context */}
      {/* Removed hardcoded announcement - should come from AnnouncementContext if needed */}

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Conversaciones Activas Section */}
        {conversations.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.muted }]}>
                CONVERSACIONES ACTIVAS
              </Text>
              <View style={styles.onlineIndicator}>
                <View style={[styles.onlineDot, { backgroundColor: theme.successFg }]} />
                <Text style={[styles.onlineText, { color: theme.successFg }]}>
                  {conversations.filter(c => c.online).length} EN LÍNEA
                </Text>
              </View>
            </View>

            <View style={styles.list}>
              {conversations.map((item, index) => (
                <ConversationCard
                  key={`conv-${item.id}`}
                  item={item}
                  theme={theme}
                  isFeatured={index === 0}
                  isContact={false}
                  onPress={(event) => openConversation(item, event)}
                  getContactColor={getContactColor}
                />
              ))}
            </View>
          </>
        )}

        {/* Contactos Disponibles Section */}
        {contacts.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.muted }]}>
                CONTACTOS DISPONIBLES
              </Text>
              <View style={styles.onlineIndicator}>
                <View style={[styles.onlineDot, { backgroundColor: theme.successFg }]} />
                <Text style={[styles.onlineText, { color: theme.successFg }]}>
                  {contacts.filter(c => c.enLinea).length} EN LÍNEA
                </Text>
              </View>
            </View>

            <View style={styles.list}>
              {contacts.map((item) => (
                <ConversationCard
                  key={`contact-${item.id}`}
                  item={item}
                  theme={theme}
                  isFeatured={false}
                  isContact={true}
                  onPress={(event) => openConversationWithContact(item, event)}
                  getContactColor={getContactColor}
                />
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* Circle Reveal Animation Overlay */}
      {isAnimating && (
        <Animated.View
          style={[
            styles.revealCircle,
            {
              left: revealPosition.current.x,
              top: revealPosition.current.y,
              backgroundColor: revealColor.current,
              transform: [{ scale: revealScale }],
              opacity: revealOpacity,
            },
          ]}
          pointerEvents="none"
        />
      )}
    </SafeAreaView>
  );
}

function ConversationCard({ item, theme, isFeatured, isContact, onPress, getContactColor }) {
  const displayName = item.displayName || item.nombre;
  const role = item.role || item.rol || 'Usuario';
  const lastMessage = item.lastMessagePreview || item.lastMessage?.contenido || '';

  // Format time properly
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  };

  const time = formatTime(item.lastMessageAt);
  const unread = item.unreadCount || 0;
  const online = item.online || item.enLinea || false;
  const color = item.color || (isContact ? getContactColor(item) : theme.accent);
  const initials = displayName?.substring(0, 2).toUpperCase() || 'XX';

  return (
    <TouchableOpacity
      style={[
        styles.conversationCard,
        {
          backgroundColor: isFeatured ? theme.ink : theme.surface,
          borderColor: theme.border,
          borderWidth: isFeatured ? 0 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.avatarContainer}>
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Text style={[styles.avatarText, { color: '#0F0F0F' }]}>
            {initials}
          </Text>
        </View>
        {online && (
          <View
            style={[
              styles.onlineBadge,
              {
                backgroundColor: theme.successFg,
                borderColor: isFeatured ? theme.ink : theme.surface,
              },
            ]}
          />
        )}
      </View>

      <View style={styles.conversationContent}>
        <View style={styles.conversationHeader}>
          <Text
            style={[
              styles.conversationName,
              { color: isFeatured ? theme.canvas : theme.ink },
            ]}
          >
            {displayName}
          </Text>
          <Text
            style={[
              styles.conversationTime,
              { color: isFeatured ? theme.canvas : theme.muted },
            ]}
          >
            {time}
          </Text>
        </View>

        <Text
          style={[
            styles.conversationRole,
            { color: isFeatured ? theme.canvas : theme.muted },
          ]}
        >
          {role.toUpperCase()}
        </Text>

        <View style={styles.conversationFooter}>
          <Text
            style={[
              styles.conversationLast,
              { color: isFeatured ? theme.canvas : theme.muted },
            ]}
            numberOfLines={1}
          >
            {lastMessage}
          </Text>
          {unread > 0 && (
            <View style={[styles.unreadBadge, { backgroundColor: theme.accent }]}>
              <Text style={[styles.unreadText, { color: '#0F0F0F' }]}>
                {unread}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    gap: 12,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
  },
  headerKicker: {
    fontSize: 10.5,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.6,
    lineHeight: 26,
    marginTop: 2,
    fontFamily: FONTS.display,
  },
  announcement: {
    marginHorizontal: 20,
    marginTop: 14,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  announcementIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  announcementText: {
    flex: 1,
  },
  announcementKicker: {
    fontSize: 10,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.65,
  },
  announcementMessage: {
    fontSize: 12.5,
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 17,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 6,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  onlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    shadowColor: '#0B7E3E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  onlineText: {
    fontSize: 10.5,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  list: {
    paddingHorizontal: 20,
    paddingTop: 8,
    gap: 8,
  },
  conversationCard: {
    borderRadius: 18,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 26,
    elevation: 5,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.3,
    fontFamily: FONTS.bodyBold,
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2.5,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  conversationName: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
    fontFamily: FONTS.bodyBold,
  },
  conversationTime: {
    fontSize: 10,
    fontFamily: FONTS.bodyRegular,
  },
  conversationRole: {
    fontSize: 10,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    opacity: 0.55,
    marginTop: 1,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5,
    gap: 8,
  },
  conversationLast: {
    fontSize: 12,
    flex: 1,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadText: {
    fontSize: 10.5,
    fontWeight: '700',
    fontFamily: FONTS.bodyBold,
  },
  revealCircle: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    marginLeft: -50,
    marginTop: -50,
    pointerEvents: 'none',
    zIndex: 1000,
  },
});
