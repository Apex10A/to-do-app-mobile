import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useToast } from '@/components/toast';
import { Brand, Fonts, Radius, Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function SectionHeader({ title }: { title: string }) {
  const theme = useTheme();
  return (
    <Text style={[sectionStyles.header, { color: theme.textSecondary }]}>
      {title.toUpperCase()}
    </Text>
  );
}
const sectionStyles = StyleSheet.create({
  header: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, marginBottom: Spacing.two },
});

function SettingsRow({
  label, value, onPress, destructive,
}: {
  label: string; value?: string; onPress?: () => void; destructive?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[rowStyles.row, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}
      accessibilityRole={onPress ? 'button' : 'text'}>
      <Text style={[rowStyles.label, { color: destructive ? theme.error : theme.text }]}>
        {label}
      </Text>
      {!!value   && <Text style={[rowStyles.value,   { color: theme.textSecondary }]}>{value}</Text>}
      {!!onPress && <Text style={[rowStyles.chevron, { color: theme.textSecondary }]}>›</Text>}
    </Pressable>
  );
}
const rowStyles = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.three, paddingVertical: 14, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.two },
  label:   { fontFamily: Fonts.medium,  flex: 1, fontSize: 15 },
  value:   { fontFamily: Fonts.regular, fontSize: 14, marginRight: Spacing.one },
  chevron: { fontFamily: Fonts.regular, fontSize: 20, lineHeight: 22 },
});

