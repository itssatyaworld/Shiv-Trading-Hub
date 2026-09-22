import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSignUp } from '@clerk/expo';
import { Link, useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { BrandMark } from '@/components/BrandUI';

export default function SignUpScreen() {
  const colors = useColors();
  const router = useRouter();
  const { signUp, errors, fetchStatus } = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const busy = fetchStatus === 'fetching';

  const start = async () => {
    const result = await signUp.password({ emailAddress: email.trim(), password });
    if (result.error) { Alert.alert('Sign up failed', result.error.message); return; }
    await signUp.verifications.sendEmailCode();
  };

  const verify = async () => {
    const result = await signUp.verifications.verifyEmailCode({ code: code.trim() });
    if (result.error) { Alert.alert('Verification failed', result.error.message); return; }
    if (signUp.status === 'complete') {
      await signUp.finalize();
      router.replace('/(tabs)/profile');
    }
  };

  const verification = signUp.status === 'missing_requirements' && signUp.unverifiedFields.includes('email_address');
  return (
    <View style={[styles.page, { backgroundColor: colors.background }]}>
      <BrandMark />
      <Text style={[styles.title, { color: colors.foreground }]}>{verification ? 'Verify your email' : 'Create your account'}</Text>
      <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{verification ? 'Enter the code sent to your email address.' : 'Create a customer account for faster wholesale enquiries.'}</Text>
      {!verification ? <>
        <TextInput autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} placeholder="Email address" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]} />
        <TextInput secureTextEntry value={password} onChangeText={setPassword} placeholder="Password" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]} />
        <Pressable disabled={busy || !email || !password} onPress={start} style={[styles.button, { backgroundColor: colors.primary }, (busy || !email || !password) && styles.disabled]}><Text style={styles.buttonText}>{busy ? 'Sending…' : 'Create account'}</Text></Pressable>
      </> : <>
        <TextInput keyboardType="numeric" value={code} onChangeText={setCode} placeholder="Email verification code" placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground, backgroundColor: colors.card, borderColor: colors.border }]} />
        <Pressable disabled={busy || !code} onPress={verify} style={[styles.button, { backgroundColor: colors.primary }, (busy || !code) && styles.disabled]}><Text style={styles.buttonText}>{busy ? 'Verifying…' : 'Verify email'}</Text></Pressable>
        <Pressable onPress={() => signUp.verifications.sendEmailCode()}><Text style={[styles.link, { color: colors.primary }]}>Send a new code</Text></Pressable>
      </>}
      {errors?.fields?.emailAddress && <Text style={styles.error}>{errors.fields.emailAddress.message}</Text>}
      <View nativeID="clerk-captcha" />
      <Text style={[styles.footer, { color: colors.mutedForeground }]}>Already have an account?</Text>
      <Link href="/(auth)/sign-in" asChild><Pressable><Text style={[styles.link, { color: colors.primary }]}>Sign in</Text></Pressable></Link>
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