import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { RentalStatus } from '@/features/rental/model/rental.types';
import { useRentalDetailViewModel } from '@/features/rental/viewmodel/useRentalDetailViewModel';
import { LoadingIndicator } from '@/shared/ui/components/LoadingIndicator';
import { Screen } from '@/shared/ui/components/Screen';
import { Button } from '@/shared/ui/design-system/atoms/Button';
import { SectionTitle } from '@/shared/ui/design-system/atoms/SectionTitle';
import { Colors, Elevation, Radius, Spacing } from '@/shared/ui/theme';
import { formatDisplayDateTime } from '@/shared/utils/date';

interface RentalDetailViewProps {
  rentalId: string;
}

export const RentalDetailView = ({ rentalId }: RentalDetailViewProps) => {
  const { rental, status, isLoading, onShareQuotePdf, onShareReturnReportPdf, onStartCheckout, onProceedToAcceptance } =
    useRentalDetailViewModel(rentalId);
  const { t } = useTranslation('rental');

  const header = (
    <Stack.Screen
      options={{
        headerShown: true,
        title: rental ? `${rental.customer.firstName} ${rental.customer.lastName}` : t('detail.title'),
      }}
    />
  );

  if (isLoading || !rental) {
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
        <SectionTitle>{t('detail.customerSectionTitle')}</SectionTitle>
        <Text>{`${rental.customer.firstName} ${rental.customer.lastName}`}</Text>
        <Text>{rental.customer.email}</Text>
        <Text>{rental.customer.phoneNumber}</Text>
        <View style={styles.photosGrid}>
          <View style={styles.licensePhotoItem}>
            <Text style={styles.licensePhotoLabel}>{t('customerStep.frontLabel')}</Text>
            <Image source={{ uri: rental.customer.licensePhotoFrontUri }} style={styles.photoThumbnail} />
          </View>
          <View style={styles.licensePhotoItem}>
            <Text style={styles.licensePhotoLabel}>{t('customerStep.backLabel')}</Text>
            <Image source={{ uri: rental.customer.licensePhotoBackUri }} style={styles.photoThumbnail} />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle>{t('detail.vehicleSectionTitle')}</SectionTitle>
        <Text>
          {`${rental.vehicleSnapshot.make} ${rental.vehicleSnapshot.model} (${rental.vehicleSnapshot.year}) — ${rental.vehicleSnapshot.licensePlate}`}
        </Text>
        <Text>
          {t('card.dateRange', {
            startDate: formatDisplayDateTime(rental.startDate),
            endDate: formatDisplayDateTime(rental.endDate),
          })}
        </Text>
      </View>

      <View style={styles.section}>
        <SectionTitle>{t('detail.inspectionSectionTitle')}</SectionTitle>
        <Text>{t('recapStep.mileageValue', { mileage: rental.mileageAtStart })}</Text>
        <Text>{t('recapStep.fuelValue', { fuelLevel: rental.fuelLevelAtStart })}</Text>
        <Text>{rental.conditionNotes || t('recapStep.noNotes')}</Text>
        <View style={styles.photosGrid}>
          {rental.photos
            .filter((photo) => photo.phase === 'before')
            .map((photo) => (
              <Image key={photo.id} source={{ uri: photo.uri }} style={styles.photoThumbnail} />
            ))}
        </View>
      </View>

      <View style={styles.section}>
        <SectionTitle>{t('detail.quotePdfSectionTitle')}</SectionTitle>
        {rental.quotePdfUri ? (
          <Button label={t('detail.shareQuotePdf')} onPress={onShareQuotePdf} />
        ) : (
          <Text>{t('detail.noPdf')}</Text>
        )}
        {rental.signatureUri ? (
          <>
            <Text style={styles.licensePhotoLabel}>{t('detail.signatureSectionTitle')}</Text>
            <Image source={{ uri: rental.signatureUri }} style={styles.signatureThumbnail} />
          </>
        ) : null}
      </View>

      {status === RentalStatus.PendingAcceptance ? (
        <Button label={t('detail.proceedToAcceptance')} onPress={onProceedToAcceptance} />
      ) : status === RentalStatus.InProgress ? (
        <Button label={t('detail.startCheckout')} onPress={onStartCheckout} />
      ) : (
        <>
          <View style={styles.section}>
            <SectionTitle>{t('detail.afterInspectionSectionTitle')}</SectionTitle>
            {rental.returnedAt ? <Text>{t('detail.returnedOn', { date: formatDisplayDateTime(rental.returnedAt) })}</Text> : null}
            <Text>{t('recapStep.mileageValue', { mileage: rental.mileageAtEnd ?? '—' })}</Text>
            <Text>{t('recapStep.fuelValue', { fuelLevel: rental.fuelLevelAtEnd ?? '—' })}</Text>
            <Text>{rental.endConditionNotes || t('recapStep.noNotes')}</Text>
            <View style={styles.photosGrid}>
              {rental.photos
                .filter((photo) => photo.phase === 'after')
                .map((photo) => (
                  <Image key={photo.id} source={{ uri: photo.uri }} style={styles.photoThumbnail} />
                ))}
            </View>
          </View>

          <View style={styles.section}>
            <SectionTitle>{t('detail.returnReportSectionTitle')}</SectionTitle>
            {rental.returnReportPdfUri ? (
              <Button label={t('detail.shareReturnReportPdf')} onPress={onShareReturnReportPdf} />
            ) : (
              <Text>{t('detail.noReturnReport')}</Text>
            )}
          </View>
        </>
      )}
      </Screen>
    </>
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
  signatureThumbnail: {
    width: 160,
    height: 80,
    borderRadius: Radius.sm,
    backgroundColor: Colors.light.backgroundElement,
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
