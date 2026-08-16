import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Fonts, Radius, Spacing } from '@/constants/theme';

interface BiometricLockScreenProps {
  authFailed: boolean;
  onRetry: () => void;
  onLogout: () => void;
}

export function BiometricLockScreen({ authFailed, onRetry, onLogout }: BiometricLockScreenProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔒</Text>
      <Text style={styles.title}>App locked</Text>
      <Text style={styles.subtitle}>
        {authFailed
          ? 'Biometric check failed. Try again or log out.'
          : 'Confirm your identity to continue.'}
      </Text>

      <Pressable style={styles.retryBtn} onPress={onRetry} accessibilityRole="button">
        <Text style={styles.retryText}>
          {authFailed ? 'Try again' : 'Unlock with biometrics'}
        </Text>
      </Pressable>

      <Pressable style={styles.logoutBtn} onPress={onLogout} accessibilityRole="button">
        <Text style={styles.logoutText}>Log out instead</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Brand.championBlue,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    zIndex: 9999,
  },
  icon:     { fontSize: 52 },
  title:    { fontFamily: Fonts.bold,    fontSize: 24, color: Brand.lavenderTonic },
  subtitle: { fontFamily: Fonts.regular, fontSize: 14, color: 'rgba(200,190,250,0.6)', textAlign: 'center', lineHeight: 20 },

  retryBtn:   { width: '100%', height: 52, borderRadius: Radius.md, backgroundColor: Brand.lavenderTonic, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.two },
  retryText:  { fontFamily: Fonts.bold, fontSize: 16, color: Brand.championBlue },

  logoutBtn:  { paddingVertical: Spacing.two },
  logoutText: { fontFamily: Fonts.regular, fontSize: 14, color: 'rgba(200,190,250,0.45)' },
});
