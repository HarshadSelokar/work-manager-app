import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from './types';
import { MainTabNavigator } from './MainTabNavigator';
import { AddWorkScreen } from '@screens/AddWorkScreen';
import { WorkDetailsScreen } from '@screens/WorkDetailsScreen';
import { EditWorkScreen } from '@screens/EditWorkScreen';
import { AddNoteScreen } from '@screens/AddNoteScreen';
import { NoteDetailsScreen } from '@screens/NoteDetailsScreen';
import { SearchScreen } from '@screens/SearchScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddWork"
        component={AddWorkScreen}
        options={{ title: 'Add Work' }}
      />
      <Stack.Screen
        name="WorkDetails"
        component={WorkDetailsScreen}
        options={{ title: 'Work Details' }}
      />
      <Stack.Screen
        name="EditWork"
        component={EditWorkScreen}
        options={{ title: 'Edit Work' }}
      />
      <Stack.Screen
        name="AddNote"
        component={AddNoteScreen}
        options={{ title: 'Add Note' }}
      />
      <Stack.Screen
        name="NoteDetails"
        component={NoteDetailsScreen}
        options={{ title: 'Note Details' }}
      />
      <Stack.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'Global Search' }}
      />
    </Stack.Navigator>
  );
};
