import React from 'react';
import { Platform, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { TodayScreen } from '@screens/TodayScreen';
import { OtherScreen } from '@screens/OtherScreen';
import { QuickNotesScreen } from '@screens/QuickNotesScreen';
import { CompletedScreen } from '@screens/CompletedScreen';
import { SettingsScreen } from '@screens/SettingsScreen';
import { theme } from '@theme/index';
import { Home, Calendar, Edit3, CheckCircle2, Settings } from 'lucide-react-native';

const Tab = createBottomTabNavigator<MainTabParamList>();

interface TabBarIconProps {
  routeName: keyof MainTabParamList;
  color: string;
  focused: boolean;
}

const TabBarIcon: React.FC<TabBarIconProps> = React.memo(({ routeName, color, focused }) => {
  let IconComponent = Home;
  if (routeName === 'Today') {
    IconComponent = Home;
  } else if (routeName === 'Other') {
    IconComponent = Calendar;
  } else if (routeName === 'QuickNotes') {
    IconComponent = Edit3;
  } else if (routeName === 'Completed') {
    IconComponent = CheckCircle2;
  } else if (routeName === 'Settings') {
    IconComponent = Settings;
  }

  return (
    <View style={[styles.iconWrapper, focused && styles.iconWrapperActive]}>
      <IconComponent
        size={18}
        color={color}
        strokeWidth={focused ? 2.5 : 2}
      />
    </View>
  );
});

// Defined outside render to satisfy react/no-unstable-nested-components
const getScreenOptions = ({ route }: { route: { name: keyof MainTabParamList } }) => ({
  headerShown: false,
  tabBarActiveTintColor: theme.colors.primary,
  tabBarInactiveTintColor: theme.colors.textTertiary,
  tabBarStyle: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(18, 18, 24, 0.92)', // Glassy secondary surface
    borderWidth: 1,
    borderColor: 'rgba(43, 43, 53, 0.8)', // Border divider
    borderRadius: 24,
    height: Platform.OS === 'ios' ? 76 : 66,
    paddingBottom: Platform.OS === 'ios' ? 22 : 12,
    paddingTop: 10,
    ...theme.elevation.lg,
  } as const,
  tabBarLabelStyle: {
    fontSize: 10,
    fontWeight: '600' as const,
    marginTop: 2,
  },
  tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
    <TabBarIcon
      routeName={route.name}
      color={color}
      focused={focused}
    />
  ),
});

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator screenOptions={getScreenOptions}>
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{ title: 'Today' }}
      />
      <Tab.Screen
        name="Other"
        component={OtherScreen}
        options={{ title: 'Upcoming' }}
      />
      <Tab.Screen
        name="QuickNotes"
        component={QuickNotesScreen}
        options={{ title: 'Notes' }}
      />
      <Tab.Screen
        name="Completed"
        component={CompletedScreen}
        options={{ title: 'Done' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  iconWrapperActive: {
    // Add subtle indicator shadow when focused
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});
