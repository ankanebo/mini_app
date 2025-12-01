// frontend/src/screens/RoleSelectScreen.tsx
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import RoleCard from '../components/RoleCard';
import type { RootStackParamList } from '../navigation/RootNavigator.tsx';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'RoleSelect'>;

const RoleSelectScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Производство спутников</Text>
        <Text style={styles.subtitle}>
          Выбери роль, чтобы перейти к рабочей панели.
        </Text>

        <RoleCard
          role="manager"
          title="Руководитель"
          description="Просмотр материалов, спутников, стендов, документации и агрегирующие отчёты по проекту."
          onPress={() => navigation.navigate('Home', { role: 'manager' })}
        />

        <RoleCard
          role="engineer"
          title="Инженер"
          description="Работа с документацией, стендами, сенсорами, материалами и требованиями."
          onPress={() => navigation.navigate('Home', { role: 'engineer' })}
        />

        <RoleCard
          role="admin"
          title="Администратор"
          description="Управление спутниками, электроникой, календарным планом и общие отчёты."
          onPress={() => navigation.navigate('Home', { role: 'admin' })}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scroll: {
    padding: 20,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 24,
  },
});

export default RoleSelectScreen;
