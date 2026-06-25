import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { WizardProgressHeader } from '@/features/rental/view/WizardProgressHeader';
import { WizardStepFooter } from '@/features/rental/view/WizardStepFooter';
import { useRecapStepViewModel } from '@/features/rental/viewmodel/useRecapStepViewModel';
import { useRentalDurationLabel } from '@/features/rental/viewmodel/useRentalDurationLabel';
import { LoadingIndicator } from '@/shared/ui/components/LoadingIndicator';
import { Screen } from '@/shared/ui/components/Screen';
import { Colors, Elevation, FontSize, Fonts, Radius, Spacing } from '@/shared/ui/theme';
import { formatDisplayDateTime } from '@/shared/utils/date';
import { formatPrice } from '@/shared/utils/pricing';

export const RecapStepView = () => {
  const { draft, vehicle, quotePrice, currency, form, onBack, onCancel } = useRecapStepViewModel();
  const { t } = useTranslation('rental');
  const durationLabel = useRentalDurationLabel(draft.startDate || null, draft.endDate || null);

  if (!vehicle) {
    return (
      <Screen>
        <WizardProgressHeader currentStep={4} totalSteps={4} title={t('recapStep.title')} />
        <LoadingIndicator />
      </Screen>
    );
  }

  return (
    <Screen>
      <WizardProgressHeader currentStep={4} totalSteps={4} title={t('recapStep.title')} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('recapStep.customerSectionTitle')}</Text>
        <Text>{`${draft.customer.firstName} ${draft.customer.lastName}`}</Text>
        <Text>{draft.customer.email}</Text>
        <Text>{draft.customer.phoneNumber}</Text>
        <View style={styles.photosGrid}>
          <View style={styles.licensePhotoItem}>
            <Text style={styles.licensePhotoLabel}>{t('customerStep.frontLabel')}</Text>
            <Image source={{ uri: draft.customer.licensePhotoFrontUri }} style={styles.photoThumbnail} />
          </View>
          <View style={styles.licensePhotoItem}>
            <Text style={styles.licensePhotoLabel}>{t('customerStep.backLabel')}</Text>
            <Image source={{ uri: draft.customer.licensePhotoBackUri }} style={styles.photoThumbnail} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('recapStep.vehicleSectionTitle')}</Text>
        <Text>{`${vehicle.make} ${vehicle.model} (${vehicle.year}) — ${vehicle.licensePlate}`}</Text>
        <Text>
          {t('recapStep.dateRange', {
            startDate: draft.startDate ? formatDisplayDateTime(draft.startDate) : '',
            endDate: draft.endDate ? formatDisplayDateTime(draft.endDate) : '',
          })}
        </Text>
        {durationLabel ? <Text>{t('recapStep.durationLabel', { duration: durationLabel })}</Text> : null}
        {quotePrice ? (
          <Text>{t('recapStep.totalPriceLabel', { price: formatPrice(quotePrice.totalPrice, currency) })}</Text>
        ) : null}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('recapStep.inspectionSectionTitle')}</Text>
        <Text>{t('recapStep.mileageValue', { mileage: draft.inspection.mileageAtStart ?? '—' })}</Text>
        <Text>{t('recapStep.fuelValue', { fuelLevel: draft.inspection.fuelLevelAtStart ?? '—' })}</Text>
        <Text>{draft.inspection.conditionNotes || t('recapStep.noNotes')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('recapStep.photosSectionTitle', { count: draft.photos.length })}</Text>
        <View style={styles.photosGrid}>
          {draft.photos.map((photo) => (
            <Image key={photo.id} source={{ uri: photo.uri }} style={styles.photoThumbnail} />
          ))}
        </View>
      </View>

      <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting] as const}>
        {([canSubmit, isSubmitting]) => (
          <WizardStepFooter
            onBack={onBack}
            onCancel={onCancel}
            onNext={() => form.handleSubmit()}
            nextLabel={isSubmitting ? t('recapStep.submitting') : t('recapStep.confirmAndGeneratePdf')}
            nextDisabled={!canSubmit || isSubmitting}
            testIDPrefix="recap-step"
          />
        )}
      </form.Subscribe>
    </Screen>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.background,
    ...Elevation.card,
  },
  sectionTitle: {
    fontFamily: Fonts.displaySemiBold,
    fontSize: FontSize.subhead,
    color: Colors.light.text,
    marginBottom: Spacing.half,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: Radius.sm,
  },
  licensePhotoItem: {
    alignItems: 'center',
    gap: Spacing.half,
  },
  licensePhotoLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
});
