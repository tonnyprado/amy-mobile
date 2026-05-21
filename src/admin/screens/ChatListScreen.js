/**
 * ChatListScreen - Lista de chats (se abre desde ChatFAB)
 * Diseño según Image 3 del usuario
 * Muestra lista de chats o conversación individual (pantalla completa)
 */

import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, TextInput } from 'react-native';
import { ChevronLeft, Megaphone, ChevronRight, Wifi, WifiOff, Search, X } from 'lucide-react-native';
import { theme, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { SectionShell } from '../components/primitives';
import ConversationView from './chat/ConversationView';

export default function ChatListScreen({ repartidores = [], onBack, onClearUnread, onOpenBroadcast, unreadByConv = {} }) {
  const slideAnim = useRef(new Animated.Value(1000)).current;
  const [activeConversation, setActiveConversation] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Contar repartidores online
  const onlineCount = repartidores.filter(r => r.online).length;

  // Filtrar repartidores por búsqueda
  const filteredRepartidores = repartidores.filter(rep =>
    rep.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // Animate in
    Animated.spring(slideAnim, {
      toValue: 0,
      damping: 25,
      stiffness: 180,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleBack = () => {
    // Si hay conversación activa, volver a la lista
    if (activeConversation) {
      setActiveConversation(null);
      return;
    }

    // Si no, cerrar el overlay completo
    Animated.timing(slideAnim, {
      toValue: 1000,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onBack();
    });
  };

  const handleOpenChat = (repartidor) => {
    // Abrir conversación
    setActiveConversation(repartidor);

    // Limpiar contador de no leídos
    if (onClearUnread) {
      onClearUnread(repartidor.id);
    }
  };

  const handleSendAnnouncement = (repartidor) => {
    console.log('Enviar anuncio a:', repartidor.name);
    // TODO: Implementar envío de anuncio individual
  };

  // Si hay conversación activa, mostrar ConversationView
  if (activeConversation) {
    return (
      <Animated.View
        style={[
          styles.animatedContainer,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <ConversationView
          repartidor={activeConversation}
          onBack={handleBack}
          onSendAnnouncement={handleSendAnnouncement}
        />
      </Animated.View>
    );
  }

  // Si no, mostrar lista de chats
  return (
    <Animated.View
      style={[
        styles.animatedContainer,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <SectionShell style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <ChevronLeft size={24} color={theme.ink} strokeWidth={2.5} />
          </TouchableOpacity>

          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.searchButton}
              onPress={() => setShowSearch(!showSearch)}
            >
              {showSearch ? (
                <X size={20} color={theme.ink} strokeWidth={2.5} />
              ) : (
                <Search size={20} color={theme.ink} strokeWidth={2.5} />
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.broadcastIconButton} onPress={onOpenBroadcast}>
              <Megaphone size={20} color={theme.ink} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        {showSearch && (
          <View style={styles.searchContainer}>
            <Search size={18} color={theme.muted} strokeWidth={2.5} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar repartidor..."
              placeholderTextColor={theme.muted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={18} color={theme.muted} strokeWidth={2.5} />
              </TouchableOpacity>
            )}
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Título */}
          <Text style={styles.kicker}>PANEL ADMIN</Text>
          <Text style={styles.title}>Chat con repartidores</Text>

          {/* Mensaje Masivo */}
          <TouchableOpacity
            style={styles.broadcastButton}
            onPress={onOpenBroadcast}
            activeOpacity={0.8}
          >
            <View style={styles.broadcastIcon}>
              <Megaphone size={20} color={theme.accent} strokeWidth={2.5} />
            </View>
            <View style={styles.broadcastContent}>
              <Text style={styles.broadcastTitle}>MENSAJE MASIVO</Text>
              <Text style={styles.broadcastSubtext}>
                Enviar anuncio a todos los repartidores
              </Text>
            </View>
            <ChevronRight size={24} color="rgba(255,255,255,0.6)" strokeWidth={2.5} />
          </TouchableOpacity>

          {/* Header de lista */}
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>REPARTIDORES</Text>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>{onlineCount} EN LÍNEA</Text>
            </View>
          </View>

          {/* Lista de repartidores */}
          {filteredRepartidores.map((rep) => {
            const unreadCount = unreadByConv[rep.id] || 0;

            return (
              <TouchableOpacity
                key={rep.id}
                style={styles.repCard}
                onPress={() => handleOpenChat(rep)}
                activeOpacity={0.7}
              >
                <View style={styles.repContent}>
                  {/* Avatar */}
                  <View style={[styles.avatar, { backgroundColor: rep.color }]}>
                    <Text style={styles.avatarText}>{rep.tag}</Text>
                    {rep.online && <View style={styles.avatarOnlineDot} />}
                  </View>

                  {/* Info */}
                  <View style={styles.repInfo}>
                    <Text style={styles.repName}>{rep.name}</Text>

                    {/* Status */}
                    <View style={styles.statusRow}>
                      {rep.online ? (
                        <Wifi size={14} color={theme.successFg} strokeWidth={2.5} />
                      ) : (
                        <WifiOff size={14} color={theme.muted} strokeWidth={2.5} />
                      )}
                      <Text style={[styles.statusText, { color: rep.online ? theme.successFg : theme.muted }]}>
                        {rep.online ? 'EN LÍNEA' : 'MODO AHORRO'}
                      </Text>
                    </View>

                    {/* Rutas */}
                    {rep.routes && rep.routes.length > 0 && (
                      <Text style={styles.routes} numberOfLines={1}>
                        Rutas: {rep.routes.join(', ')}
                      </Text>
                    )}
                    {(!rep.routes || rep.routes.length === 0) && (
                      <Text style={styles.routes}>Sin rutas asignadas</Text>
                    )}
                  </View>

                  {/* Badge de no leídos */}
                  {unreadCount > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadText}>{unreadCount}</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}

          {/* Espacio final */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SectionShell>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  animatedContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: theme.canvas,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 6,
    marginBottom: SPACING.md,
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.card,
  },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.card,
  },
  broadcastIconButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.card,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
    ...SHADOWS.card,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.base,
    color: theme.ink,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
  },
  kicker: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 1.4,
    color: theme.muted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: {
    fontFamily: FONTS.displayBlack,
    fontSize: 32,
    letterSpacing: -0.8,
    color: theme.ink,
    marginBottom: SPACING.xl,
  },
  broadcastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.ink,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  broadcastIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: theme.accent + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  broadcastContent: {
    flex: 1,
  },
  broadcastTitle: {
    fontFamily: FONTS.displayBlack,
    fontSize: FONT_SIZES.base,
    color: theme.surface,
    marginBottom: 2,
  },
  broadcastSubtext: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: 'rgba(255,255,255,0.6)',
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  listTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.sm,
    letterSpacing: 1,
    color: theme.muted,
    textTransform: 'uppercase',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.successFg,
  },
  onlineText: {
    fontFamily: FONTS.bodySemibold,
    fontSize: FONT_SIZES.sm,
    color: theme.muted,
  },
  repCard: {
    backgroundColor: theme.surface,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.sm,
    ...SHADOWS.card,
  },
  repContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    position: 'relative',
  },
  avatarText: {
    fontFamily: FONTS.displayBlack,
    fontSize: FONT_SIZES.lg,
    color: theme.ink,
  },
  avatarOnlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.successFg,
    borderWidth: 2.5,
    borderColor: theme.surface,
  },
  repInfo: {
    flex: 1,
  },
  repName: {
    fontFamily: FONTS.displayBlack,
    fontSize: FONT_SIZES.lg,
    color: theme.ink,
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  statusText: {
    fontFamily: FONTS.bodySemibold,
    fontSize: FONT_SIZES.xs,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  routes: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: theme.muted,
  },
  unreadBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.accent,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginLeft: SPACING.sm,
  },
  unreadText: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.sm,
    color: theme.surface,
  },
});
