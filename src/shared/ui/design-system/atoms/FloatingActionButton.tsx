import { Pressable, StyleSheet, Text } from 'react-native';

import { Colors, Elevation } from '@/shared/ui/theme';

interface FloatingActionButtonProps {
  onPress: () => void;
  label?: string;
}

export const FloatingActionButton = ({ onPress, label = '+' }: FloatingActionButtonProps) => {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Elevation.float,
  },
  label: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 28,
  },
});
