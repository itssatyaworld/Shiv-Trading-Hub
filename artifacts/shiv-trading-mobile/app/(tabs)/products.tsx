import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { CategoryPill, ProductCard, BrandMark, SectionTitle } from '@/components/BrandUI';
import { useApp } from '@/lib/store';

export default function ProductsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ brand?: string }>();
  const { language, catalogue, brandOptions, categoryOptions } = useApp();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedBrand, setSelectedBrand] = useState<string | undefined>(params.brand);

  const filteredProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return catalogue.filter((product) => {
      const matchesQuery = !normalized || `${product.name} ${product.brand} ${product.category}`.toLowerCase().includes(normalized);
      return matchesQuery && (!selectedCategory || product.category === selectedCategory) && (!selectedBrand || product.brand === selectedBrand);
    });
  }, [catalogue, query, selectedCategory, selectedBrand]);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <BrandMark />
        <View style={[styles.catalogBadge, { backgroundColor: colors.accent }]}>
          <Ionicons name="layers-outline" size={15} color={colors.primary} />
          <Text style={[styles.catalogBadgeText, { color: colors.accentForeground }]}>CATALOGUE</Text>
        </View>
      </View>
      <View>
        <Text style={[styles.title, { color: colors.foreground }]}>{language === 'hi' ? 'उत्पाद कैटलॉग' : 'Product catalogue'}</Text>
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {language === 'hi' ? 'अपने व्यवसाय के लिए उत्पाद खोजें' : 'Find the right supply for your business'}
        </Text>
      </View>
      <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search-outline" size={19} color={colors.mutedForeground} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={language === 'hi' ? 'उत्पाद, ब्रांड या श्रेणी खोजें' : 'Search products, brands or categories'}
          placeholderTextColor={colors.mutedForeground}
          style={[styles.searchInput, { color: colors.foreground }]}
          testID="product-search"
        />
        {query ? <Pressable onPress={() => setQuery('')}><Ionicons name="close-circle" size={19} color={colors.mutedForeground} /></Pressable> : null}
      </View>
      <SectionTitle title={language === 'hi' ? 'ब्रांड' : 'Brands'} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>
        <CategoryPill label={language === 'hi' ? 'सभी' : 'All'} active={!selectedBrand} onPress={() => setSelectedBrand(undefined)} />
        {brandOptions.map((brand) => <CategoryPill key={brand} label={brand} active={selectedBrand === brand} onPress={() => setSelectedBrand(brand)} />)}
      </ScrollView>
      <SectionTitle title={language === 'hi' ? 'श्रेणी' : 'Category'} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.horizontal}>
        <CategoryPill label={language === 'hi' ? 'सभी' : 'All'} active={!selectedCategory} onPress={() => setSelectedCategory(undefined)} />
        {categoryOptions.map((category) => <CategoryPill key={category} label={category} active={selectedCategory === category} onPress={() => setSelectedCategory(category)} />)}
      </ScrollView>
      <View style={styles.resultHeader}>
        <Text style={[styles.resultCount, { color: colors.mutedForeground }]}>{filteredProducts.length} {language === 'hi' ? 'उत्पाद' : 'products'}</Text>
        {(selectedBrand || selectedCategory) ? <Pressable onPress={() => { setSelectedBrand(undefined); setSelectedCategory(undefined); }}><Text style={[styles.clear, { color: colors.primary }]}>Clear filters</Text></Pressable> : null}
      </View>
      <View style={styles.grid}>
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} onPress={() => router.push({ pathname: '/product/[id]', params: { id: product.id } })} />
        ))}
      </View>
      {!filteredProducts.length ? (
        <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={28} color={colors.mutedForeground} />
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No matching products</Text>
          <Text style={[styles.emptyBody, { color: colors.mutedForeground }]}>Try another search or clear the filters.</Text>
        </View>
      ) : null}
      <Text style={[styles.note, { color: colors.mutedForeground }]}>Prices, pack sizes, availability and verified product details are managed by Shiv Trading Agency and will appear when entered.</Text>
      <View style={{ height: 28 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingBottom: 95, gap: 16 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  catalogBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 5 },
  catalogBadgeText: { fontFamily: 'Inter_700Bold', fontSize: 9, letterSpacing: 0.8 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 28, letterSpacing: -0.7, marginTop: 4 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, marginTop: 4 },
  searchBox: { borderWidth: 1, borderRadius: 14, minHeight: 49, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 9 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 13 },
  horizontal: { gap: 8, paddingRight: 14 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 },
  resultCount: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  clear: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  empty: { borderWidth: 1, borderRadius: 18, padding: 28, alignItems: 'center', gap: 8 },
  emptyTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, marginTop: 4 },
  emptyBody: { fontFamily: 'Inter_400Regular', fontSize: 12, textAlign: 'center' },
  note: { fontFamily: 'Inter_400Regular', fontSize: 11, lineHeight: 17, textAlign: 'center', paddingHorizontal: 10, marginTop: 6 },
});