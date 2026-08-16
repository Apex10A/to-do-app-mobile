import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { Brand, Fonts, Radius, Spacing } from '@/constants/theme';

interface UpgradeGateProps {
  visible: boolean;
  reason: 'cap' | 'priority' | null;
  onUpgrade: () => void;
  onDismiss: () => void;
}

const MESSAGES = {
  cap: {
    title: "You've hit the Free limit",
    body: 'Free accounts can hold up to 5 todos. Upgrade to Pro for unlimited tasks.',
  },
  priority: {
    title: 'Pro feature',
    body: 'Low and High priority levels are available on the Pro plan. Upgrade to unlock them.',
  },
};

export function UpgradeGate({ visible, reason, onUpgrade, onDismiss }: UpgradeGateProps) {
  const msg = MESSAGES[reason ?? 'cap'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
      statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          {/* Pro badge */}
          <View style={styles.proBadge}>
            <Text style={styles.proBadgeText}>PRO</Text>
          </View>

          <Text style={styles.title}>{msg.title}</Text>
          <Text style={styles.body}>{msg.body}</Text>

          <View style={styles.featureList}>
            {[
              'Unlimited todos',
              'Low & High priority levels',
              'Transaction history',
            ].map(f => (
              <View key={f} style={styles.featureRow}>
                <Text style={styles.featureCheck}>✓</Text>
                <Text style={styles.featureText}>{f}</Text>
              </View>
            ))}
          </View>

          <Pressable style={styles.upgradeBtn} onPress={onUpgrade} accessibilityRole="button">
            <Text style={styles.upgradeBtnText}>Upgrade to Pro</Text>
          </Pressable>

          <Pressable style={styles.dismissBtn} onPress={onDismiss} accessibilityRole="button">
            <Text style={styles.dismissText}>Maybe later</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1e1a3a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: Spacing.four,
    paddingBottom: Spacing.five,
    borderWidth: 1,
    borderColor: '#2d2856',
    gap: Spacing.three,
  },

  proBadge: {
    alignSelf: 'center',
    backgroundColor: Brand.lavenderTonic,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  proBadgeText: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    letterSpacing: 1.5,
    color: Brand.championBlue,
  },

  title: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Brand.lavenderTonic,
    textAlign: 'center',
  },
  body: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: 'rgba(200,190,250,0.65)',
    textAlign: 'center',
    lineHeight: 20,
  },

  featureList: { gap: 8 },
  featureRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  featureCheck:{ fontFamily: Fonts.bold, color: Brand.lavenderTonic, fontSize: 14 },
  featureText: { fontFamily: Fonts.medium, color: '#e4d9fd', fontSize: 14 },

  upgradeBtn: {
    height: 52,
    borderRadius: Radius.md,
    backgroundColor: Brand.lavenderTonic,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  upgradeBtnText: {
    fontFamily: Fonts.bold,
    color: Brand.championBlue,
    fontSize: 16,
  },

  dismissBtn: { alignItems: 'center', paddingVertical: Spacing.one },
  dismissText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: 'rgba(200,190,250,0.45)',
  },
});
