import React, { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColors } from '@/hooks/useColors';
import { KeyboardAwareScrollViewCompat } from '@/components/KeyboardAwareScrollViewCompat';
import { BrandMark, SectionTitle, SolidButton, SoftButton } from '@/components/BrandUI';
import { useApp, type CustomerProfile } from '@/lib/store';
import { useAuth, useClerk } from '@clerk/expo';
import { useRouter } from 'expo-router';

const PHONE = '+917991157051';

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { profile, saveProfile, language, setLanguage, labels } = useApp();
  const { isSignedIn } = useAuth();
  const { signOut } = useClerk();
  const router = useRouter();
  const [form, setForm] = useState<CustomerProfile>(profile);

  const update = (key: keyof CustomerProfile, value: string) => setForm((previous) => ({ ...previous, [key]: value }));
  const save = () => {
    if (!isSignedIn) {
      router.push('/(auth)/sign-in');
      return;
    }
    saveProfile(form)
      .then(() => Alert.alert('Profile saved', 'Your enquiry details are ready to use.'))
      .catch((error: Error) => Alert.alert('Could not save profile', error.message));
  };

  return (
    <KeyboardAwareScrollViewCompat style={{ backgroundColor: colors.background }} contentContainerStyle={[styles.content, { paddingTop: insets.top + 18 }]} bottomOffset={20}>
      <View style={styles.header}><BrandMark /><View style={[styles.profileAvatar, { backgroundColor: colors.primary }]}><Text style={styles.avatarText}>{form.name ? form.name[0].toUpperCase() : 'G'}</Text></View></View>
      <Text style={[styles.title, { color: colors.foreground }]}>{labels.profile}</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Save your details once for faster wholesale enquiries.</Text>
      {!isSignedIn ? (
        <View style={[styles.languageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View><Text style={[styles.languageTitle, { color: colors.foreground }]}>Customer account</Text><Text style={[styles.languageBody, { color: colors.mutedForeground }]}>Sign in to save your profile and view orders.</Text></View>
          <SoftButton label="Sign in" onPress={() => router.push('/(auth)/sign-in')} />
        </View>
      ) : (
        <View style={styles.contactRow}>
          <SoftButton label="Admin console" onPress={() => router.push('/admin')} />
          <SoftButton label="Sign out" onPress={() => signOut()} />
        </View>
      )}
      <View style={[styles.languageCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.languageCopy}><Ionicons name="language-outline" size={20} color={colors.primary} /><View><Text style={[styles.languageTitle, { color: colors.foreground }]}>Language</Text><Text style={[styles.languageBody, { color: colors.mutedForeground }]}>English / हिन्दी</Text></View></View>
        <View style={[styles.switch, { backgroundColor: colors.secondary }]}>
          <Pressable onPress={() => setLanguage('en')} style={[styles.switchOption, language === 'en' && { backgroundColor: colors.primary }]}><Text style={[styles.switchText, { color: language === 'en' ? colors.primaryForeground : colors.mutedForeground }]}>EN</Text></Pressable>
          <Pressable onPress={() => setLanguage('hi')} style={[styles.switchOption, language === 'hi' && { backgroundColor: colors.primary }]}><Text style={[styles.switchText, { color: language === 'hi' ? colors.primaryForeground : colors.mutedForeground }]}>हि</Text></Pressable>
        </View>
      </View>
      <SectionTitle title="Customer details" />
      {([
        ['name', labels.name, 'Your full name'],
        ['business', labels.business, 'Business or shop name'],
        ['phone', labels.phone, '+91'],
        ['whatsapp', 'WhatsApp number', '+91'],
        ['city', labels.city, 'Patna'],
        ['address', labels.address, 'Business delivery address'],
      ] as Array<[keyof CustomerProfile, string, string]>).map(([key, label, placeholder]) => (
        <View key={key} style={styles.field}>
          <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{label}</Text>
          <TextInput value={form[key]} onChangeText={(value) => update(key, value)} placeholder={placeholder} placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]} />
        </View>
      ))}
      <SolidButton label={labels.save} onPress={save} testID="save-profile" />
      <SectionTitle title="Contact Shiv Trading Agency" />
      <View style={styles.contactRow}>
        <SoftButton label={labels.whatsapp} onPress={() => Linking.openURL(`https://wa.me/${PHONE}`)} />
        <SoftButton label={labels.callNow} onPress={() => Linking.openURL(`tel:${PHONE}`)} />
      </View>
      <View style={[styles.about, { backgroundColor: colors.navy }]}>
        <Text style={styles.aboutTitle}>SHIV TRADING AGENCY</Text>
        <Text style={styles.aboutBody}>Wholesale lubricants & greases</Text>
        <Text style={styles.aboutBody}>Patna, Bihar · Serving Bihar</Text>
      </View>
      <Text style={[styles.privacy, { color: colors.mutedForeground }]}>Your profile, enquiries and orders are stored securely with your customer account.</Text>
      <View style={{ height: 30 }} />
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 18, paddingBottom: 90, gap: 15 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  profileAvatar: { width: 43, height: 43, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 18 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 29, letterSpacing: -0.7 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginTop: -8 },
  languageCard: { borderRadius: 16, borderWidth: 1, padding: 13, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  languageCopy: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  languageTitle: { fontFamily: 'Inter_700Bold', fontSize: 13 },
  languageBody: { fontFamily: 'Inter_400Regular', fontSize: 11, marginTop: 2 },
  switch: { flexDirection: 'row', borderRadius: 10, padding: 3 },
  switchOption: { paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8 },
  switchText: { fontFamily: 'Inter_700Bold', fontSize: 10 },
  field: { gap: 6 },
  fieldLabel: { fontFamily: 'Inter_600SemiBold', fontSize: 11 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 13, minHeight: 46, fontFamily: 'Inter_400Regular', fontSize: 13 },
  contactRow: { flexDirection: 'row', gap: 9 },
  about: { borderRadius: 18, padding: 17, gap: 4, marginTop: 2 },
  aboutTitle: { color: '#fff', fontFamily: 'Inter_700Bold', fontSize: 15, letterSpacing: 1.1 },
  aboutBody: { color: 'rgba(255,255,255,0.65)', fontFamily: 'Inter_400Regular', fontSize: 12 },
  privacy: { fontFamily: 'Inter_400Regular', fontSize: 10, lineHeight: 15, textAlign: 'center', paddingHorizontal: 8 },
});