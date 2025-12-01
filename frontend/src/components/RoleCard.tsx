// frontend/src/components/RoleCard.tsx
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Role } from '../navigation/RootNavigator';
import { colors } from '../theme/colors';

type Props = {
  role: Role;
  title: string;
  description: string;
  onPress: () => void;
};

const RoleCard: React.FC<Props> = ({ role, title, description, onPress }) => {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {role === 'admin'
            ? 'Администратор'
            : role === 'engineer'
            ? 'Инженер'
            : 'Руководитель'}
        </Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: colors.accentSoft,
    marginBottom: 8,
  },
  badgeText: {
    color: '#0b1120',
    fontWeight: '600',
    fontSize: 12,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 18,
  },
});

export default RoleCard;
