/**
 * RepartidoresScreen - Pantalla 03 - Lista de repartidores
 * Lista filtrable con acciones: Llamar, Chat, Info
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { Search, Phone, MessageCircle, Info, X } from 'lucide-react-native';
import { theme, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { REPARTIDORES } from '../data';
import AdminBadge from '../components/AdminBadge';
import { SectionShell, Pill } from '../components/primitives';

export default function RepartidoresScreen({ onOpenChat }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrar repartidores por búsqueda
  const filteredRepartidores = (REPARTIDORES || []).filter((rep) =>
    rep.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCall = (rep) => {
    if (!rep.phone) {
      Alert.alert(
        'Sin teléfono',
        `No hay número registrado para ${rep.name}`,
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'Llamar',
      `¿Deseas llamar a ${rep.name}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Llamar',
          onPress: () => {
            const phoneNumber = rep.phone.replace(/\s+/g, '');
            Linking.openURL(`tel:${phoneNumber}`);
          },
        },
      ]
    );
  };

  const handleInfo = (rep) => {
    const routesText = rep.routes.length > 0
      ? rep.routes.join(', ')
      : 'Sin rutas asignadas';

    Alert.alert(
      rep.name,
      `Rutas: ${routesText}\n\nEstado: ${getStatusLabel(rep.status)}\nProgreso: ${rep.progress.done}/${rep.progress.total}`,
      [{ text: 'OK' }]
    );
  };

  const getStatusLabel = (status) => {
    const labels = {
      enRuta: 'En ruta',
      libre: 'Libre',
      descanso: 'Descanso',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      enRuta: { fg: theme.infoFg, bg: theme.infoBg },
      libre: { fg: theme.muted, bg: theme.canvas },
      descanso: { fg: theme.successFg, bg: theme.successBg },
    };
    return colors[status] || colors.libre;
  };

  return (
    <SectionShell style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AdminBadge />
        <Text style={styles.title}>Repartidores</Text>
      </View>

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Search size={18} color={theme.muted} strokeWidth={2.2} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar repartidor..."
            placeholderTextColor={theme.muted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={18} color={theme.muted} strokeWidth={2.2} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Lista de repartidores */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredRepartidores.map((rep) => {
          const statusConfig = getStatusColor(rep.status);

          return (
            <View key={rep.id} style={styles.card}>
              {/* Header de card */}
              <View style={styles.cardHeader}>
                <View style={[styles.avatar, { backgroundColor: rep.color }]}>
                  <Text style={styles.avatarText}>{rep.tag}</Text>
                  {rep.online && <View style={styles.onlineDot} />}
                </View>

                <View style={styles.cardInfo}>
                  <Text style={styles.name} numberOfLines={1}>
                    {rep.name}
                  </Text>

                  <View style={styles.metaRow}>
                    <Pill
                      bg={statusConfig.bg}
                      color={statusConfig.fg}
                      style={styles.statusPill}
                    >
                      {getStatusLabel(rep.status)}
                    </Pill>

                    {rep.routes.length > 0 && (
                      <Text style={styles.routes} numberOfLines={1}>
                        {rep.routes.length} ruta{rep.routes.length !== 1 ? 's' : ''}
                      </Text>
                    )}
                  </View>
                </View>
              </View>

              {/* Acciones */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.callButton]}
                  onPress={() => handleCall(rep)}
                  activeOpacity={0.7}
                >
                  <Phone size={18} color={theme.surface} strokeWidth={2.2} />
                  <Text style={styles.actionText}>Llamar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.chatButton]}
                  onPress={() => onOpenChat(rep)}
                  activeOpacity={0.7}
                >
                  <MessageCircle size={18} color={theme.surface} strokeWidth={2.2} />
                  <Text style={styles.actionText}>Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.infoButton]}
                  onPress={() => handleInfo(rep)}
                  activeOpacity={0.7}
                >
                  <Info size={18} color={theme.surface} strokeWidth={2.2} />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}

        {filteredRepartidores.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No se encontraron repartidores</Text>
          </View>
        )}

        {/* Espacio final */}
        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </SectionShell>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.canvas,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: 6,
  },
  title: {
    fontFamily: FONTS.display,
    fontSize: 26,
    letterSpacing: -0.7,
    lineHeight: 28,
    color: theme.ink,
    marginBottom: SPACING.lg,
  },
  searchContainer: {
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.base,
    color: theme.ink,
    padding: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.xl,
    paddingTop: 0,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    position: 'relative',
  },
  avatarText: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.lg,
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
    borderColor: theme.surface,
  },
  cardInfo: {
    flex: 1,
  },
  name: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.lg,
    color: theme.ink,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  routes: {
    fontFamily: FONTS.body,
    fontSize: FONT_SIZES.sm,
    color: theme.muted,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    gap: 6,
  },
  callButton: {
    backgroundColor: theme.successFg,
  },
  chatButton: {
    backgroundColor: theme.infoFg,
  },
  infoButton: {
    flex: 0,
    paddingHorizontal: SPACING.md,
    backgroundColor: theme.muted,
  },
  actionText: {
    fontFamily: FONTS.bodyBold,
    fontSize: FONT_SIZES.sm,
    color: theme.surface,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl * 2,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.lg,
  },
  emptyText: {
    fontFamily: FONTS.bodySemibold,
    fontSize: FONT_SIZES.base,
    color: theme.muted,
  },
});
