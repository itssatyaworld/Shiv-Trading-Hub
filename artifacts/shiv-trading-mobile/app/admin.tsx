import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/expo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BrandMark, SectionTitle, SolidButton, SoftButton } from '@/components/BrandUI';
import { useColors } from '@/hooks/useColors';

type AdminProduct = { id: number; name: string; slug: string; brand: string; category: string; imageUrl?: string | null; availability?: string | null };
type AdminOrder = { id: number; status: string; createdAt: string; items: Array<{ productName: string; quantity: number }> };
type AdminCustomer = { id: number; name: string; businessName: string; phone: string; city: string };
type AdminEnquiry = { id: number; customerId: number; status: string; message?: string | null; createdAt: string };
type Option = { id: number; name: string };

const statuses = ['NEW', 'CONTACTED', 'QUOTED', 'CONFIRMED', 'PROCESSING', 'DISPATCHED', 'COMPLETED', 'CANCELLED'];

export default function AdminScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isSignedIn, getToken } = useAuth();
  const [error, setError] = useState('');
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [enquiries, setEnquiries] = useState<AdminEnquiry[]>([]);
  const [brands, setBrands] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [brandId, setBrandId] = useState<number>();
  const [categoryId, setCategoryId] = useState<number>();
  const [imageUrl, setImageUrl] = useState('');

  const request = useCallback(async (path: string, options: RequestInit = {}) => {
    const token = await getToken();
    const response = await fetch(`https://${process.env.EXPO_PUBLIC_DOMAIN}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers ?? {}) },
    });
    const body = await response.text();
    const data = body ? JSON.parse(body) : null;
    if (!response.ok) throw new Error(data?.error ?? `Request failed (${response.status})`);
    return data;
  }, [getToken]);

  const load = useCallback(async () => {
    try {
      const [nextProducts, nextOrders, nextCustomers, nextEnquiries, nextBrands, nextCategories] = await Promise.all([
        request('/api/admin/products'),
        request('/api/admin/orders'),
        request('/api/admin/customers'),
        request('/api/admin/enquiries'),
        request('/api/admin/brands'),
        request('/api/admin/categories'),
      ]);
      setProducts(nextProducts);
      setOrders(nextOrders);
      setCustomers(nextCustomers);
      setEnquiries(nextEnquiries);
      setBrands(nextBrands);
      setCategories(nextCategories);
      setBrandId((current) => current ?? nextBrands[0]?.id);
      setCategoryId((current) => current ?? nextCategories[0]?.id);
      setError('');
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Admin access is unavailable.');
    }
  }, [request]);

  useEffect(() => { if (isSignedIn) void load(); }, [isSignedIn, load]);

  const addProduct = async () => {
    if (!name.trim() || !slug.trim() || !brandId || !categoryId) return;
    try {
      await request('/api/admin/products', { method: 'POST', body: JSON.stringify({ name: name.trim(), slug: slug.trim(), brandId, categoryId, imageUrl: imageUrl.trim() || null }) });
      setName(''); setSlug(''); setImageUrl('');
      await load();
      Alert.alert('Product added', 'The product is now available in the catalogue.');
    } catch (addError) {
      Alert.alert('Could not add product', addError instanceof Error ? addError.message : 'Please try again.');
    }
  };

  const updateStatus = async (order: AdminOrder) => {
    const next = statuses[(statuses.indexOf(order.status) + 1) % statuses.length];
    try { await request(`/api/admin/orders/${order.id}/status`, { method: 'PATCH', body: JSON.stringify({ status: next }) }); await load(); }
    catch (statusError) { Alert.alert('Could not update order', statusError instanceof Error ? statusError.message : 'Please try again.'); }
  };

  if (!isSignedIn) {
    return <View style={[styles.center, { backgroundColor: colors.background }]}><Text style={[styles.title, { color: colors.foreground }]}>Admin sign-in required</Text><SolidButton label="Sign in" onPress={() => router.push('/(auth)/sign-in')} /></View>;
  }

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]}>
      <View style={styles.header}><BrandMark /><SoftButton label="Back" onPress={() => router.back()} /></View>
      <Text style={[styles.title, { color: colors.foreground }]}>Admin console</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Secure management for Shiv Trading Agency catalogue and wholesale requests.</Text>
      {error ? <View style={[styles.errorBox, { backgroundColor: '#fde9e9' }]}><Text style={styles.error}>{error}</Text></View> : null}
      <SectionTitle title={`Products · ${products.length}`} />
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TextInput value={name} onChangeText={setName} placeholder="Product name" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
        <TextInput value={slug} onChangeText={setSlug} placeholder="Unique slug" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
        <TextInput value={imageUrl} onChangeText={setImageUrl} placeholder="Verified image URL (optional)" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, borderColor: colors.border }]} />
        <Text style={[styles.helper, { color: colors.mutedForeground }]}>Brand: {brands.find((option) => option.id === brandId)?.name ?? 'Select below'}</Text>
        <View style={styles.chips}>{brands.map((option) => <Pressable key={option.id} onPress={() => setBrandId(option.id)} style={[styles.chip, { backgroundColor: option.id === brandId ? colors.primary : colors.secondary }]}><Text style={{ color: option.id === brandId ? '#fff' : colors.foreground }}>{option.name}</Text></Pressable>)}</View>
        <Text style={[styles.helper, { color: colors.mutedForeground }]}>Category: {categories.find((option) => option.id === categoryId)?.name ?? 'Select below'}</Text>
        <View style={styles.chips}>{categories.slice(0, 6).map((option) => <Pressable key={option.id} onPress={() => setCategoryId(option.id)} style={[styles.chip, { backgroundColor: option.id === categoryId ? colors.primary : colors.secondary }]}><Text style={{ color: option.id === categoryId ? '#fff' : colors.foreground }}>{option.name}</Text></Pressable>)}</View>
        <SolidButton label="Add product" onPress={addProduct} />
      </View>
      {products.map((product) => <View key={product.id} style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.rowCopy}><Text style={[styles.rowTitle, { color: colors.foreground }]}>{product.name}</Text><Text style={[styles.helper, { color: colors.mutedForeground }]}>{product.brand} · {product.category}</Text></View><Pressable onPress={() => request(`/api/admin/products/${product.id}`, { method: 'DELETE' }).then(load).catch((deleteError) => Alert.alert('Could not remove product', deleteError instanceof Error ? deleteError.message : 'Please try again.'))}><Text style={styles.danger}>Remove</Text></Pressable></View>)}
      <SectionTitle title={`Orders · ${orders.length}`} />
      {orders.map((order) => <Pressable key={order.id} onPress={() => updateStatus(order)} style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.rowCopy}><Text style={[styles.rowTitle, { color: colors.foreground }]}>STA-{order.id}</Text><Text style={[styles.helper, { color: colors.mutedForeground }]}>{order.items.map((item) => `${item.productName} × ${item.quantity}`).join(', ')}</Text></View><Text style={[styles.status, { color: colors.primary }]}>{order.status}</Text></Pressable>)}
      <SectionTitle title={`Customers · ${customers.length}`} />
      {customers.slice(0, 10).map((customer) => <View key={customer.id} style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.rowCopy}><Text style={[styles.rowTitle, { color: colors.foreground }]}>{customer.businessName || customer.name || 'Customer'}</Text><Text style={[styles.helper, { color: colors.mutedForeground }]}>{customer.phone} · {customer.city}</Text></View></View>)}
      <SectionTitle title={`Enquiries · ${enquiries.length}`} />
      {enquiries.slice(0, 10).map((enquiry) => <View key={enquiry.id} style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}><View style={styles.rowCopy}><Text style={[styles.rowTitle, { color: colors.foreground }]}>Enquiry #{enquiry.id}</Text><Text style={[styles.helper, { color: colors.mutedForeground }]}>{enquiry.status} · {enquiry.message || 'No message'}</Text></View></View>)}
      <View style={{ height: 35 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingBottom: 90, gap: 14 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: 'Inter_700Bold', fontSize: 29, letterSpacing: -0.7 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: -8 },
  card: { borderWidth: 1, borderRadius: 17, padding: 13, gap: 10 },
  input: { minHeight: 44, borderWidth: 1, borderRadius: 11, paddingHorizontal: 12, fontFamily: 'Inter_400Regular' },
  helper: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 16 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 },
  row: { borderWidth: 1, borderRadius: 14, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowCopy: { flex: 1, gap: 2 },
  rowTitle: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  status: { fontFamily: 'Inter_700Bold', fontSize: 10 },
  danger: { color: '#b42318', fontFamily: 'Inter_700Bold', fontSize: 11 },
  errorBox: { borderRadius: 12, padding: 11 },
  error: { color: '#b42318', fontFamily: 'Inter_500Medium', fontSize: 12 },
});