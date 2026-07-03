import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { TodayScreen } from '@screens/TodayScreen';
import { OtherScreen } from '@screens/OtherScreen';
import { QuickNotesScreen } from '@screens/QuickNotesScreen';
import { CompletedScreen } from '@screens/CompletedScreen';
import { SettingsScreen } from '@screens/SettingsScreen';
import { theme } from '@theme/index';
import { Text } from '@components/common';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          ...theme.elevation.sm,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
        tabBarIcon: ({ color }) => {
          let icon = '';
          if (route.name === 'Today') icon = '🏠';
          else if (route.name === 'Other') icon = '📋';
          else if (route.name === 'QuickNotes') icon = '✏️';
          else if (route.name === 'Completed') icon = '✅';
          else if (route.name === 'Settings') icon = '⚙️';

          return <Text style={{ color, fontSize: 18 }}>{icon}</Text>;
        },
      })}
    >
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
        options={{ title: 'Quick Notes' }}
      />
      <Tab.Screen
        name="Completed"
        component={CompletedScreen}
        options={{ title: 'Completed' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'More' }}
      />
    </Tab.Navigator>
  );
};
