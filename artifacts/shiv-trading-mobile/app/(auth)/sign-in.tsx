import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSignIn } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { BrandMark } from '@/components/BrandUI';

export default function SignInScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signIn, errors, fetchStatus } = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const busy = fetchStatus === 'fetching';

  const submit = async () => {
    const result = await signIn.password({ emailAddress: email.trim(), password });
    if (result.error) {
      Alert.alert('Sign in failed', result.error.message);
      return;
    }
    if (signIn.status === 'complete') {
      await signIn.finalize();
      router.replace('/(tabs)/profile');
      return;
    }
    Alert.alert('Additional verification required', 'Please complete the verification step in Clerk.');
  };

  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      <BrandMark />
      <Text style={[styles.title, { color: colors.foreground }]}>Welcome back</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Sign in to manage your wholesale enquiries and orders.</Text>
      <TextInput autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]} />
      <TextInput secureTextEntry value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]} />
      {errors?.fields?.identifier && <Text style={styles.error}>{errors.fields.identifier.message}</Text>}
      <Pressable disabled={busy || !email || !password} onPress={submit} style={[styles.button, { backgroundColor: colors.primary }, (busy || !email || !password) && styles.disabled]}><Text style={styles.buttonText}>{busy ? 'Signing in…' : 'Sign in'}</Text></Pressable>
      <View nativeID="clerk-captcha" />
      <Text style={[styles.footer, { color: colors.mutedForeground }]}>New to Shiv Trading Agency?</Text>
      <Link href="/(auth)/sign-up" asChild><Pressable><Text style={[styles.link, { color: colors.primary }]}>Create a customer account</Text></Pressable></Link>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, padding: 24, justifyContent: 'center', gap: 14 },
  title: { fontFamily: 'Inter_700Bold', fontSize: 30, marginTop: 16 },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, lineHeight: 19, marginBottom: 6 },
  input: { minHeight: 50, borderWidth: 1, borderRadius: 13, paddingHorizontal: 14, fontFamily: 'Inter_400Regular' },
  button: { minHeight: 50, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  buttonText: { color: '#fff', fontFamily: 'Inter_700Bold' },
  disabled: { opacity: 0.5 },
  error: { color: '#b42318', fontFamily: 'Inter_400Regular', fontSize: 12 },
  footer: { textAlign: 'center', fontFamily: 'Inter_400Regular', fontSize: 12, marginTop: 12 },
  link: { textAlign: 'center', fontFamily: 'Inter_700Bold', fontSize: 13 },
});