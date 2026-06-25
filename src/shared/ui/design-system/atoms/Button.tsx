import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, Elevation, FontSize, Fonts, Radius } from '@/shared/ui/theme';

export type ButtonVariant = 'filled' | 'dark' | 'outlined' | 'text';
export type ButtonSize = 'default' | 'small';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  testID?: string;
}

export const Button = ({ label, onPress, variant = 'filled', size = 'default', disabled, testID }: ButtonProps) => {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      style={[
        styles.base,
        size === 'small' ? styles.small : styles.defaultSize,
        variantStyles[variant],
        disabled && styles.disabled,
      ]}
    >
      <Text style={[styles.label, variantLabelStyles[variant]]}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  defaultSize: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontFamily: Fonts.uiBold,
    fontSize: FontSize.body,
  },
});

const variantStyles = StyleSheet.create({
  filled: {
    backgroundColor: Colors.light.primary,
    ...Elevation.float,
  },
  dark: {
    backgroundColor: Colors.light.text,
  },
  outlined: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.text,
  },
  text: {
    backgroundColor: 'transparent',
  },
});

const variantLabelStyles = StyleSheet.create({
  filled: {
    color: '#ffffff',
  },
  dark: {
    color: '#ffffff',
  },
  outlined: {
    color: Colors.light.text,
  },
  text: {
    color: Colors.light.primary,
  },
});
