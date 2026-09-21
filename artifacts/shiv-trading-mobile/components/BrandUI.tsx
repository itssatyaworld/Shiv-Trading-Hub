import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import type { Product } from '@/lib/store';
import { useApp } from '@/lib/store';

export function BrandMark() {
  const colors = useColors();
  return (
    <View style={styles.brandMark}>
      <View style={[styles.mark, { backgroundColor: colors.primary }]}>
        <Text style={styles.markText}>S</Text>
      </View>
      <View>
        <Text style={[styles.brandTitle, { color: colors.foreground }]}>SHIV</Text>
        <Text style={[styles.brandSub, { color: colors.mutedForeground }]}>TRADING AGENCY</Text>
      </View>
    </View>
  );
}

export function SectionTitle({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  const colors = useColors();
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{title}</Text>
      {action && onPress ? <Pressable onPress={onPress}><Text style={[styles.sectionAction, { color: colors.primary }]}>{action}</Text></Pressable> : null}
    </View>
  );
}

export function CategoryPill({ label, active = false, onPress }: { label: string; active?: boolean; onPress?: () => void }) {
  const colors = useColors();
  return (
    <Pressable onPress={onPress} style={[styles.pill, { backgroundColor: active ? colors.primary : colors.card, borderColor: active ? colors.primary : colors.border }]}>
      <Text style={[styles.pillText, { color: active ? colors.primaryForeground : colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

export function ProductPlaceholder({ compact = false }: { compact?: boolean }) {
  const colors = useColors();
  return (
    <View style={[styles.productImage, { backgroundColor: colors.secondary }, compact && styles.productImageCompact]}>
      <View style={[styles.drop, { backgroundColor: colors.accent }]}>
        <Ionicons name="water-outline" size={compact ? 22 : 30} color={colors.primary} />
      </View>
      <Text style={[styles.placeholderText, { color: colors.mutedForeground }]}>Image to be added</Text>
    </View>
  );
}

export function ProductCard({ product, compact = false, onPress }: { product: Product; compact?: boolean; onPress?: () => void }) {
  const colors = useColors();
  const { addToCart } = useApp();
  return (
    <Pressable onPress={onPress} style={[styles.productCard, { backgroundColor: colors.card, borderColor: colors.border }, compact && styles.productCardCompact]}>
      <ProductPlaceholder compact={compact} />
      <View style={styles.productInfo}>
        <Text style={[styles.productBrand, { color: colors.primary }]}>{product.brand}</Text>
        <Text numberOfLines={2} style={[styles.productName, { color: colors.foreground }]}>{product.name}</Text>
        <Text style={[styles.productCategory, { color: colors.mutedForeground }]}>{product.category}</Text>
        <View style={styles.productActions}>
          <Pressable onPress={() => addToCart(product.id)} style={[styles.addButton, { backgroundColor: colors.primary }]} testID={`add-${product.id}`}>
            <Ionicons name="add" size={17} color={colors.primaryForeground} />
            <Text style={[styles.addText, { color: colors.primaryForeground }]}>Add</Text>
          </Pressable>
          <Ionicons name="chevron-forward" size={17} color={colors.mutedForeground} />
        </View>
      </View>
    </Pressable>
  );
}

export function SolidButton({ label, onPress, variant = 'primary', testID }: { label: string; onPress: () => void; variant?: 'primary' | 'light'; testID?: string }) {
  const colors = useColors();
  const isLight = variant === 'light';
  return (
    <Pressable onPress={onPress} testID={testID} style={({ pressed }) => [styles.solidButton, { backgroundColor: isLight ? '#fff' : colors.primary, opacity: pressed ? 0.82 : 1 }]}>
      <Text style={[styles.solidText, { color: isLight ? colors.primary : colors.primaryForeground }]}>{label}</Text>
    </Pressable>
  );
}

export function SoftButton({ label, onPress, variant = 'soft', testID }: { label: string; onPress: () => void; variant?: 'soft' | 'light'; testID?: string }) {
  const colors = useColors();
  const isLight = variant === 'light';
  return (
    <Pressable onPress={onPress} testID={testID} style={({ pressed }) => [styles.softButton, { borderColor: isLight ? 'rgba(255,255,255,0.55)' : colors.border, backgroundColor: isLight ? 'rgba(255,255,255,0.13)' : colors.card, opacity: pressed ? 0.8 : 1 }]}>
      <Text style={[styles.softText, { color: isLight ? '#fff' : colors.foreground }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  brandMark: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  mark: { width: 37, height: 37, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  markText: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 23, fontStyle: 'italic' },
  brandTitle: { fontFamily: 'Inter_700Bold', fontSize: 16, letterSpacing: 1.7, lineHeight: 17 },
  brandSub: { fontFamily: 'Inter_600SemiBold', fontSize: 7, letterSpacing: 0.9, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontFamily: 'Inter_700Bold', fontSize: 19, letterSpacing: -0.3 },
  sectionAction: { fontFamily: 'Inter_700Bold', fontSize: 12 },
  pill: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
  pillText: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  productCard: { width: 232, borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  productCardCompact: { width: 220 },
  productImage: { height: 144, alignItems: 'center', justifyContent: 'center', gap: 8 },
  productImageCompact: { height: 116 },
  drop: { width: 58, height: 58, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  placeholderText: { fontFamily: 'Inter_500Medium', fontSize: 10 },
  productInfo: { padding: 14, gap: 5 },
  productBrand: { fontFamily: 'Inter_700Bold', fontSize: 10, letterSpacing: 1.2 },
  productName: { fontFamily: 'Inter_700Bold', fontSize: 14, lineHeight: 19, minHeight: 38 },
  productCategory: { fontFamily: 'Inter_400Regular', fontSize: 11 },
  productActions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 },
  addButton: { borderRadius: 9, paddingHorizontal: 10, paddingVertical: 7, flexDirection: 'row', alignItems: 'center', gap: 4 },
  addText: { fontFamily: 'Inter_700Bold', fontSize: 11 },
  solidButton: { borderRadius: 10, paddingVertical: 11, paddingHorizontal: 13, alignItems: 'center' },
  solidText: { fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 0.1 },
  softButton: { borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12, borderWidth: 1, alignItems: 'center' },
  softText: { fontFamily: 'Inter_700Bold', fontSize: 11 },
});