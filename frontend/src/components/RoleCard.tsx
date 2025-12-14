// frontend/src/components/RoleCard.tsx
import { LinearGradient } from 'expo-linear-gradient';
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
    <Pressable onPress={onPress} style={{ marginBottom: 16 }}>
      <LinearGradient
        colors={['rgba(60,243,255,0.16)', 'rgba(125,255,156,0.1)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.cardInner}>
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
        </View>
        <View style={styles.glow} />
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  cardInner: {
    padding: 18,
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
    color: '#041013',
    fontWeight: '700',
    fontSize: 12,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  description: {
    color: colors.textSecondary,
    fontSize: 14,
    lineHeight: 19,
  },
  glow: {
    position: 'absolute',
    right: -12,
    bottom: -18,
    width: 120,
    height: 120,
    backgroundColor: colors.glow,
    opacity: 0.8,
    borderRadius: 999,
    shadowColor: colors.accent,
    shadowOpacity: 0.4,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
  },
});

export default RoleCard;
