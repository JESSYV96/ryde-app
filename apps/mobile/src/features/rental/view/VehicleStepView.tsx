import { useStore } from '@tanstack/react-form';
import { useTranslation } from 'react-i18next';
import { Text } from 'react-native';

import { WizardProgressHeader } from '@/features/rental/view/WizardProgressHeader';
import { WizardStepFooter } from '@/features/rental/view/WizardStepFooter';
import { useRentalDurationLabel } from '@/features/rental/viewmodel/useRentalDurationLabel';
import { useVehicleStepViewModel } from '@/features/rental/viewmodel/useVehicleStepViewModel';
import { Screen } from '@/shared/ui/components/Screen';
import { VehiclePickerView } from '@/shared/ui/components/VehiclePickerView';
import { DateField } from '@/shared/ui/design-system/atoms/DateField';
import { FormField } from '@/shared/ui/design-system/molecules/FormField';
import { getDirtyErrorMessage } from '@/shared/utils/form';

export const VehicleStepView = () => {
  const { form, vehicles, onBack, onCancel } = useVehicleStepViewModel();
  const { t } = useTranslation('rental');

  const [liveStartDate, liveEndDate] = useStore(form.store, (state) => [
    state.values.startDate,
    state.values.endDate,
  ]);
  const durationLabel = useRentalDurationLabel(liveStartDate || null, liveEndDate || null);

  return (
    <Screen>
      <WizardProgressHeader currentStep={2} totalSteps={4} title={t('vehicleStep.title')} />

      <form.Field name="startDate">
        {(field) => (
          <FormField
            label={t('vehicleStep.startDateLabel')}
            errorMessage={getDirtyErrorMessage(field.state.meta.isDirty, field.state.meta.errors[0]?.message)}
          >
            <DateField
              value={field.state.value ? new Date(field.state.value) : null}
              onChangeValue={(date) => field.handleChange(date.toISOString())}
              placeholder={t('vehicleStep.selectDatePlaceholder')}
              testID="vehicle-step.start-date-field"
            />
          </FormField>
        )}
      </form.Field>

      <form.Field name="endDate">
        {(field) => (
          <FormField
            label={t('vehicleStep.endDateLabel')}
            errorMessage={getDirtyErrorMessage(field.state.meta.isDirty, field.state.meta.errors[0]?.message)}
          >
            <DateField
              value={field.state.value ? new Date(field.state.value) : null}
              onChangeValue={(date) => field.handleChange(date.toISOString())}
              placeholder={t('vehicleStep.selectDatePlaceholder')}
              testID="vehicle-step.end-date-field"
            />
          </FormField>
        )}
      </form.Field>

      {durationLabel ? <Text>{t('vehicleStep.durationLabel', { duration: durationLabel })}</Text> : null}

      <form.Field name="vehicleId">
        {(field) => (
          <FormField
            label={t('vehicleStep.vehicleLabel')}
            errorMessage={getDirtyErrorMessage(field.state.meta.isDirty, field.state.meta.errors[0]?.message)}
          >
            <VehiclePickerView
              vehicles={vehicles}
              selectedVehicleId={field.state.value || null}
              onSelectVehicle={field.handleChange}
              testID="vehicle-step.vehicle-picker"
            />
          </FormField>
        )}
      </form.Field>

      <WizardStepFooter onBack={onBack} onNext={() => form.handleSubmit()} onCancel={onCancel} testIDPrefix="vehicle-step" />
    </Screen>
  );
};
