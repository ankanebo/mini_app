// frontend/src/navigation/RootNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import EntityListScreen from '../screens/EntityListScreen';
import EngineerMaterialsScreen from '../screens/EngineerMaterialsScreen';
import EngineerStandsScreen from '../screens/EngineerStandsScreen';
import HomeScreen from '../screens/HomeScreen';
import RoleSelectScreen from '../screens/RoleSelectScreen';
import SatelliteAdminScreen from '../screens/SatelliteAdminScreen';
import SatelliteListScreen from '../screens/SatelliteListScreen';
import { colors } from '../theme/colors';

export type Role = 'manager' | 'engineer' | 'admin';

export type RootStackParamList = {
  RoleSelect: undefined;
  Home: { role: Role };
  EntityList: {
    role: Role;
    entity:
      | 'materialsFull'
      | 'satellites'
      | 'electronics'
      | 'calendarStats'
      | 'standTests';
    satelliteId?: string;
    sort?: 'asc' | 'desc';
  };
  SatelliteAdmin: {
    role: Role;
  };
  SatelliteList: {
    role: Role;
  };
  EngineerMaterials: { role: Role };
  EngineerStands: { role: Role };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="RoleSelect"
        screenOptions={{
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.textPrimary,
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: 'transparent' },
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
          name="SatelliteList"
          component={SatelliteListScreen}
          options={{ title: 'Список спутников' }}
        />
        <Stack.Screen
          name="SatelliteAdmin"
          component={SatelliteAdminScreen}
          options={{ title: 'Управление спутниками' }}
        />
        <Stack.Screen
          name="EngineerMaterials"
          component={EngineerMaterialsScreen}
          options={{ title: 'Материалы (инженер)' }}
        />
        <Stack.Screen
          name="EngineerStands"
          component={EngineerStandsScreen}
          options={{ title: 'Стенды (инженер)' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
