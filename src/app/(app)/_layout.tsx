import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { Brand } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

function TabIcon({
  symbol,
  focused,
}: {
  symbol: string;
  focused: boolean;
}) {
  return (
    <View style={[iconStyles.wrap, focused && iconStyles.wrapActive]}>
      <View style={[iconStyles.dot, focused && iconStyles.dotActive]}>
        <View style={{ opacity: focused ? 1 : 0.5 }}>
          {/* text-based icon; swap with expo/vector-icons later */}
        </View>
      </View>
    </View>
  );
}

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

export default function AppLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.backgroundElement,
          borderTopColor: theme.border,
          borderTopWidth: StyleSheet.hairlineWidth,
          paddingBottom: Platform.OS === 'ios' ? 20 : 8,
          paddingTop: 8,
          height: Platform.OS === 'ios' ? 80 : 60,
        },
        tabBarActiveTintColor: Brand.lavenderTonic,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Todos',
          tabBarIcon: ({ focused }) => (
            <View style={[iconStyles.wrap, focused && iconStyles.wrapActive]}>
              <View style={[iconStyles.dot, focused && iconStyles.dotActive]} />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => (
            <View style={[iconStyles.wrap, focused && iconStyles.wrapActive]}>
              <View style={[iconStyles.dot, focused && iconStyles.dotActive]} />
            </View>
          ),
        }}
      />

    </Tabs>
  );
}
