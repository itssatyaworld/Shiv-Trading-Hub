import React from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { BrandMark, SolidButton } from '@/components/BrandUI';
import { getProduct, useApp, type OrderStatus } from '@/lib/store';

const PHONE = '+917991157051';
const statuses: OrderStatus[] = ['NEW', 'CONTACTED', 'QUOTED', 'CONFIRMED', 'PROCESSING', 'DISPATCHED', 'COMPLETED', 'CANCELLED'];

function statusTone(status: OrderStatus) {
  if (status === 'COMPLETED') return { bg: '#e6f6ed', fg: '#198754' };
  if (status === 'CANCELLED') return { bg: '#fde9e9', fg: '#c94747' };
  if (status === 'QUOTED' || status === 'CONFIRMED') return { bg: '#fff0e2', fg: '#b95610' };
  return { bg: '#e8edf3', fg: '#506477' };
}

export default function OrdersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { orders, reorder, language } = useApp();

  const handleReorder = (order: (typeof orders)[number]) => {
    reorder(order);
    Alert.alert('Added to enquiry', 'The products and quantities are ready to review.');
    router.push('/(tabs)/enquiry');
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.header, { paddingTop: insets.top + 18 }]}>
        <BrandMark />
        <Pressable onPress={() => Linking.openURL(`tel:${PHONE}`)} style={[styles.call, { backgroundColor: colors.accent }]}>
          <Ionicons name="call-outline" size={17} color={colors.primary} />
        </Pressable>
      </View>
      <View style={styles.heading}>
        <Text style={[styles.title, { color: colors.foreground }]}>{language === 'hi' ? 'आपके ऑर्डर' : 'Your orders'}</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{language === 'hi' ? 'पूछताछ और ऑर्डर की स्थिति' : 'Track enquiries and wholesale requests'}</Text>
      </View>
      {!orders.length ? (
        <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}><Ionicons name="receipt-outline" size={28} color={colors.primary} /></View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No orders yet</Text>
          <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>Your submitted wholesale enquiries will appear here.</Text>
          <SolidButton label="Browse products" onPress={() => router.push('/(tabs)/products')} />
        </View>
      ) : (
        <View style={styles.list}>
          {orders.map((order) => {
            const tone = statusTone(order.status);
            const names = order.items.map((item) => `${getProduct(item.productId)?.name ?? 'Product'} × ${item.quantity}`);
            return (
              <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.orderTop}>
                  <View>
                    <Text style={[styles.orderId, { color: colors.foreground }]}>{order.id}</Text>
                    <Text style={[styles.date, { color: colors.mutedForeground }]}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
                  </View>
                  <View style={[styles.status, { backgroundColor: tone.bg }]}><Text style={[styles.statusText, { color: tone.fg }]}>{order.status}</Text></View>
                </View>
                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                {names.map((name) => <Text key={name} style={[styles.itemName, { color: colors.foreground }]} numberOfLines={1}>{name}</Text>)}
                <View style={styles.orderBottom}>
                  <Text style={[styles.confirmation, { color: colors.mutedForeground }]}>Price to be confirmed</Text>
                  {order.status === 'COMPLETED' ? <Pressable onPress={() => handleReorder(order)} style={[styles.reorder, { backgroundColor: colors.primary }]}><Ionicons name="repeat-outline" size={15} color={colors.primaryForeground} /><Text style={[styles.reorderText, { color: colors.primaryForeground }]}>Reorder</Text></Pressable> : null}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  call: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  heading: { paddingHorizontal: 18, marginTop: 22, marginBottom: 18, gap: 4 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 29, letterSpacing: -0.7 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13 },
  list: { paddingHorizontal: 18, gap: 11 },
  orderCard: { borderWidth: 1, borderRadius: 18, padding: 15, gap: 7 },
  orderTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  orderId: { fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 0.3 },
  date: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 3 },
  status: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 6 },
  statusText: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.4 },
  divider: { height: 1, marginVertical: 5 },
  itemName: { fontFamily: 'Inter_500Medium', fontSize: 12 },
  orderBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  confirmation: { fontFamily: 'Inter_400Regular', fontSize: 10 },
  reorder: { borderRadius: 9, paddingVertical: 7, paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', gap: 5 },
  reorderText: { fontFamily: 'Inter_700Bold', fontSize: 11 },
  empty: { marginHorizontal: 18, borderWidth: 1, borderRadius: 20, alignItems: 'center', padding: 26, gap: 10, marginTop: 18 },
  emptyIcon: { width: 62, height: 62, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  emptyBody: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, textAlign: 'center', marginBottom: 4 },
});