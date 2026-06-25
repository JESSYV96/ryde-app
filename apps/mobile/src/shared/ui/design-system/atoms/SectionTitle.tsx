import type { ReactNode } from 'react';
import { StyleSheet, Text } from 'react-native';

import { Colors, FontSize, Fonts, Spacing } from '@/shared/ui/theme';

interface SectionTitleProps {
  children: ReactNode;
}

export const SectionTitle = ({ children }: SectionTitleProps) => <Text style={styles.title}>{children}</Text>;

const styles = StyleSheet.create({
  title: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: FontSize.subhead,
    color: Colors.light.text,
    marginBottom: Spacing.half,
  },
});
