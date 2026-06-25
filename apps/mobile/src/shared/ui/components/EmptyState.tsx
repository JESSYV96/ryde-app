import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Fonts } from '@/shared/ui/theme';

interface EmptyStateProps {
  message: string;
}

export const EmptyState = ({ message }: EmptyStateProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  message: {
    fontFamily: Fonts.ui,
    fontSize: FontSize.body,
    color: Colors.light.textSecondary,
  },
});
