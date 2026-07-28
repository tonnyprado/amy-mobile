// src/screens/repartidor/OrdersScreen.js
// Pantalla 2 - Lista de pedidos del día con filtros y stats

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import SectionShell from '../../components/repartidor/SectionShell';
import SectionHeader from '../../components/repartidor/SectionHeader';
import PkgPlaceholder from '../../components/repartidor/PkgPlaceholder';
import Icon from '../../components/repartidor/Icon';
import DriverWarningBanner from '../../components/DriverWarningBanner';
import { FONTS } from '../../theme/repartidorTheme';

export default function OrdersScreen({ theme, pedidos = [], onPedidoPress }) {
  const [filter, setFilter] = useState('todos');

  const statusMap = {
    ENTREGADO: { label: 'Entregado', bg: theme.successBg, fg: theme.successFg, icon: 'check-check' },
    EN_RUTA: { label: 'En ruta', bg: theme.accent, fg: theme.ink, icon: 'navigation' },
    PENDIENTE: { label: 'Pendiente', bg: theme.canvas, fg: theme.muted, icon: 'clock' },
  };

  const counts = {
    todos: pedidos.length,
    entregados: pedidos.filter(o => o.estado === 'ENTREGADO').length,
    ruta: pedidos.filter(o => o.estado === 'EN_RUTA').length,
    pendientes: pedidos.filter(o => o.estado === 'PENDIENTE').length,
  };

  const filtered = useMemo(() => {
    if (filter === 'todos') return pedidos;
    const map = { entregados: 'ENTREGADO', ruta: 'EN_RUTA', pendientes: 'PENDIENTE' };
    return pedidos.filter(o => o.estado === map[filter]);
  }, [filter, pedidos]);

  const getTone = (index) => {
    const tones = ['a', 'b', 'c', 'd'];
    return tones[index % tones.length];
  };

  return (
    <SectionShell bg={theme.canvas} label="02 Pedidos" theme={theme} padded={false}>
      <View style={{ flex: 1, paddingTop: 56 }}>
        <SectionHeader
          theme={theme}
          kicker=""
          title={
            <>
              <Text>Pedidos{'\n'}del día</Text>
            </>
          }
          right={
            <View style={styles.cartBadge}>
              <Text style={[styles.cartLabel, { color: theme.muted }]}>CARRITO</Text>
              <Text style={[styles.cartValue, { color: theme.ink }]}>
                {String(pedidos.length).padStart(2, '0')}
              </Text>
            </View>
          }
        />

        <StatStrip theme={theme} counts={counts} statusMap={statusMap} />

        {/* Banner de advertencias para repartidores */}
        <DriverWarningBanner />

        <Filters theme={theme} counts={counts} filter={filter} setFilter={setFilter} />

        <FlatList
          data={filtered}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item, index }) => (
            <OrderCard
              order={item}
              theme={theme}
              statusMeta={statusMap[item.estado]}
              onPress={() => onPedidoPress?.(item)}
              tone={getTone(index)}
            />
          )}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={[styles.emptyText, { color: theme.muted }]}>
                No hay pedidos con este filtro
              </Text>
            </View>
          }
        />
      </View>
    </SectionShell>
  );
}

