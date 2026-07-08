import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { TodayScreen } from '@screens/TodayScreen';
import { OtherScreen } from '@screens/OtherScreen';
import { QuickNotesScreen } from '@screens/QuickNotesScreen';
import { CompletedScreen } from '@screens/CompletedScreen';
import { SettingsScreen } from '@screens/SettingsScreen';
import { theme } from '@theme/index';
import { Home, CalendarDays, StickyNote, CheckCheck, SlidersHorizontal } from 'lucide-react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, typeof Home> = {
  Today: Home,
  Other: CalendarDays,
  QuickNotes: StickyNote,
  Completed: CheckCheck,
  Settings: SlidersHorizontal,
};

const TAB_LABELS: Record<keyof MainTabParamList, string> = {
  Today: 'Today',
  Other: 'Upcoming',
  QuickNotes: 'Notes',
  Completed: 'Done',
  Settings: 'Settings',
};

interface AnimatedTabIconProps {
  routeName: keyof MainTabParamList;
  color: string;
  focused: boolean;
}

const AnimatedTabIcon: React.FC<AnimatedTabIconProps> = React.memo(({ routeName, color, focused }) => {
  const scale = useSharedValue(focused ? 1 : 0.9);

  React.useEffect(() => {
    scale.value = withSpring(focused ? 1 : 0.9, { damping: 15, stiffness: 200 });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const IconComponent = TAB_ICONS[routeName];

  return (
    <Animated.View style={[styles.iconWrapper, animatedStyle]}>
      {focused && <View style={styles.activeIndicator} />}
      <IconComponent
        size={22}
        color={color}
        strokeWidth={focused ? 2.5 : 1.8}
      />
    </Animated.View>
  );
});

const getScreenOptions = ({ route }: { route: { name: keyof MainTabParamList } }) => ({
  headerShown: false,
  tabBarActiveTintColor: theme.colors.primary,
  tabBarInactiveTintColor: theme.colors.textTertiary,
  tabBarShowLabel: true,
  tabBarStyle: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 12,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(18, 18, 24, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(43, 43, 53, 0.7)',
    borderRadius: 26,
    height: Platform.OS === 'ios' ? 80 : 68,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    ...theme.elevation.xl,
  } as const,
  tabBarLabelStyle: {
    fontSize: 10,
    fontWeight: '600' as const,
    marginTop: 1,
  },
  tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
    <AnimatedTabIcon routeName={route.name} color={color} focused={focused} />
  ),
});

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator screenOptions={getScreenOptions}>
      <Tab.Screen name="Today" component={TodayScreen} options={{ title: TAB_LABELS.Today }} />
      <Tab.Screen name="Other" component={OtherScreen} options={{ title: TAB_LABELS.Other }} />
      <Tab.Screen name="QuickNotes" component={QuickNotesScreen} options={{ title: TAB_LABELS.QuickNotes }} />
      <Tab.Screen name="Completed" component={CompletedScreen} options={{ title: TAB_LABELS.Completed }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: TAB_LABELS.Settings }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 32,
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    width: 32,
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
});
