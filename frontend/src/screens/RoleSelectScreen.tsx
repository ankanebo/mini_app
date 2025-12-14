// frontend/src/screens/RoleSelectScreen.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import RoleCard from '../components/RoleCard';
import type { RootStackParamList } from '../navigation/RootNavigator.tsx';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'RoleSelect'>;

const RoleSelectScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <LinearGradient
      colors={[colors.gradientFrom, colors.gradientMid, colors.gradientTo]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.pill}>Mission Control</Text>
          <Text style={styles.title}>Производство спутников</Text>
          <Text style={styles.subtitle}>
            Выбери роль, чтобы перейти к рабочей панели. Новая тема — яркий
            IT-грид с акцентами cyan и lime.
          </Text>
        </View>

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
      <View style={styles.gradientHalo} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 22,
    paddingBottom: 32,
  },
  hero: {
    marginBottom: 18,
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: colors.card,
    borderRadius: 999,
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 0.6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 15,
    marginBottom: 20,
    lineHeight: 20,
  },
  gradientHalo: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 260,
    height: 260,
    backgroundColor: colors.glow,
    opacity: 0.5,
    borderRadius: 999,
    shadowColor: colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 40,
  },
});

export default RoleSelectScreen;
