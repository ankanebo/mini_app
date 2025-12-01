// frontend/src/components/ActionButton.tsx
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
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
  const background =
    variant === 'primary'
      ? colors.accent
      : variant === 'secondary'
      ? 'transparent'
      : colors.danger;

  const borderColor =
    variant === 'secondary' ? colors.border : 'transparent';

  return (
    <Pressable
      style={[styles.button, { backgroundColor: background, borderColor }]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.text,
          variant === 'secondary' && { color: colors.textPrimary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 1,
  },
  text: {
    color: '#0b1120',
    fontWeight: '600',
    fontSize: 14,
  },
});

export default ActionButton;
