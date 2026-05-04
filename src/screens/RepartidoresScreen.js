import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  RefreshControl
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { obtenerRepartidores } from '../services/adminApi';

export default function RepartidoresScreen({ navigation }) {
  const [repartidores, setRepartidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    cargarRepartidores();
  }, []);

  const cargarRepartidores = async () => {
    try {
      setLoading(true);
      const data = await obtenerRepartidores();
      setRepartidores(data);
    } catch (error) {
      console.error('Error cargando repartidores:', error);
      Alert.alert(
        'Error',
        'No se pudo cargar la lista de repartidores',
        [{ text: 'Reintentar', onPress: cargarRepartidores }]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await cargarRepartidores();
    setRefreshing(false);
  };

  const handleLlamar = (telefono, nombre) => {
    if (!telefono) {
      Alert.alert(
        'Sin Teléfono',
        `No hay número de teléfono registrado para ${nombre}`,
        [{ text: 'OK' }]
      );
      return;
    }

    const phoneNumber = telefono.replace(/\s+/g, ''); // Remover espacios

    Alert.alert(
      'Llamar a Repartidor',
      `¿Deseas llamar a ${nombre} al ${telefono}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Llamar',
          onPress: () => {
            Linking.openURL(`tel:${phoneNumber}`);
          }
        }
      ]
    );
  };

  const handleEnviarMensaje = (telefono, nombre) => {
    if (!telefono) {
      Alert.alert(
        'Sin Teléfono',
        `No hay número de teléfono registrado para ${nombre}`,
        [{ text: 'OK' }]
      );
      return;
    }

    const phoneNumber = telefono.replace(/\s+/g, ''); // Remover espacios
    const mensaje = 'Hola, te contacto desde AMY Business.';

    // URL para WhatsApp o SMS según la plataforma
    const whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(mensaje)}`;
    const smsUrl = Platform.OS === 'ios'
      ? `sms:${phoneNumber}&body=${encodeURIComponent(mensaje)}`
      : `sms:${phoneNumber}?body=${encodeURIComponent(mensaje)}`;

    Alert.alert(
      'Enviar Mensaje',
      `¿Cómo deseas contactar a ${nombre}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'WhatsApp',
          onPress: async () => {
            const canOpen = await Linking.canOpenURL(whatsappUrl);
            if (canOpen) {
              Linking.openURL(whatsappUrl);
            } else {
              Alert.alert('Error', 'No se pudo abrir WhatsApp');
            }
          }
        },
        {
          text: 'SMS',
          onPress: () => {
            Linking.openURL(smsUrl);
          }
        }
      ]
    );
  };

  const renderRepartidor = ({ item }) => {
    const telefono = item.telefono || item.email || 'Sin teléfono';
    const rutas = item.repartidor?.rutas?.join(', ') || 'Sin rutas asignadas';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {item.nombre.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Text style={styles.nombre}>{item.nombre}</Text>
            <Text style={styles.telefono}>📱 {telefono}</Text>
            <Text style={styles.rutas}>🚚 {rutas}</Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.callButton]}
            onPress={() => handleLlamar(item.telefono, item.nombre)}
          >
            <Text style={styles.actionIcon}>📞</Text>
            <Text style={styles.actionText}>Llamar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.messageButton]}
            onPress={() => handleEnviarMensaje(item.telefono, item.nombre)}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionText}>Mensaje</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backButtonText}>← Atrás</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Repartidores</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Cargando repartidores...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>← Atrás</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Repartidores</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{repartidores.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {repartidores.filter(r => r.repartidor?.rutas?.length > 0).length}
          </Text>
          <Text style={styles.statLabel}>Con Rutas</Text>
        </View>
      </View>

      {/* Lista de Repartidores */}
      <FlatList
        data={repartidores}
        renderItem={renderRepartidor}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2563eb"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyText}>No hay repartidores registrados</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#2563eb',
    paddingTop: 48,
    paddingBottom: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
  },
  placeholder: {
    width: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#64748b',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '800',
    color: '#2563eb',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#dbeafe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2563eb',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  nombre: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 4,
  },
  telefono: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  rutas: {
    fontSize: 13,
    color: '#64748b',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    gap: 8,
  },
  callButton: {
    backgroundColor: '#10b981',
  },
  messageButton: {
    backgroundColor: '#6366f1',
  },
  actionIcon: {
    fontSize: 18,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
});
