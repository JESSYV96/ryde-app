import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Fonts, Spacing } from '@/shared/ui/theme';

interface WizardProgressHeaderProps {
  currentStep: number;
  totalSteps: number;
  title: string;
}

export const WizardProgressHeader = ({ currentStep, totalSteps, title }: WizardProgressHeaderProps) => {
  const { t } = useTranslation('rental');
  return (
    <View style={styles.container}>
      <Text style={styles.step}>{t('wizard.stepIndicator', { currentStep, totalSteps })}</Text>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: Spacing.one,
    marginBottom: Spacing.three,
  },
  step: {
    fontFamily: Fonts.ui,
    fontSize: FontSize.meta,
    color: Colors.light.textSecondary,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSize.heading,
    color: Colors.light.text,
  },
});
