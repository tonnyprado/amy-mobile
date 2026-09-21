// src/screens/repartidor/ProfileScreen.js
// Pantalla 4 - Perfil y Configuración

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Linking } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import SectionShell from '../../components/repartidor/SectionShell';
import Icon from '../../components/repartidor/Icon';
import { FONTS, getTheme, DEFAULT_PALETTE } from '../../theme/repartidorTheme';

export default function ProfileScreen({ route, navigation }) {
  const { user, logout } = useAuth();
  const theme = getTheme(DEFAULT_PALETTE);
  const repartidor = user?.repartidor || {};

  // Datos del usuario
  const userName = repartidor?.nombre || user?.nombre || 'Usuario';
  const userInitials = userName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'US';
  const userRole = user?.rol === 'REPARTIDOR' ? 'Repartidor' : user?.rol || 'Usuario';
  const apodo = repartidor?.apodo;

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesion',
      '¿Estas seguro de que deseas cerrar sesion?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesion',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  const handleCall = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmail = (email) => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`);
  };

  const profileFields = [
    {
      icon: 'user',
      label: 'Nombre completo',
      value: repartidor?.nombre || user?.nombre || 'No disponible',
    },
    {
      icon: 'hash',
      label: 'Apodo',
      value: repartidor?.apodo || 'Sin apodo',
    },
    {
      icon: 'phone',
      label: 'Telefono principal',
      value: repartidor?.telefono1 || 'No registrado',
      onPress: repartidor?.telefono1 ? () => handleCall(repartidor.telefono1) : null,
    },
    {
      icon: 'smartphone',
      label: 'Telefono secundario',
      value: repartidor?.telefono2 || 'No registrado',
      onPress: repartidor?.telefono2 ? () => handleCall(repartidor.telefono2) : null,
    },
    {
      icon: 'mail',
      label: 'Correo personal',
      value: repartidor?.correoPersonal || 'No registrado',
      onPress: repartidor?.correoPersonal ? () => handleEmail(repartidor.correoPersonal) : null,
    },
    {
      icon: 'mail',
      label: 'Correo empresarial',
      value: repartidor?.correoEmpresarial || user?.email || 'No registrado',
      onPress: (repartidor?.correoEmpresarial || user?.email) ? () => handleEmail(repartidor?.correoEmpresarial || user?.email) : null,
    },
    {
      icon: 'credit-card',
      label: 'CURP',
      value: repartidor?.curp || 'No registrado',
      isSensitive: true,
    },
    {
      icon: 'map-pin',
      label: 'Rutas asignadas',
      value: repartidor?.rutas?.length > 0 ? repartidor.rutas.join(', ') : 'Sin rutas asignadas',
    },
  ];

  return (
    <SectionShell bg={theme.accent} label="" theme={theme} padded={false}>
      {/* Boton de cerrar */}
      <TouchableOpacity
        style={[styles.closeButton, { backgroundColor: theme.ink }]}
        onPress={() => navigation.goBack()}
      >
        <Icon name="x" size={24} color={theme.accent} strokeWidth={2.5} />
      </TouchableOpacity>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Header con avatar */}
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: theme.ink }]}>
            <Text style={[styles.avatarText, { color: theme.accent }]}>
              {userInitials}
            </Text>
          </View>
          <Text style={[styles.name, { color: theme.ink }]}>
            {userName}
          </Text>
          {apodo && (
            <View style={[styles.apodoBadge, { backgroundColor: theme.ink }]}>
              <Text style={[styles.apodoText, { color: theme.accent }]}>{apodo}</Text>
            </View>
          )}
          <Text style={[styles.role, { color: theme.ink }]}>
            {userRole}
          </Text>
          {repartidor?.idRepartidor && (
            <Text style={[styles.userId, { color: theme.ink }]}>
              ID: {repartidor.idRepartidor}
            </Text>
          )}
        </View>

        {/* Menu de opciones */}
        <View style={[styles.menu, { backgroundColor: theme.canvas }]}>
          <Text style={[styles.menuTitle, { color: theme.muted }]}>
            INFORMACION PERSONAL
          </Text>

          {profileFields.map((item, index) => {
            const isUnavailable = item.value === 'No registrado' || item.value === 'Sin apodo' || item.value === 'Sin rutas asignadas';
            const isClickable = !!item.onPress;

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.menuItem,
                  { borderBottomColor: theme.border },
                  index === profileFields.length - 1 && styles.menuItemLast,
                ]}
                onPress={item.onPress}
                disabled={!isClickable}
                activeOpacity={isClickable ? 0.7 : 1}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[styles.menuIcon, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Icon name={item.icon} size={18} color={theme.ink} />
                  </View>
                  <View style={styles.menuItemText}>
                    <Text style={[styles.menuLabel, { color: theme.muted }]}>
                      {item.label}
                    </Text>
                    <Text
                      style={[
                        styles.menuValue,
                        { color: isUnavailable ? theme.muted : theme.ink },
                        isUnavailable && styles.menuValueMuted,
                        item.isSensitive && styles.menuValueSensitive,
                      ]}
                      numberOfLines={2}
                    >
                      {item.value}
                    </Text>
                  </View>
                </View>
                {isClickable && !isUnavailable && (
                  <Icon name="chevron-right" size={18} color={theme.muted} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Legal Links */}
        <View style={[styles.legalContainer, { backgroundColor: theme.canvas }]}>
          <TouchableOpacity
            style={styles.legalLink}
            onPress={() => Linking.openURL('https://mendiolalogistics.com/privacy-policy')}
          >
            <Icon name="shield" size={14} color={theme.muted} />
            <Text style={[styles.legalText, { color: theme.muted }]}>Política de Privacidad</Text>
          </TouchableOpacity>

          <View style={[styles.legalSeparator, { backgroundColor: theme.border }]} />

          <TouchableOpacity
            style={styles.legalLink}
            onPress={() => Linking.openURL('https://mendiolalogistics.com/terms-of-service')}
          >
            <Icon name="file-text" size={14} color={theme.muted} />
            <Text style={[styles.legalText, { color: theme.muted }]}>Términos de Servicio</Text>
          </TouchableOpacity>
        </View>

        {/* Boton de cerrar sesion */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.ink }]}
          onPress={handleLogout}
        >
          <Icon name="log-out" size={18} color={theme.accent} strokeWidth={2.2} />
          <Text style={[styles.logoutText, { color: theme.accent }]}>
            Cerrar sesion
          </Text>
        </TouchableOpacity>

        {/* Footer */}
        <Text style={[styles.version, { color: theme.ink }]}>
          AMY Delivery v1.0.0
        </Text>
      </ScrollView>
    </SectionShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 54,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  content: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: FONTS.display,
    letterSpacing: -0.5,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    fontFamily: FONTS.display,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  apodoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  apodoText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: FONTS.bodyBold,
  },
  role: {
    fontSize: 12,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  userId: {
    fontSize: 11,
    fontFamily: FONTS.bodyRegular,
    opacity: 0.5,
    marginTop: 4,
  },
  menu: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  menuTitle: {
    fontSize: 11,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  menuItemLast: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    marginBottom: 2,
  },
  menuValue: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
  },
  menuValueMuted: {
    fontStyle: 'italic',
    fontWeight: '400',
  },
  menuValueSensitive: {
    fontFamily: 'monospace',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  legalContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  legalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },
  legalText: {
    fontSize: 11,
    fontFamily: FONTS.bodySemiBold,
    textDecorationLine: 'underline',
  },
  legalSeparator: {
    width: 1,
    height: 16,
    opacity: 0.3,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 5,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: FONTS.bodyBold,
    letterSpacing: -0.2,
  },
  version: {
    fontSize: 11,
    fontFamily: FONTS.bodyRegular,
    textAlign: 'center',
    marginTop: 24,
    opacity: 0.5,
  },
});
