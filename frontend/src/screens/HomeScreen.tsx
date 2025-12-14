// frontend/src/screens/HomeScreen.tsx
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import ActionButton from '../components/ActionButton';
import type { Role, RootStackParamList } from '../navigation/RootNavigator.tsx';
import { colors } from '../theme/colors';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

type SectionAction = {
  label: string;
  entity?: 'materials' | 'satellites' | 'electronics' | 'calendarStats';
  params?: Record<string, any>;
  // если указано target === 'SatelliteAdmin', уходим на экран администрирования
  target?: 'EntityList' | 'SatelliteAdmin';
};

type Section = {
  title: string;
  actions: SectionAction[];
};

const buildSections = (role: Role): Section[] => {
  const base: Section[] = [
    {
      title: 'Материалы и стенды',
      actions: [
        {
          label: 'Материалы и характеристики',
          entity: 'materialsFull',
          target: 'EntityList',
        },
        {
          label: 'Стенды, сенсоры и испытания',
          entity: 'standTests',
          target: 'EntityList',
        },
      ],
    },
    {
      title: 'Спутники и календарный план',
      actions: [
        {
          label: 'Список спутников',
          entity: 'satellites',
          target: 'EntityList',
        },
        {
          label: 'Календарный план (нужно выбрать спутник)',
          entity: 'calendarStats',
          target: 'EntityList',
        },
      ],
    },
    {
      title: 'Электроника',
      actions: [
        {
          label: 'Электроника по спутнику (стоимость и агрегаты)',
          entity: 'electronics',
          target: 'EntityList',
        },
      ],
    },
  ];

  if (role === 'engineer') {
    base.push({
      title: 'Инженерные операции',
      actions: [
        {
          label: 'Работа с документацией, стендами и сенсорами (шаблон)',
          entity: 'satellites',
          target: 'EntityList',
        },
      ],
    });
  }

  if (role === 'admin') {
    base.push({
      title: 'Администрирование',
      actions: [
        {
          label: 'Управление спутниками и этапами',
          target: 'SatelliteAdmin',
        },
      ],
    });
  }

  return base;
};

const HomeScreen: React.FC<Props> = ({ route, navigation }) => {
  const { role } = route.params;
  const sections = buildSections(role);

  return (
    <LinearGradient
      colors={[colors.gradientFrom, colors.gradientMid, colors.gradientTo]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {role === 'admin'
                ? 'Администратор'
                : role === 'engineer'
                ? 'Инженер'
                : 'Руководитель'}
            </Text>
          </View>
          <Text style={styles.title}>Рабочая панель</Text>
          <Text style={styles.subtitle}>
            Обновлённый интерфейс с яркими акцентами и стеклянными карточками.
            Выбери действие: списки, отчёты или администрирование.
          </Text>
        </View>

        {sections.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.actions.map((action) => (
              <ActionButton
                key={action.label}
                label={action.label}
                onPress={() => {
                  if (action.target === 'SatelliteAdmin') {
                    navigation.navigate('SatelliteAdmin', { role });
                  } else {
                    // по умолчанию – список EntityList
                    navigation.navigate('EntityList', {
                      role,
                      entity: action.entity as any,
                      ...(action.params || {}),
                    });
                  }
                }}
              />
            ))}
          </View>
        ))}
      </ScrollView>
      <View pointerEvents="none" style={styles.glow} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 22,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 18,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  roleText: {
    color: colors.accent,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 24,
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
  section: {
    marginBottom: 20,
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    shadowColor: colors.accent,
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  glow: {
    position: 'absolute',
    left: -80,
    bottom: -120,
    width: 280,
    height: 280,
    backgroundColor: colors.glow,
    opacity: 0.45,
    borderRadius: 999,
    shadowColor: colors.accentSoft,
    shadowOpacity: 0.5,
    shadowRadius: 36,
  },
});

export default HomeScreen;
