import { Host, Picker } from '@expo/ui';
import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { useSettingsViewModel } from '@/features/settings/viewmodel/useSettingsViewModel';
import { LoadingIndicator } from '@/shared/ui/components/LoadingIndicator';
import { Screen } from '@/shared/ui/components/Screen';
import { Button } from '@/shared/ui/design-system/atoms/Button';
import { Logo } from '@/shared/ui/design-system/atoms/Logo';
import { SectionTitle } from '@/shared/ui/design-system/atoms/SectionTitle';
import { Colors, Elevation, Radius, Spacing } from '@/shared/ui/theme';

export const SettingsView = () => {
  const { t } = useTranslation('settings');
  const { isLoading, form, currencies, isSaving } = useSettingsViewModel();

  const header = <Tabs.Screen options={{ headerShown: true, headerTitle: () => <Logo label={t('tabName')} size={24} /> }} />;

  if (isLoading) {
    return (
      <>
        {header}
        <Screen>
          <LoadingIndicator />
        </Screen>
      </>
    );
  }

  return (
    <>
      {header}
      <Screen>
        <View style={styles.section}>
          <SectionTitle>{t('currencySectionTitle')}</SectionTitle>
          <form.Field name="currency">
            {(field) => (
              <Host matchContents>
                <Picker
                  selectedValue={field.state.value}
                  onValueChange={(value) => field.handleChange(value as typeof field.state.value)}
                  appearance="wheel"
                >
                  {currencies.map((currency) => (
                    <Picker.Item key={currency} label={currency} value={currency} />
                  ))}
                </Picker>
              </Host>
            )}
          </form.Field>
          <Button label={t('saveButton')} onPress={() => form.handleSubmit()} disabled={isSaving} />
        </View>
      </Screen>
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
    padding: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.background,
    ...Elevation.card,
  },
});
