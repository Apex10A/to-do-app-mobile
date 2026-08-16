import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Fonts, Radius } from '@/constants/theme';
import type { Priority } from '@/hooks/use-todos';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------
export const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; bg: string; text: string; border: string }
> = {
  low:    { label: 'Low',    bg: 'rgba(95,191,138,0.12)',  text: '#5fbf8a', border: 'rgba(95,191,138,0.35)'  },
  medium: { label: 'Medium', bg: 'rgba(200,190,250,0.12)', text: '#c8befa', border: 'rgba(200,190,250,0.35)' },
  high:   { label: 'High',   bg: 'rgba(240,112,112,0.12)', text: '#f07070', border: 'rgba(240,112,112,0.35)' },
};

// ---------------------------------------------------------------------------
// Display badge (read-only)
// ---------------------------------------------------------------------------
export function PriorityBadge({ priority }: { priority: Priority }) {
  const cfg = PRIORITY_CONFIG[priority] ?? PRIORITY_CONFIG.medium;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={[styles.label, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Inline picker (tappable row of three options)
// Shows a lock icon on Low/High when the user is on Free plan.
// ---------------------------------------------------------------------------
export function PriorityPicker({
  value,
  onChange,
  isPro,
}: {
  value: Priority;
  onChange: (p: Priority) => void;
  isPro: boolean;
}) {
  const safeValue = PRIORITY_CONFIG[value] ? value : 'medium';
  const priorities: Priority[] = ['low', 'medium', 'high'];

  return (
    <View style={styles.pickerRow}>
      {priorities.map(p => {
        const cfg      = PRIORITY_CONFIG[p];
        const active   = safeValue === p;
        const locked   = !isPro && p !== 'medium';

        return (
          <Pressable
            key={p}
            onPress={() => onChange(p)}
            style={[
              styles.pickerOption,
              { borderColor: active ? cfg.border : 'rgba(255,255,255,0.08)' },
              active && { backgroundColor: cfg.bg },
            ]}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            accessibilityLabel={`${cfg.label} priority${locked ? ' (Pro)' : ''}`}>
            <Text style={[styles.pickerLabel, { color: active ? cfg.text : 'rgba(200,190,250,0.4)' }]}>
              {locked ? '🔒 ' : ''}{cfg.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  label: {
    fontFamily: Fonts.semibold,
    fontSize: 10,
    letterSpacing: 0.4,
  },

  pickerRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  pickerOption: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
  },
  pickerLabel: {
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
});
