import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '@/components/toast';
import { Brand, Fonts, Radius, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [fieldError, setFieldError] = useState('');

  async function handleReset() {
    if (!email.trim())                                    { setFieldError('Email is required.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))       { setFieldError('Enter a valid email.'); return; }
    setLoading(true);
    setFieldError('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        showToast(error.message, 'error');
      } else {
        setSent(true);
        showToast('Reset link sent — check your inbox.', 'success');
      }
    } catch (e: any) {
      showToast(e?.message ?? 'Something went wrong.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.container}>

          <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityRole="button">
            <Text style={styles.backText}>← Back</Text>
          </Pressable>

          <Text style={styles.title}>Reset password</Text>
          <Text style={styles.subtitle}>Enter your email and we'll send you a reset link.</Text>

          {sent ? (
            <View style={styles.successBox}>
              <Text style={styles.successText}>Check your inbox — a reset link is on its way.</Text>
            </View>
          ) : (
            <View style={styles.card}>
              <View style={styles.fieldWrapper}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, !!fieldError && styles.inputError]}
                  value={email}
                  onChangeText={v => { setEmail(v); setFieldError(''); }}
                  placeholder="you@example.com"
                  placeholderTextColor="rgba(200,190,250,0.4)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  accessibilityLabel="Email"
                />
                {!!fieldError && <Text style={styles.errorText}>{fieldError}</Text>}
              </View>

              <Pressable
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleReset} disabled={loading} accessibilityRole="button">
                {loading
                  ? <ActivityIndicator color={Brand.championBlue} />
                  : <Text style={styles.submitText}>Send Reset Link</Text>}
              </Pressable>
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: Brand.championBlue },
  flex:      { flex: 1 },
  container: { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.four },

  backBtn:  { marginBottom: Spacing.four },
  backText: { fontFamily: Fonts.medium, color: Brand.lavenderTonic, fontSize: 15 },

  title:    { fontFamily: Fonts.bold,    fontSize: 26, color: Brand.lavenderTonic, marginBottom: Spacing.one },
  subtitle: { fontFamily: Fonts.regular, fontSize: 14, color: 'rgba(200,190,250,0.6)', marginBottom: Spacing.four, lineHeight: 20 },

  card:         { backgroundColor: '#1e1a3a', borderRadius: Radius.lg, padding: Spacing.four, gap: Spacing.three, borderWidth: 1, borderColor: '#2d2856' },
  fieldWrapper: { gap: Spacing.one },
  label:        { fontFamily: Fonts.semibold, fontSize: 13, color: Brand.lavenderTonic },
  input:        { fontFamily: Fonts.regular, height: 48, borderRadius: Radius.sm, borderWidth: 1, borderColor: '#2d2856', backgroundColor: '#151130', paddingHorizontal: Spacing.three, color: '#e4d9fd', fontSize: 15 },
  inputError:   { borderColor: '#f07070' },
  errorText:    { fontFamily: Fonts.regular, fontSize: 12, color: '#f07070' },

  submitBtn:         { height: 52, borderRadius: Radius.md, backgroundColor: Brand.lavenderTonic, alignItems: 'center', justifyContent: 'center' },
  submitBtnDisabled: { opacity: 0.6 },
  submitText:        { fontFamily: Fonts.bold, color: Brand.championBlue, fontSize: 16 },

  successBox:  { backgroundColor: 'rgba(95,191,138,0.12)', borderRadius: Radius.md, padding: Spacing.four, borderWidth: 1, borderColor: 'rgba(95,191,138,0.3)' },
  successText: { fontFamily: Fonts.medium, color: '#5fbf8a', fontSize: 15, lineHeight: 22, textAlign: 'center' },
});
