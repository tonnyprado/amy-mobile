// src/screens/repartidor/ProfileScreen.js
// Pantalla 4 - Perfil y Configuración

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import SectionShell from '../../components/repartidor/SectionShell';
import Icon from '../../components/repartidor/Icon';
import { FONTS, getTheme, DEFAULT_PALETTE } from '../../theme/repartidorTheme';

export default function ProfileScreen({ route, navigation }) {
  const { user, logout } = useAuth();
  const theme = getTheme(DEFAULT_PALETTE);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            logout();
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'user',
      label: 'Información personal',
      value: user?.nombre || 'Usuario',
      onPress: () => Alert.alert('Información', 'Funcionalidad próximamente'),
    },
    {
      icon: 'mail',
      label: 'Correo electrónico',
      value: user?.email || 'No disponible',
      onPress: () => Alert.alert('Correo', user?.email || 'No disponible'),
    },
    {
      icon: 'phone',
      label: 'Teléfono',
      value: user?.telefono || 'No disponible',
      onPress: () => Alert.alert('Teléfono', user?.telefono || 'No disponible'),
    },
    {
      icon: 'bell',
      label: 'Notificaciones',
      value: 'Activadas',
      onPress: () => Alert.alert('Notificaciones', 'Funcionalidad próximamente'),
    },
  ];

  return (
    <SectionShell bg={theme.accent} label="" theme={theme} padded={false}>
      {/* Botón de cerrar */}
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
              {user?.nombre?.substring(0, 2).toUpperCase() || 'US'}
            </Text>
          </View>
          <Text style={[styles.name, { color: theme.ink }]}>
            {user?.nombre || 'Usuario'}
          </Text>
          <Text style={[styles.role, { color: theme.ink }]}>
            {user?.rol === 'REPARTIDOR' ? 'Repartidor' : user?.rol || 'Usuario'}
          </Text>
        </View>

        {/* Menú de opciones */}
        <View style={[styles.menu, { backgroundColor: theme.canvas }]}>
          <Text style={[styles.menuTitle, { color: theme.muted }]}>
            CONFIGURACIÓN
          </Text>
          
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                { borderBottomColor: theme.border },
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.menuIcon, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Icon name={item.icon} size={18} color={theme.ink} />
                </View>
                <View style={styles.menuItemText}>
                  <Text style={[styles.menuLabel, { color: theme.ink }]}>
                    {item.label}
                  </Text>
                  {item.value && (
                    <Text style={[styles.menuValue, { color: theme.muted }]}>
                      {item.value}
                    </Text>
                  )}
                </View>
              </View>
              <Icon name="chevron-right" size={18} color={theme.muted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Botón de cerrar sesión */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: theme.ink }]}
          onPress={handleLogout}
        >
          <Icon name="log-out" size={18} color={theme.accent} strokeWidth={2.2} />
          <Text style={[styles.logoutText, { color: theme.accent }]}>
            Cerrar sesión
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
    marginBottom: 32,
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
    fontSize: 24,
    fontWeight: '700',
    fontFamily: FONTS.display,
    letterSpacing: -0.6,
    marginBottom: 4,
  },
  role: {
    fontSize: 13,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    opacity: 0.7,
  },
  menu: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  menuTitle: {
    fontSize: 10.5,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
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
    fontSize: 14,
    fontWeight: '600',
    fontFamily: FONTS.bodySemiBold,
    marginBottom: 2,
  },
  menuValue: {
    fontSize: 12,
    fontFamily: FONTS.bodyRegular,
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
