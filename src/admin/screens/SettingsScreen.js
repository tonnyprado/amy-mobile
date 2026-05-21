/**
 * SettingsScreen - Pantalla de configuración para Admin
 * Reutiliza la estructura del ProfileScreen del repartidor pero con tema admin
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Animated,
} from 'react-native';
import { X, User, Mail, Phone, Bell, LogOut, ChevronRight } from 'lucide-react-native';
import { theme, FONTS, FONT_SIZES, SPACING, RADIUS, SHADOWS } from '../theme';
import { SectionShell } from '../components/primitives';

export default function SettingsScreen({ visible, onClose, user, onLogout }) {
  const slideAnim = React.useRef(new Animated.Value(1000)).current;

  React.useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        damping: 25,
        stiffness: 180,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.timing(slideAnim, {
      toValue: 1000,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Seguro que quieres salir?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí',
          style: 'destructive',
          onPress: () => {
            handleClose();
            setTimeout(() => {
              onLogout();
            }, 400);
          },
        },
      ],
      { cancelable: true }
    );
  };

  const menuItems = [
    {
      icon: User,
      label: 'Información personal',
      value: user?.nombre || 'Administrador',
      onPress: () => Alert.alert('Información', 'Funcionalidad próximamente'),
    },
    {
      icon: Mail,
      label: 'Correo electrónico',
      value: user?.email || 'No disponible',
      onPress: () => Alert.alert('Correo', user?.email || 'No disponible'),
    },
    {
      icon: Phone,
      label: 'Teléfono',
      value: user?.telefono || 'No disponible',
      onPress: () => Alert.alert('Teléfono', user?.telefono || 'No disponible'),
    },
    {
      icon: Bell,
      label: 'Notificaciones',
      value: 'Activadas',
      onPress: () => Alert.alert('Notificaciones', 'Funcionalidad próximamente'),
    },
  ];

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <SectionShell style={styles.shell}>
          {/* Botón de cerrar */}
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={theme.ink} strokeWidth={2.5} />
          </TouchableOpacity>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header con avatar */}
            <View style={styles.header}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user?.nombre?.substring(0, 2).toUpperCase() || 'AD'}
                </Text>
              </View>
              <Text style={styles.name}>{user?.nombre || 'Administrador'}</Text>
              <Text style={styles.role}>
                {user?.rol === 'ADMIN' ? 'Administrador' : user?.rol || 'Usuario'}
              </Text>
            </View>

            {/* Menú de opciones */}
            <View style={styles.menu}>
              <Text style={styles.menuTitle}>CONFIGURACIÓN</Text>

              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.menuItem,
                    index === menuItems.length - 1 && styles.menuItemLast,
                  ]}
                  onPress={item.onPress}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={styles.menuIcon}>
                      <item.icon size={18} color={theme.ink} strokeWidth={2.2} />
                    </View>
                    <View style={styles.menuItemText}>
                      <Text style={styles.menuLabel}>{item.label}</Text>
                      {item.value && (
                        <Text style={styles.menuValue}>{item.value}</Text>
                      )}
                    </View>
                  </View>
                  <ChevronRight size={18} color={theme.muted} strokeWidth={2.5} />
                </TouchableOpacity>
              ))}
            </View>

            {/* Botón de cerrar sesión */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <LogOut size={18} color={theme.surface} strokeWidth={2.2} />
              <Text style={styles.logoutText}>Cerrar sesión</Text>
            </TouchableOpacity>

            {/* Footer */}
            <Text style={styles.version}>AMY Admin Panel v1.0.0</Text>
          </ScrollView>
        </SectionShell>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  container: {
    flex: 1,
    backgroundColor: theme.canvas,
  },
  shell: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 54,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: theme.surface,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    ...SHADOWS.card,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: SPACING.xl,
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
    backgroundColor: theme.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    ...SHADOWS.card,
  },
  avatarText: {
    fontSize: 28,
    fontFamily: FONTS.displayBlack,
    letterSpacing: -0.5,
    color: theme.ink,
  },
  name: {
    fontSize: 24,
    fontFamily: FONTS.displayBlack,
    letterSpacing: -0.6,
    color: theme.ink,
    marginBottom: 4,
  },
  role: {
    fontSize: 13,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: theme.muted,
  },
  menu: {
    backgroundColor: theme.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.card,
  },
  menuTitle: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    color: theme.muted,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
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
    borderRadius: RADIUS.md,
    backgroundColor: theme.canvas,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuItemText: {
    flex: 1,
  },
  menuLabel: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bodySemibold,
    color: theme.ink,
    marginBottom: 2,
  },
  menuValue: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.body,
    color: theme.muted,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: theme.dangerFg,
    borderRadius: RADIUS.lg,
    gap: 10,
    ...SHADOWS.card,
  },
  logoutText: {
    fontSize: FONT_SIZES.base,
    fontFamily: FONTS.bodyBold,
    letterSpacing: -0.2,
    color: theme.surface,
  },
  version: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.body,
    textAlign: 'center',
    marginTop: 24,
    color: theme.muted,
  },
});
