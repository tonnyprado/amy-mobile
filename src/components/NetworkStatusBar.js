/**
 * Componente visual para mostrar el estado de la red y operaciones offline
 * Proporciona feedback visual al usuario sobre conectividad y sincronización
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import Icon from './repartidor/Icon';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

export default function NetworkStatusBar({ theme, onPress }) {
  const {
    isOnline,
    isOffline,
    connectionType,
    isExpensive,
    isSyncing,
    pendingOperations,
    hasPendingOperations,
    syncPendingOperations,
  } = useNetworkStatus({
    autoSync: true,
    syncInterval: 30000,
  });

  const [pulseAnim] = React.useState(new Animated.Value(1));

  React.useEffect(() => {
    if (isSyncing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSyncing, pulseAnim]);

  if (isOnline && !hasPendingOperations && !isSyncing) {
    return null;
  }

  const getStatusConfig = () => {
    if (isSyncing) {
      return {
        icon: 'refresh-cw',
        text: 'Sincronizando...',
        bg: theme?.accent || '#FFB800',
        fg: theme?.ink || '#1A1A1A',
        showPending: true,
      };
    }

    if (isOffline) {
      return {
        icon: 'wifi-off',
        text: 'Sin conexión',
        bg: '#FF3B30',
        fg: '#FFFFFF',
        showPending: true,
      };
    }

    if (hasPendingOperations) {
      return {
        icon: 'cloud-upload',
        text: 'Pendiente de sincronizar',
        bg: theme?.accent || '#FFB800',
        fg: theme?.ink || '#1A1A1A',
        showPending: true,
      };
    }

    return null;
  };

  const config = getStatusConfig();
  if (!config) return null;

  const handlePress = () => {
    if (onPress) {
      onPress({ isOnline, pendingOperations, isSyncing });
    } else if (!isSyncing && hasPendingOperations && isOnline) {
      syncPendingOperations();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: config.bg }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.iconWrapper,
            isSyncing && { transform: [{ scale: pulseAnim }] },
          ]}
        >
          <Icon
            name={config.icon}
            size={14}
            color={config.fg}
            strokeWidth={2}
          />
        </Animated.View>

        <View style={styles.textContainer}>
          <Text style={[styles.statusText, { color: config.fg }]}>
            {config.text}
          </Text>
          {config.showPending && pendingOperations > 0 && (
            <Text style={[styles.pendingText, { color: config.fg }]}>
              {pendingOperations} {pendingOperations === 1 ? 'operación' : 'operaciones'}
            </Text>
          )}
        </View>

        {isExpensive && isOnline && (
          <View style={styles.expensiveBadge}>
            <Icon name="smartphone" size={10} color={config.fg} strokeWidth={2} />
            <Text style={[styles.expensiveText, { color: config.fg }]}>
              DATOS
            </Text>
          </View>
        )}

        {!isSyncing && hasPendingOperations && isOnline && (
          <Icon
            name="chevron-right"
            size={14}
            color={config.fg}
            strokeWidth={2.4}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  pendingText: {
    fontSize: 11,
    opacity: 0.8,
    marginTop: 1,
  },
  expensiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  expensiveText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