function PlanBadge({ plan }: { plan: 'free' | 'pro' }) {
  const isPro = plan === 'pro';
  return (
    <View style={[badgeStyles.badge, isPro ? badgeStyles.pro : badgeStyles.free]}>
      <Text style={[badgeStyles.text, isPro ? badgeStyles.proText : badgeStyles.freeText]}>
        {isPro ? 'PRO' : 'FREE'}
      </Text>
    </View>
  );
}
const badgeStyles = StyleSheet.create({
  badge:    { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  free:     { backgroundColor: 'rgba(200,190,250,0.12)', borderWidth: 1, borderColor: '#2d2856' },
  pro:      { backgroundColor: Brand.lavenderTonic },
  text:     { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 0.8 },
  freeText: { color: Brand.lavenderTonic },
  proText:  { color: Brand.championBlue },
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function ProfileScreen() {
  const router          = useRouter();
  const theme           = useTheme();
  const { showToast }   = useToast();
  const { profile, loading, refresh } = useProfile();

  const [payLoading,     setPayLoading]     = useState(false);
  const [logoutLoading,  setLogoutLoading]  = useState(false);

  // Derive initials safely
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() ?? '?';

  // ── Upgrade via Paystack ──────────────────────────────────────────────
  async function handleUpgrade() {
    setPayLoading(true);
    try {
      // TODO: Paystack flow
      // 1. POST /api/paystack/initialize → { authorization_url, reference }
      // 2. await WebBrowser.openBrowserAsync(authorization_url)
      // 3. GET /api/paystack/verify/:reference → confirm payment
      // 4. await supabase.from('profiles').update({ plan: 'pro' }).eq('id', profile.id)
      // 5. refresh()  ← refreshes the profile hook so badge updates instantly
      showToast('Paystack integration coming soon!', 'info');
    } finally {
      setPayLoading(false);
    }
  }

  // ── Logout ────────────────────────────────────────────────────────────
  async function handleLogout() {
    setLogoutLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        showToast(error.message, 'error');
      } else {
        // Auth listener in _layout.tsx picks up the session change
        // and redirects to /(auth)/login automatically
        router.replace('/(auth)/login');
      }
    } catch (e: any) {
      showToast(e?.message ?? 'Logout failed.', 'error');
    } finally {
      setLogoutLoading(false);
    }
  }

  // ── Loading state ─────────────────────────────────────────────────────
  if (loading) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={Brand.lavenderTonic} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Avatar block */}
          <View style={styles.avatarBlock}>
            <View style={[styles.avatar, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <Text style={[styles.avatarInitials, { color: Brand.lavenderTonic }]}>
                {initials}
              </Text>
            </View>
            <Text style={[styles.userName, { color: theme.text }]}>
              {profile?.full_name ?? 'User'}
            </Text>
            <Text style={[styles.userEmail, { color: theme.textSecondary }]}>
              {profile?.email ?? ''}
            </Text>
            <View style={styles.badgeRow}>
              <PlanBadge plan={profile?.plan ?? 'free'} />
            </View>
          </View>

          {/* Plan card */}
          <SectionHeader title="Plan" />
          <View style={[styles.planCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <View style={styles.planInfo}>
              <Text style={[styles.planTitle, { color: theme.text }]}>
                {profile?.plan === 'pro' ? 'Pro Plan' : 'Free Plan'}
              </Text>
              <Text style={[styles.planDesc, { color: theme.textSecondary }]}>
                {profile?.plan === 'pro'
                  ? 'Unlimited todos, priority support, and more.'
                  : 'Up to 20 todos. Upgrade for unlimited.'}
              </Text>
            </View>
            {profile?.plan !== 'pro' && (
              <Pressable
                style={[styles.upgradeBtn, payLoading && { opacity: 0.6 }]}
                onPress={handleUpgrade}
                disabled={payLoading}
                accessibilityRole="button"
                accessibilityLabel="Upgrade to Pro">
                {payLoading
                  ? <ActivityIndicator color={Brand.championBlue} size="small" />
                  : <Text style={styles.upgradeBtnText}>Upgrade →</Text>}
              </Pressable>
            )}
          </View>

          {/* Account settings */}
          <View style={styles.section}>
            <SectionHeader title="Account" />
            <SettingsRow
              label="Email"
              value={profile?.email ?? ''}
            />
            <SettingsRow
              label="Change Password"
              onPress={() => router.push('/(auth)/forgot-password')}
            />
          </View>

          {/* Session */}
          <View style={styles.section}>
            <SectionHeader title="Session" />
            <Pressable
              style={[rowStyles.row, { backgroundColor: theme.backgroundElement, borderColor: theme.border }, logoutLoading && { opacity: 0.6 }]}
              onPress={handleLogout}
              disabled={logoutLoading}
              accessibilityRole="button">
              {logoutLoading
                ? <ActivityIndicator color={theme.error} size="small" style={{ marginRight: Spacing.two }} />
                : null}
              <Text style={[rowStyles.label, { color: theme.error }]}>Log Out</Text>
            </Pressable>
          </View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  screen:  { flex: 1 },
  safe:    { flex: 1 },
  center:  { alignItems: 'center', justifyContent: 'center' },
  scroll:  { paddingHorizontal: Spacing.three, paddingTop: Spacing.four, paddingBottom: Spacing.six },

  avatarBlock:    { alignItems: 'center', marginBottom: Spacing.five },
  avatar:         { width: 80, height: 80, borderRadius: Radius.full, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.two },
  avatarInitials: { fontFamily: Fonts.bold, fontSize: 28 },
  userName:       { fontFamily: Fonts.bold,    fontSize: 20, marginBottom: 2 },
  userEmail:      { fontFamily: Fonts.regular, fontSize: 13, marginBottom: Spacing.two },
  badgeRow:       { flexDirection: 'row' },

  planCard:       { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.three, flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginBottom: Spacing.four },
  planInfo:       { flex: 1, gap: 4 },
  planTitle:      { fontFamily: Fonts.semibold, fontSize: 15 },
  planDesc:       { fontFamily: Fonts.regular,  fontSize: 13, lineHeight: 18 },
  upgradeBtn:     { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Radius.sm, backgroundColor: Brand.lavenderTonic, alignItems: 'center', justifyContent: 'center' },
  upgradeBtnText: { fontFamily: Fonts.bold, color: Brand.championBlue, fontSize: 13 },

  section: { marginBottom: Spacing.four },
});
