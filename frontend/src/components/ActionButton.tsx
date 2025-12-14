// frontend/src/components/ActionButton.tsx
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';

type Props = {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onPress: () => void;
};

const ActionButton: React.FC<Props> = ({
  label,
  variant = 'primary',
  onPress,
}) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pressable,
        pressed && { opacity: 0.92 },
      ]}
      hitSlop={6}
    >
      {isPrimary ? (
        <LinearGradient
          colors={[colors.accent, colors.accentSoft]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.button}
        >
          <Text style={styles.primaryText}>{label}</Text>
        </LinearGradient>
      ) : (
        <View
          style={[
            styles.button,
            isSecondary
              ? styles.secondary
              : { backgroundColor: colors.danger, borderColor: 'transparent' },
          ]}
        >
          <Text
            style={[
              styles.text,
              isSecondary ? styles.secondaryText : styles.primaryText,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '100%',
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#00e0ff',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  text: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  primaryText: {
    color: '#051017',
    fontWeight: '700',
    fontSize: 15,
  },
  pressable: {
    alignSelf: 'stretch',
    width: '100%',
  },
  secondary: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: colors.border,
  },
  secondaryText: {
    color: colors.textPrimary,
  },
});

export default ActionButton;