function StatStrip({ theme, counts, statusMap }) {
  const cells = [
    { k: 'Total', v: counts.todos, c: theme.ink, icon: 'package' },
    { k: 'Entregados', v: counts.entregados, c: theme.successFg, icon: 'check-circle-2' },
    { k: 'En ruta', v: counts.ruta, c: theme.accentInk, icon: 'truck' },
    { k: 'Pendientes', v: counts.pendientes, c: theme.muted, icon: 'clock' },
  ];

  return (
    <View style={[styles.statStrip, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {cells.map((s, i) => (
        <View
          key={s.k}
          style={[
            styles.statCell,
            i > 0 && { borderLeftWidth: 1, borderLeftColor: theme.border },
          ]}
        >
          <View style={styles.statIcon}>
            <Icon name={s.icon} size={13} color={s.c} strokeWidth={2} />
          </View>
          <Text style={[styles.statValue, { color: s.c }]}>
            {String(s.v).padStart(2, '0')}
          </Text>
          <Text style={[styles.statLabel, { color: theme.muted }]}>{s.k}</Text>
        </View>
      ))}
    </View>
  );
}

function Filters({ theme, counts, filter, setFilter }) {
  const opts = [
    ['todos', 'Todos', counts.todos],
    ['ruta', 'En ruta', counts.ruta],
    ['pendientes', 'Pendientes', counts.pendientes],
    ['entregados', 'Entregados', counts.entregados],
  ];

  return (
    <View style={styles.filters}>
      {opts.map(([k, label, n]) => (
        <TouchableOpacity
          key={k}
          style={[
            styles.filterChip,
            {
              backgroundColor: filter === k ? theme.ink : theme.surface,
              borderColor: filter === k ? theme.ink : theme.border,
            },
          ]}
          onPress={() => setFilter(k)}
        >
          <Text
            style={[
              styles.filterText,
              { color: filter === k ? theme.canvas : theme.ink },
            ]}
          >
            {label}
          </Text>
          <Text
            style={[
              styles.filterCount,
              { color: filter === k ? theme.canvas : theme.ink },
            ]}
          >
            {String(n).padStart(2, '0')}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function OrderCard({ order, theme, statusMeta, onPress, tone }) {
  const isActive = order.estado === 'EN_RUTA';

  return (
    <TouchableOpacity
      style={[
        styles.orderCard,
        {
          backgroundColor: isActive ? theme.ink : theme.surface,
          borderColor: theme.border,
          borderWidth: isActive ? 0 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <PkgPlaceholder
        tone={tone}
        size={62}
        label={`#${order.numeroPedido || order.id}`}
      />
      <View style={styles.orderInfo}>
        <View style={styles.orderMeta}>
          <Text
            style={[
              styles.orderCode,
              { color: isActive ? 'rgba(255,255,255,0.55)' : theme.muted },
            ]}
          >
            #{order.numeroPedido || order.id}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: statusMeta.bg },
            ]}
          >
            <Icon name={statusMeta.icon} size={9} color={statusMeta.fg} strokeWidth={2.4} />
            <Text style={[styles.statusText, { color: statusMeta.fg }]}>
              {statusMeta.label}
            </Text>
          </View>
        </View>
        <Text
          style={[
            styles.orderAddr,
            { color: isActive ? theme.canvas : theme.ink },
          ]}
        >
          {order.direccionConsultora || 'Sin dirección'}
        </Text>
        <Text
          style={[
            styles.orderDetails,
            { color: isActive ? 'rgba(255,255,255,0.65)' : theme.muted },
          ]}
        >
          {order.nombreConsultora || 'Cliente'}
        </Text>
        <View style={styles.orderStats}>
          <View style={styles.orderStat}>
            <Icon
              name="clock"
              size={11}
              color={isActive ? 'rgba(255,255,255,0.75)' : theme.muted}
            />
            <Text
              style={[
                styles.orderStatText,
                { color: isActive ? 'rgba(255,255,255,0.75)' : theme.muted },
              ]}
            >
              {order.horaEntrega || 'N/A'}
            </Text>
          </View>
          <View style={styles.orderStat}>
            <Icon
              name="package"
              size={11}
              color={isActive ? 'rgba(255,255,255,0.75)' : theme.muted}
            />
            <Text
              style={[
                styles.orderStatText,
                { color: isActive ? 'rgba(255,255,255,0.75)' : theme.muted },
              ]}
            >
              {order.cantidadProductos || 1} item(s)
            </Text>
          </View>
        </View>
      </View>
      <View
        style={[
          styles.chevron,
          {
            backgroundColor: isActive ? theme.accent : theme.canvas,
            borderColor: theme.border,
            borderWidth: isActive ? 0 : 1,
          },
        ]}
      >
        <Icon name="chevron-right" size={14} color={theme.ink} strokeWidth={2.4} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cartBadge: {
    alignItems: 'flex-end',
  },
  cartLabel: {
    fontSize: 10.5,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  cartValue: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: FONTS.bodyBold,
    lineHeight: 36,
  },
  statStrip: {
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 12,
    flexDirection: 'row',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  statCell: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statIcon: {
    marginBottom: 4,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
    fontFamily: FONTS.bodyBold,
  },
  statLabel: {
    fontSize: 9,
    marginTop: 4,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    fontFamily: FONTS.bodyBold,
  },
  filters: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: -0.1,
    fontFamily: FONTS.bodySemiBold,
  },
  filterCount: {
    fontSize: 10,
    fontFamily: FONTS.bodyBold,
    opacity: 0.75,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 120,
    gap: 10,
  },
  orderCard: {
    borderRadius: 18,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 0,
    elevation: 1,
  },
  orderInfo: {
    flex: 1,
    minWidth: 0,
  },
  orderMeta: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: 3,
    flexWrap: 'wrap',
  },
  orderCode: {
    fontSize: 10,
    fontFamily: FONTS.bodyBold,
    letterSpacing: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.4,
    fontFamily: FONTS.bodyBold,
    textTransform: 'uppercase',
  },
  orderAddr: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: 20,
    fontFamily: FONTS.display,
  },
  orderDetails: {
    fontSize: 12,
    marginTop: 2,
  },
  orderStats: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  orderStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  orderStatText: {
    fontSize: 11,
    fontFamily: FONTS.bodyRegular,
  },
  chevron: {
    width: 34,
    height: 34,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});
