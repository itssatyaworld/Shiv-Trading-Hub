import React from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { ProductPlaceholder, SolidButton, SoftButton } from '@/components/BrandUI';
import { getProduct, useApp } from '@/lib/store';

const PHONE = '+917991157051';

export default function ProductDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addToCart, language } = useApp();
  const product = getProduct(id);

  if (!product) {
    return (
      <View style={[styles.missing, { backgroundColor: colors.background }]}>
        <Text style={[styles.missingTitle, { color: colors.foreground }]}>Product not found</Text>
        <Pressable onPress={() => router.back()}><Text style={[styles.backText, { color: colors.primary }]}>Go back</Text></Pressable>
      </View>
    );
  }

  const whatsapp = () => Linking.openURL(`https://wa.me/${PHONE}?text=${encodeURIComponent(`Hello Shiv Trading Agency, I am interested in ${product.name}. Please share the wholesale price and availability.`)}`);
  const add = () => {
    addToCart(product.id);
    Alert.alert(language === 'hi' ? 'पूछताछ में जोड़ा गया' : 'Added to enquiry', product.name);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={[styles.content, { paddingTop: insets.top + 12 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Pressable onPress={() => router.back()} style={[styles.backButton, { backgroundColor: colors.card }]}><Ionicons name="arrow-back" size={20} color={colors.foreground} /></Pressable>
          <Text style={[styles.topLabel, { color: colors.mutedForeground }]}>PRODUCT DETAIL</Text>
          <View style={{ width: 40 }} />
        </View>
        <ProductPlaceholder />
        <View style={styles.meta}>
          <Text style={[styles.brand, { color: colors.primary }]}>{product.brand}</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>{product.name}</Text>
          <View style={styles.infoRow}>
            <View style={[styles.infoChip, { backgroundColor: colors.secondary }]}><Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>CATEGORY</Text><Text style={[styles.infoValue, { color: colors.foreground }]}>{product.category}</Text></View>
            <View style={[styles.infoChip, { backgroundColor: colors.secondary }]}><Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>STATUS</Text><Text style={[styles.infoValue, { color: colors.foreground }]}>To be confirmed</Text></View>
          </View>
        </View>
        <View style={[styles.notice, { backgroundColor: colors.accent }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
          <Text style={[styles.noticeText, { color: colors.accentForeground }]}>Wholesale price, quantity and availability are confirmed by Shiv Trading Agency after enquiry.</Text>
        </View>
        <SolidButton label={language === 'hi' ? 'पूछताछ में जोड़ें' : 'Add to enquiry'} onPress={add} testID="detail-add" />
        <SoftButton label={language === 'hi' ? 'व्हाट्सऐप से पूछें' : 'Enquire on WhatsApp'} onPress={whatsapp} testID="detail-whatsapp" />
        <Text style={[styles.footerNote, { color: colors.mutedForeground }]}>Product image and verified specifications can be updated by the catalogue manager.</Text>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingBottom: 40, gap: 13 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  backButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  topLabel: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.3 },
  meta: { gap: 5, marginTop: 4 },
  brand: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1.6 },
  name: { fontFamily: 'Inter_700Bold', fontSize: 28, lineHeight: 34, letterSpacing: -0.6 },
  infoRow: { flexDirection: 'row', gap: 8, marginTop: 10 },
  infoChip: { flex: 1, borderRadius: 12, padding: 11, gap: 4 },
  infoLabel: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.7 },
  infoValue: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  notice: { borderRadius: 14, padding: 13, flexDirection: 'row', gap: 9, alignItems: 'flex-start', marginTop: 4 },
  noticeText: { fontFamily: 'Inter_500Medium', fontSize: 12, lineHeight: 18, flex: 1 },
  footerNote: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, textAlign: 'center', marginTop: 7 },
  missing: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  missingTitle: { fontFamily: 'Inter_700Bold', fontSize: 20 },
  backText: { fontFamily: 'Inter_700Bold', fontSize: 14 },
});