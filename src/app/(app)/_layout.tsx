import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand, Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

// ---------------------------------------------------------------------------
// Tab icon
// ---------------------------------------------------------------------------
function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={[icon.wrap, focused && icon.wrapActive]}>
      <Text style={[icon.emoji, { opacity: focused ? 1 : 0.45 }]}>{emoji}</Text>
    </View>
  );
}

const icon = StyleSheet.create({
  wrap:       { width: 32, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  wrapActive: { backgroundColor: 'rgba(200,190,250,0.12)' },
  emoji:      { fontSize: 18 },
});

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
export default function AppLayout() {
  const theme  = useTheme();
  const insets = useSafeAreaInsets();

  const TAB_PADDING_TOP    = 8;
  const TAB_PADDING_BOTTOM = insets.bottom + 4;
  const TAB_HEIGHT         = 48 + TAB_PADDING_TOP + TAB_PADDING_BOTTOM;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.backgroundElement,
          borderTopColor:  theme.border,
          borderTopWidth:  StyleSheet.hairlineWidth,
          height:          TAB_HEIGHT,
          paddingTop:      TAB_PADDING_TOP,
          paddingBottom:   TAB_PADDING_BOTTOM,
          ...(Platform.OS === 'android' && { elevation: 8 }),
        },
        tabBarActiveTintColor:   Brand.lavenderTonic,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: {
          fontFamily:    Fonts.semibold,
          fontSize:      10,
          letterSpacing: 0.2,
          marginBottom:  2,
        },
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Todos',
          tabBarIcon: ({ focused }) => <TabIcon emoji="✅" focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Payments',
          tabBarIcon: ({ focused }) => <TabIcon emoji="💳" focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />

    </Tabs>
  );
}
