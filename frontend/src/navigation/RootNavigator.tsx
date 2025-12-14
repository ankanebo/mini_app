// frontend/src/navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import EntityListScreen from '../screens/EntityListScreen';
import HomeScreen from '../screens/HomeScreen';
import RoleSelectScreen from '../screens/RoleSelectScreen';
import SatelliteAdminScreen from '../screens/SatelliteAdminScreen';

export type Role = 'manager' | 'engineer' | 'admin';

export type RootStackParamList = {
  RoleSelect: undefined;
  Home: { role: Role };
  EntityList: {
    role: Role;
    entity: 'materials' | 'satellites' | 'electronics' | 'calendarStats';
    satelliteId?: string;
    sort?: 'asc' | 'desc';
  };
  SatelliteAdmin: {
    role: Role;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="RoleSelect"
        screenOptions={{
          headerStyle: { backgroundColor: '#020617' },
          headerTintColor: '#e5e7eb',
        }}
      >
        <Stack.Screen
          name="RoleSelect"
          component={RoleSelectScreen}
          options={{ title: 'Выбор роли' }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Панель управления' }}
        />
        <Stack.Screen
          name="EntityList"
          component={EntityListScreen}
          options={{ title: 'Данные' }}
        />
        <Stack.Screen
          name="SatelliteAdmin"
          component={SatelliteAdminScreen}
          options={{ title: 'Управление спутниками' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
