import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const iconStyles = StyleSheet.create({
  wrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  wrapActive: {
    backgroundColor: 'rgba(200,190,250,0.15)',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(200,190,250,0.3)',
  },
  dotActive: {
    backgroundColor: Brand.lavenderTonic,
  },
});

function TabIcon({ focused }: { focused: boolean }) {
  return (
    <View style={[iconStyles.wrap, focused && iconStyles.wrapActive]}>
      <View style={[iconStyles.dot, focused && iconStyles.dotActive]} />
    </View>
  );
}

export default function AppLayout() {
  const theme  = useTheme();
  const insets = useSafeAreaInsets();

  // Reserve exactly the device's bottom inset (home indicator / nav bar)
  // plus a small visual padding above the labels.
  const TAB_PADDING_TOP    = 8;
  const TAB_PADDING_BOTTOM = insets.bottom + 4;   // sits above gesture bar / nav buttons
  const TAB_HEIGHT         = 48 + TAB_PADDING_TOP + TAB_PADDING_BOTTOM;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.backgroundElement,
          borderTopColor: theme.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          height:         TAB_HEIGHT,
          paddingTop:     TAB_PADDING_TOP,
          paddingBottom:  TAB_PADDING_BOTTOM,
          // Prevent the navigator from adding its own safe-area padding on top of ours
          ...(Platform.OS === 'android' && { elevation: 8 }),
        },
        tabBarActiveTintColor:   Brand.lavenderTonic,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: {
          fontSize:     11,
          fontWeight:   '600',
          letterSpacing: 0.2,
          marginBottom:  2,
        },
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Todos',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} />,
        }}
      />

    </Tabs>
  );
}
