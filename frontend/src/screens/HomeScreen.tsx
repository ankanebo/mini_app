// frontend/src/screens/HomeScreen.tsx
import { NativeStackScreenProps } from '@react-navigation/native-stack';
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
      title: 'Материалы и сырьё',
      actions: [
        {
          label: 'Типы сырья (по массе, по возрастанию)',
          entity: 'materials',
          params: { sort: 'asc' },
          target: 'EntityList',
        },
        {
          label: 'Типы сырья (по массе, по убыванию)',
          entity: 'materials',
          params: { sort: 'desc' },
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
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>
          {role === 'admin'
            ? 'Администратор'
            : role === 'engineer'
            ? 'Инженер'
            : 'Руководитель'}
        </Text>
        <Text style={styles.subtitle}>
          Выбери действие. Для администратора доступно управление спутниками и
          этапами.
        </Text>

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
    paddingBottom: 40,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 6,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 14,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
});

export default HomeScreen;
