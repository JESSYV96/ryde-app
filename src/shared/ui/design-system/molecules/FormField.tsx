import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Fonts, Spacing } from '@/shared/ui/theme';

interface FormFieldProps {
  label: string;
  errorMessage?: string;
  children: ReactNode;
}

export const FormField = ({ label, errorMessage, children }: FormFieldProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      {children}
      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
  },
  label: {
    fontFamily: Fonts.uiBold,
    fontSize: FontSize.meta,
    color: Colors.light.text,
  },
  error: {
    fontFamily: Fonts.ui,
    fontSize: FontSize.meta,
    color: Colors.light.overdue,
  },
});
