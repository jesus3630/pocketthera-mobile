import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../../lib/constants';

function TabIcon({ focused, char }: { focused: boolean; char: string }) {
  return (
    <View style={[styles.icon, focused && styles.iconActive]}>
      <View style={[styles.dot, { backgroundColor: focused ? COLORS.primary : COLORS.textLight }]} />
    </View>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Thera', tabBarIcon: ({ focused }) => <TabIcon focused={focused} char="T" /> }}
      />
      <Tabs.Screen
        name="mood"
        options={{ title: 'Mood', tabBarIcon: ({ focused }) => <TabIcon focused={focused} char="M" /> }}
      />
      <Tabs.Screen
        name="insights"
        options={{ title: 'Insights', tabBarIcon: ({ focused }) => <TabIcon focused={focused} char="I" /> }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Settings', tabBarIcon: ({ focused }) => <TabIcon focused={focused} char="S" /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.white,
    borderTopColor: COLORS.border,
    height: 85,
    paddingBottom: 20,
    paddingTop: 8,
  },
  icon: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  iconActive: {},
  dot: { width: 6, height: 6, borderRadius: 3 },
});
