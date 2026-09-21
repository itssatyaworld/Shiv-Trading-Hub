import React, { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { BrandMark, ProductPlaceholder, SolidButton, SectionTitle } from '@/components/BrandUI';
import { getProduct, products, useApp } from '@/lib/store';

const PHONE = '+917991157051';

export default function EnquiryScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { cart, profile, setQuantity, removeFromCart, submitOrder, labels, language } = useApp();
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const items = useMemo(() => cart.map((item) => ({ ...item, product: getProduct(item.productId) ?? products[0] })), [cart]);

  const submit = () => {
    if (!profile.name || !profile.phone || !profile.business) {
      Alert.alert('Profile details needed', 'Please save your name, business and phone in Profile before sending an enquiry.');
      return;
    }
    submitOrder(message);
    setMessage('');
    setSubmitted(true);
  };
  const whatsapp = () => {
    const itemText = items.map((item) => `${item.product.name} x ${item.quantity}`).join(', ');
    Linking.openURL(`https://wa.me/${PHONE}?text=${encodeURIComponent(`Hello Shiv Trading Agency, I would like to enquire about: ${itemText || 'wholesale lubricants'}. Please share the wholesale price and availability.`)}`);
  };

  if (submitted) {
    return (
      <View style={[styles.success, { backgroundColor: colors.background, paddingTop: insets.top + 24 }]}>
        <View style={[styles.successIcon, { backgroundColor: colors.accent }]}><Ionicons name="checkmark" size={38} color={colors.primary} /></View>
        <Text style={[styles.successTitle, { color: colors.foreground }]}>{language === 'hi' ? 'पूछताछ भेज दी गई' : 'Enquiry submitted'}</Text>
        <Text style={[styles.successBody, { color: colors.mutedForeground }]}>Shiv Trading Agency will confirm wholesale pricing, quantity and availability with you.</Text>
        <SolidButton label={labels.whatsapp} onPress={whatsapp} />
        <Pressable onPress={() => setSubmitted(false)}><Text style={[styles.link, { color: colors.primary }]}>Start another enquiry</Text></Pressable>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollViewCompat style={{ backgroundColor: colors.background }} contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]} bottomOffset={20}>
      <View style={styles.header}><BrandMark /><View style={[styles.cartBadge, { backgroundColor: colors.accent }]}><Ionicons name="clipboard-outline" size={15} color={colors.primary} /><Text style={[styles.cartBadgeText, { color: colors.accentForeground }]}>{cart.length}</Text></View></View>
      <Text style={[styles.title, { color: colors.foreground }]}>{labels.enquiry}</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Build a wholesale request and we’ll get back to you directly.</Text>
      {!items.length ? (
        <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.emptyIcon, { backgroundColor: colors.secondary }]}><Ionicons name="clipboard-outline" size={28} color={colors.primary} /></View>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>Your enquiry is empty</Text>
          <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>Add products from the catalogue to request wholesale pricing.</Text>
          <SolidButton label={labels.browseProducts} onPress={() => router.push('/(tabs)/products')} />
        </View>
      ) : (
        <>
          <SectionTitle title={`Selected products · ${items.length}`} />
          <View style={styles.items}>
            {items.map(({ product, productId, quantity }) => (
              <View key={productId} style={[styles.item, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <ProductPlaceholder compact />
                <View style={styles.itemCopy}>
                  <Text style={[styles.itemBrand, { color: colors.primary }]}>{product.brand}</Text>
                  <Text style={[styles.itemName, { color: colors.foreground }]} numberOfLines={2}>{product.name}</Text>
                  <View style={styles.qtyRow}>
                    <Pressable onPress={() => setQuantity(productId, quantity - 1)} style={[styles.qtyButton, { backgroundColor: colors.secondary }]}><Ionicons name="remove" size={14} color={colors.foreground} /></Pressable>
                    <Text style={[styles.qty, { color: colors.foreground }]}>{quantity}</Text>
                    <Pressable onPress={() => setQuantity(productId, quantity + 1)} style={[styles.qtyButton, { backgroundColor: colors.secondary }]}><Ionicons name="add" size={14} color={colors.foreground} /></Pressable>
                    <Pressable onPress={() => removeFromCart(productId)} style={styles.remove}><Ionicons name="trash-outline" size={16} color={colors.destructive} /></Pressable>
                  </View>
                </View>
              </View>
            ))}
          </View>
          <View style={[styles.notice, { backgroundColor: colors.accent }]}><Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} /><Text style={[styles.noticeText, { color: colors.accentForeground }]}>Wholesale prices will be confirmed by Shiv Trading Agency. No payment is processed in this app.</Text></View>
          <SectionTitle title="Add a note" />
          <TextInput value={message} onChangeText={setMessage} multiline placeholder="Tell us about your quantity, delivery area or requirements" placeholderTextColor={colors.mutedForeground} style={[styles.textarea, { borderColor: colors.border, backgroundColor: colors.card, color: colors.foreground }]} />
          <SolidButton label={labels.submit} onPress={submit} testID="submit-enquiry" />
          <Pressable onPress={whatsapp} style={[styles.whatsappButton, { backgroundColor: '#e6f6ed' }]}><Ionicons name="logo-whatsapp" size={18} color="#198754" /><Text style={styles.whatsappText}>Send this enquiry on WhatsApp</Text></Pressable>
        </>
      )}
      <View style={{ height: 35 }} />
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingBottom: 90, gap: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cartBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 5 },
  cartBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 11 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 29, letterSpacing: -0.7 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: -8 },
  items: { gap: 10 },
  item: { borderWidth: 1, borderRadius: 17, padding: 10, flexDirection: 'row', gap: 11 },
  itemCopy: { flex: 1, justifyContent: 'space-between', paddingVertical: 2 },
  itemBrand: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 1.1 },
  itemName: { fontFamily: 'Inter_700Bold', fontSize: 13, lineHeight: 18, marginTop: 3 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 9, marginTop: 8 },
  qtyButton: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  qty: { fontFamily: 'Inter_700Bold', fontSize: 13, minWidth: 16, textAlign: 'center' },
  remove: { marginLeft: 'auto', padding: 5 },
  notice: { borderRadius: 13, padding: 12, flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  noticeText: { fontFamily: 'Inter_500Medium', fontSize: 11, lineHeight: 17, flex: 1 },
  textarea: { borderWidth: 1, borderRadius: 13, minHeight: 86, padding: 13, textAlignVertical: 'top', fontFamily: 'Inter_400Regular', fontSize: 13 },
  whatsappButton: { borderRadius: 12, paddingVertical: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  whatsappText: { color: '#198754', fontFamily: 'Inter_700Bold', fontSize: 12 },
  empty: { borderWidth: 1, borderRadius: 20, alignItems: 'center', padding: 26, gap: 10, marginTop: 10 },
  emptyIcon: { width: 62, height: 62, borderRadius: 21, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  emptyBody: { fontFamily: 'Inter_400Regular', fontSize: 12, lineHeight: 18, textAlign: 'center', marginBottom: 4 },
  success: { flex: 1, paddingHorizontal: 25, alignItems: 'center', justifyContent: 'center', gap: 15 },
  successIcon: { width: 78, height: 78, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontFamily: 'Inter_700Bold', fontSize: 25, textAlign: 'center' },
  successBody: { fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: 8 },
  link: { fontFamily: 'Inter_700Bold', fontSize: 13 },
});