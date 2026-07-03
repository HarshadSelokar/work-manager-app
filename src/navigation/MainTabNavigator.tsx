import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from './types';
import { TodayScreen } from '@screens/TodayScreen';
import { OtherScreen } from '@screens/OtherScreen';
import { QuickNotesScreen } from '@screens/QuickNotesScreen';
import { CompletedScreen } from '@screens/CompletedScreen';
import { SettingsScreen } from '@screens/SettingsScreen';

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Today" component={TodayScreen} />
      <Tab.Screen name="Other" component={OtherScreen} />
      <Tab.Screen
        name="QuickNotes"
        component={QuickNotesScreen}
        options={{ title: 'Quick Notes' }}
      />
      <Tab.Screen name="Completed" component={CompletedScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};
