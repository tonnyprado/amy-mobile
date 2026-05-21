/**
 * ConversationList - Lista de repartidores + mensaje masivo
 * Muestra todos los repartidores disponibles para chat
 */

import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { X, Megaphone } from 'lucide-react-native';
import { theme, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../../theme';
import { REPARTIDORES } from '../../data';

export default function ConversationList({
  onClose,
  onSelectConversation,
  unreadByConv = {},
}) {
  const handleBroadcast = () => {
    Alert.alert(
      'Mensaje masivo',
      '¿Enviar anuncio a todos los repartidores?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar',
          onPress: () => {
            Alert.alert('Éxito', 'Anuncio enviado a todos los repartidores');
          },
        },
      ]
    );
  };

  const renderRepartidor = ({ item: rep }) => {
    const unreadCount = unreadByConv[rep.id] || 0;

    return (
      <TouchableOpacity
        style={styles.repCard}
        onPress={() => onSelectConversation(rep)}
        activeOpacity={0.7}
      >
        <View style={styles.repContent}>
          {/* Avatar */}
          <View style={[styles.avatar, { backgroundColor: rep.color }]}>
            <Text style={styles.avatarText}>{rep.tag}</Text>
            {rep.online && <View style={styles.onlineDot} />}
          </View>

          {/* Info */}
          <View style={styles.repInfo}>
            <Text style={styles.repName} numberOfLines={1}>
              {rep.name}
            </Text>
            <Text style={styles.repStatus} numberOfLines={1}>
              {rep.status === 'enRuta' && `${(rep.routes || []).join(', ')}`}
              {rep.status === 'libre' && 'Disponible'}
              {rep.status === 'descanso' && 'En descanso'}
            </Text>
          </View>

          {/* Badge */}
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color={theme.muted} strokeWidth={2.2} />
        </TouchableOpacity>
      </View>

      {/* Broadcast button */}
      <TouchableOpacity
        style={styles.broadcastButton}
        onPress={handleBroadcast}
        activeOpacity={0.8}
      >
        <View style={styles.broadcastIcon}>
          <Megaphone size={20} color={theme.accent} strokeWidth={2.2} />
        </View>
        <View style={styles.broadcastContent}>
          <Text style={styles.broadcastTitle}>Mensaje masivo</Text>
          <Text style={styles.broadcastSubtext}>
            Enviar anuncio a todos los repartidores
          </Text>
        </View>
      </TouchableOpacity>

      {/* Repartidores list */}
      <FlatList
        data={REPARTIDORES || []}
        keyExtractor={(item) => item.id}
        renderItem={renderRepartidor}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: 64, // Status bar height
    paddingBottom: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: FONT_SIZES.xxl,
    color: theme.ink,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.full,
    backgroundColor: theme.canvas,
    justifyContent: 'center',
    alignItems: 'center',
  },
  broadcastButton: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: SPACING.xl,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: `${theme.accent}08`,
    borderWidth: 1.5,
    borderColor: `${theme.accent}40`,
    borderRadius: RADIUS.lg,
    borderStyle: 'dashed',
    ...SHADOWS.card,
  },
  broadcastIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: `${theme.accent}20`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  broadcastContent: {
    flex: 1,
  },
  broadcastTitle: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.base,
    color: theme.accent,
    marginBottom: 2,
  },
  broadcastSubtext: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: theme.muted,
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  repCard: {
    marginBottom: SPACING.sm,
  },
  repContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: theme.canvas,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: theme.border,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    position: 'relative',
  },
  avatarText: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.base,
    color: theme.ink,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.successFg,
    borderWidth: 2,
    borderColor: theme.canvas,
  },
  repInfo: {
    flex: 1,
  },
  repName: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.base,
    color: theme.ink,
    marginBottom: 2,
  },
  repStatus: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: theme.muted,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.accent,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginLeft: SPACING.sm,
  },
  unreadText: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.xs,
    color: theme.surface,
  },
});
