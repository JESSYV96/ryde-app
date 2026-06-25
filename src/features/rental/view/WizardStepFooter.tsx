import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/shared/ui/design-system/atoms/Button';
import { Spacing } from '@/shared/ui/theme';

interface WizardStepFooterProps {
  onBack?: () => void;
  onNext: () => void;
  onCancel: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  testIDPrefix: string;
}

export const WizardStepFooter = ({
  onBack,
  onNext,
  onCancel,
  nextLabel,
  nextDisabled,
  testIDPrefix,
}: WizardStepFooterProps) => {
  const { t } = useTranslation('rental');
  return (
    <View style={styles.container}>
      <Button
        label={t('wizard.cancel')}
        variant="outlined"
        onPress={onCancel}
        testID={`${testIDPrefix}.cancel-button`}
      />
      <View style={styles.spacer} />
      {onBack ? (
        <Button
          label={t('wizard.back')}
          variant="outlined"
          onPress={onBack}
          testID={`${testIDPrefix}.back-button`}
        />
      ) : null}
      <Button
        label={nextLabel ?? t('wizard.next')}
        onPress={onNext}
        disabled={nextDisabled}
        testID={`${testIDPrefix}.next-button`}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  spacer: {
    flex: 1,
  },
});
