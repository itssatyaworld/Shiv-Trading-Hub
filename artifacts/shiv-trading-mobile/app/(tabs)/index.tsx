import React from 'react';
import {
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import {
  BrandMark,
  CategoryPill,
  ProductCard,
  SectionTitle,
  SolidButton,
  SoftButton,
} from '@/components/BrandUI';
import { brands, categories, products, useApp } from '@/lib/store';

const PHONE = '+917991157051';

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { language, labels } = useApp();

  const whatsapp = () =>
    Linking.openURL(
      `https://wa.me/${PHONE}?text=${encodeURIComponent(
        'Hello Shiv Trading Agency, I would like to enquire about wholesale lubricants.',
      )}`,
    );

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + (Platform.OS === 'web' ? 67 : 18) },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <BrandMark />
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push('/(tabs)/profile')}
            style={[styles.iconButton, { backgroundColor: colors.card }]}
            testID="home-profile"
          >
            <Ionicons name="person-outline" size={19} color={colors.foreground} />
          </Pressable>
          <Pressable
            onPress={whatsapp}
            style={[styles.iconButton, { backgroundColor: colors.accent }]}
            testID="home-whatsapp"
          >
            <Ionicons name="logo-whatsapp" size={19} color={colors.accentForeground} />
          </Pressable>
        </View>
      </View>

      <LinearGradient
        colors={[colors.primary, '#c65d13']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.hero}
      >
        <View style={styles.heroGlow} />
        <Text style={styles.eyebrow}>PATNA • BIHAR • INDIA</Text>
        <Text style={styles.heroTitle}>
          Multi-brand lubricants{'\n'}for businesses across Bihar.
        </Text>
        <Text style={styles.heroBody}>
          Wholesale supply for retailers, workshops, fleet operators and
          commercial vehicle businesses.
        </Text>
        <View style={styles.heroButtons}>
          <SolidButton
            label={labels.browseProducts}
            onPress={() => router.push('/(tabs)/products')}
            variant="light"
            testID="browse-products"
          />
          <SoftButton
            label={labels.requestPrice}
            onPress={() => router.push('/(tabs)/enquiry')}
            variant="light"
            testID="request-price"
          />
        </View>
      </LinearGradient>

      <View style={styles.quickActions}>
        <Pressable
          onPress={whatsapp}
          style={[styles.quickAction, { backgroundColor: colors.card }]}
          testID="whatsapp-us"
        >
          <Ionicons name="logo-whatsapp" size={20} color="#26a269" />
          <Text style={[styles.quickLabel, { color: colors.foreground }]}>
            {labels.whatsapp}
          </Text>
        </Pressable>
        <Pressable
          onPress={() => Linking.openURL(`tel:${PHONE}`)}
          style={[styles.quickAction, { backgroundColor: colors.card }]}
          testID="call-now"
        >
          <Ionicons name="call-outline" size={20} color={colors.primary} />
          <Text style={[styles.quickLabel, { color: colors.foreground }]}>
            {labels.callNow}
          </Text>
        </Pressable>
      </View>

      <SectionTitle title={labels.categories} action={labels.viewAll} onPress={() => router.push('/(tabs)/products')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
        {categories.slice(0, 6).map((category) => (
          <CategoryPill key={category} label={category} />
        ))}
      </ScrollView>

      <SectionTitle title={labels.brands} action={labels.viewAll} onPress={() => router.push('/(tabs)/products')} />
      <View style={styles.brandGrid}>
        {brands.map((brand, index) => (
          <Pressable
            key={brand}
            onPress={() => router.push({ pathname: '/(tabs)/products', params: { brand } })}
            style={[styles.brandTile, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <View style={[styles.brandDot, { backgroundColor: index === 1 ? colors.primary : colors.secondary }]}>
              <Text style={[styles.brandInitial, { color: index === 1 ? colors.primaryForeground : colors.foreground }]}>
                {brand[0]}
              </Text>
            </View>
            <Text style={[styles.brandName, { color: colors.foreground }]}>{brand}</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.mutedForeground} />
          </Pressable>
        ))}
      </View>

      <SectionTitle title={labels.featured} action={labels.viewAll} onPress={() => router.push('/(tabs)/products')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontalList}>
        {products.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            compact
            onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })}
          />
        ))}
      </ScrollView>

      <LinearGradient colors={[colors.secondary, colors.card]} style={styles.vehicleCard}>
        <View style={styles.vehicleIcon}>
          <Ionicons name="bus-outline" size={26} color={colors.primary} />
        </View>
        <View style={styles.vehicleCopy}>
          <Text style={[styles.vehicleKicker, { color: colors.primary }]}>BUILT FOR THE ROAD</Text>
          <Text style={[styles.vehicleTitle, { color: colors.foreground }]}>Commercial vehicle solutions</Text>
          <Text style={[styles.vehicleBody, { color: colors.mutedForeground }]}>
            Explore lubricant categories for trucks, buses, fleets and transport businesses.
          </Text>
          <Pressable onPress={() => router.push('/(tabs)/products')} testID="vehicle-solutions">
            <Text style={[styles.link, { color: colors.primary }]}>{labels.exploreProducts}  →</Text>
          </Pressable>
        </View>
      </LinearGradient>

      <View style={[styles.processCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <SectionTitle title={labels.howItWorks} />
        {['Browse verified catalogue', 'Add products to your enquiry', 'We confirm price, quantity and delivery'].map((step, index) => (
          <View key={step} style={styles.stepRow}>
            <View style={[styles.stepNumber, { backgroundColor: colors.accent }]}>
              <Text style={[styles.stepNumberText, { color: colors.accentForeground }]}>0{index + 1}</Text>
            </View>
            <Text style={[styles.stepText, { color: colors.foreground }]}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.contactCard, { backgroundColor: colors.navy ?? '#10243d' }]}>
        <Text style={styles.contactKicker}>SHIV TRADING AGENCY</Text>
        <Text style={styles.contactTitle}>Wholesale supply, handled personally.</Text>
        <Text style={styles.contactBody}>Patna, Bihar · Serving businesses across Bihar</Text>
        <View style={styles.contactButtons}>
          <SolidButton label={labels.whatsapp} onPress={whatsapp} variant="light" />
          <SoftButton label={labels.callNow} onPress={() => Linking.openURL(`tel:${PHONE}`)} variant="light" />
        </View>
      </View>

      <Text style={[styles.demoNote, { color: colors.mutedForeground }]}>
        Catalogue data is structured for admin updates. Product prices, stock and specifications appear only when entered and verified by Shiv Trading Agency.
      </Text>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingBottom: 92, gap: 22 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerActions: { flexDirection: 'row', gap: 10 },
  iconButton: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: 24, padding: 22, minHeight: 305, overflow: 'hidden', justifyContent: 'flex-end' },
  heroGlow: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.10)', right: -60, top: -55 },
  eyebrow: { color: 'rgba(255,255,255,0.75)', fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.6, marginBottom: 12 },
  heroTitle: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 29, lineHeight: 35, letterSpacing: -0.8 },
  heroBody: { color: 'rgba(255,255,255,0.82)', fontFamily: 'Inter_400Regular', fontSize: 14, lineHeight: 21, marginTop: 14, maxWidth: 290 },
  heroButtons: { flexDirection: 'row', gap: 9, marginTop: 22, flexWrap: 'wrap' },
  quickActions: { flexDirection: 'row', gap: 10 },
  quickAction: { flex: 1, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 8, elevation: 1 },
  quickLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  horizontalList: { gap: 10, paddingRight: 16 },
  brandGrid: { gap: 10 },
  brandTile: { borderWidth: 1, borderRadius: 16, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  brandDot: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  brandInitial: { fontFamily: 'Inter_700Bold', fontSize: 18 },
  brandName: { fontFamily: 'Inter_700Bold', fontSize: 14, flex: 1, letterSpacing: 0.4 },
  vehicleCard: { borderRadius: 20, padding: 18, flexDirection: 'row', gap: 14, overflow: 'hidden' },
  vehicleIcon: { width: 50, height: 50, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  vehicleCopy: { flex: 1 },
  vehicleKicker: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2 },
  vehicleTitle: { fontFamily: 'Inter_700Bold', fontSize: 18, marginTop: 6 },
  vehicleBody: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: 6 },
  link: { fontFamily: 'Inter_700Bold', fontSize: 13, marginTop: 12 },
  processCard: { borderRadius: 20, borderWidth: 1, padding: 16, gap: 16 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  stepNumber: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stepNumberText: { fontFamily: 'Inter_700Bold', fontSize: 11 },
  stepText: { fontFamily: 'Inter_500Medium', fontSize: 13, flex: 1 },
  contactCard: { borderRadius: 22, padding: 20, gap: 8 },
  contactKicker: { color: '#ffab62', fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.4 },
  contactTitle: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 22, lineHeight: 28, marginTop: 4 },
  contactBody: { color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter_400Regular', fontSize: 13 },
  contactButtons: { flexDirection: 'row', gap: 9, marginTop: 12, flexWrap: 'wrap' },
  demoNote: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, textAlign: 'center', paddingHorizontal: 8 },
});