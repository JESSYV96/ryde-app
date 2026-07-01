import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { useVehicleDetailViewModel } from '@/features/fleet/viewmodel/useVehicleDetailViewModel';
import { LoadingIndicator } from '@/shared/ui/components/LoadingIndicator';
import { Screen } from '@/shared/ui/components/Screen';
import { Button } from '@/shared/ui/design-system/atoms/Button';
import { SectionTitle } from '@/shared/ui/design-system/atoms/SectionTitle';
import { Colors, Elevation, FontSize, Fonts, Radius, Spacing } from '@/shared/ui/theme';
import { formatPrice } from '@/shared/utils/pricing';

interface VehicleDetailViewProps {
  vehicleId: string;
}

export const VehicleDetailView = ({ vehicleId }: VehicleDetailViewProps) => {
  const {
    vehicle,
    isLoading,
    currency,
    isDeleting,
    enlargedPhotoUri,
    onEdit,
    onDelete,
    onOpenPhoto,
    onClosePhoto,
  } = useVehicleDetailViewModel(vehicleId);
  const { t } = useTranslation('fleet');

  const header = (
    <Stack.Screen
      options={{
        headerShown: true,
        title: vehicle ? `${vehicle.make} ${vehicle.model}` : t('detail.title'),
      }}
    />
  );

  if (isLoading || !vehicle) {
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
        {vehicle.photos.length > 0 ? (
          <View style={styles.photosStrip}>
            {vehicle.photos.map((photo) => (
              <Pressable
                key={photo.id}
                onLongPress={() => onOpenPhoto(photo.uri)}
                testID="vehicle-detail.photo-thumbnail"
              >
                <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
              </Pressable>
            ))}
          </View>
        ) : null}

        <Modal visible={enlargedPhotoUri !== null} transparent animationType="fade" onRequestClose={onClosePhoto}>
          <Pressable style={styles.viewerBackdrop} onPress={onClosePhoto} testID="vehicle-detail.photo-viewer">
            {enlargedPhotoUri ? (
              <Image source={{ uri: enlargedPhotoUri }} style={styles.viewerImage} contentFit="contain" />
            ) : null}
          </Pressable>
        </Modal>

        <View style={styles.section}>
          <SectionTitle>{`${vehicle.make} ${vehicle.model}`}</SectionTitle>
          <Text style={styles.row}>{`${t('detail.yearLabel')}: ${vehicle.year}`}</Text>
          <Text style={styles.row}>{`${t('detail.licensePlateLabel')}: ${vehicle.licensePlate}`}</Text>
          <Text style={styles.row}>{`${t('detail.colorLabel')}: ${vehicle.color}`}</Text>
          <Text style={styles.row}>
            {`${t('detail.dailyRateLabel')}: ${formatPrice(vehicle.dailyRate, currency)}`}
          </Text>
          <Text style={styles.row}>
            {`${t('detail.currentMileageLabel')}: ${vehicle.currentMileage} km`}
          </Text>
        </View>

        <View style={styles.actions}>
          <Button
            label={t('detail.editButton')}
            variant="outlined"
            onPress={onEdit}
            testID="vehicle-detail.edit-button"
          />
          <Button
            label={t('detail.deleteButton')}
            variant="text"
            onPress={onDelete}
            disabled={isDeleting}
            testID="vehicle-detail.delete-button"
          />
        </View>
      </Screen>
    </>
  );
};

const styles = StyleSheet.create({
  photosStrip: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  photoThumbnail: {
    width: 88,
    height: 88,
    borderRadius: Radius.sm,
  },
  viewerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerImage: {
    width: '100%',
    height: '100%',
  },
  section: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.background,
    ...Elevation.card,
  },
  row: {
    fontFamily: Fonts.ui,
    fontSize: FontSize.body,
    color: Colors.light.text,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
});
