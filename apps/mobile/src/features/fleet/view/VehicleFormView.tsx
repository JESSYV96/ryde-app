import { Image } from 'expo-image';
import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { VEHICLE_TYPES } from '@/features/fleet/model/vehicle.types';
import { useVehicleFormViewModel } from '@/features/fleet/viewmodel/useVehicleFormViewModel';
import { LoadingIndicator } from '@/shared/ui/components/LoadingIndicator';
import { Screen } from '@/shared/ui/components/Screen';
import { Button } from '@/shared/ui/design-system/atoms/Button';
import { TextField } from '@/shared/ui/design-system/atoms/TextField';
import { FormField } from '@/shared/ui/design-system/molecules/FormField';
import { SegmentedControl } from '@/shared/ui/design-system/molecules/SegmentedControl';
import { Colors, FontSize, Fonts, Radius, Spacing } from '@/shared/ui/theme';
import { getDirtyErrorMessage } from '@/shared/utils/form';

interface VehicleFormViewProps {
  vehicleId?: string;
}

export const VehicleFormView = ({ vehicleId }: VehicleFormViewProps) => {
  const {
    form,
    vehicleSchema,
    isEdit,
    isLoading,
    isSubmitting,
    photos,
    isAnalyzing,
    recognitionStatus,
    addPhotoFromCamera,
    addPhotosFromLibrary,
    removePhoto,
    setPrimaryPhoto,
    analyzePhotos,
    onCancel,
  } = useVehicleFormViewModel(vehicleId);
  const { t } = useTranslation('fleet');

  const header = (
    <Stack.Screen
      options={{ headerShown: true, title: isEdit ? t('form.editTitle') : t('form.createTitle') }}
    />
  );

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
        <View style={styles.photosSection}>
          <Text style={styles.photosTitle}>{t('photos.title')}</Text>

          {photos.length > 0 ? (
            <View style={styles.photosGrid}>
              {photos.map((photo) => (
                <View key={photo.id} style={styles.photoItem}>
                  <Pressable onPress={() => setPrimaryPhoto(photo.id)} testID="vehicle-form.photo-thumbnail">
                    <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
                    {photo.isPrimary ? (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeLabel}>★</Text>
                      </View>
                    ) : null}
                  </Pressable>
                  <Button
                    label={t('photos.remove')}
                    variant="text"
                    onPress={() => removePhoto(photo.id)}
                    testID="vehicle-form.remove-photo-button"
                  />
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.photosHint}>{t('photos.hint')}</Text>
          )}

          {photos.length > 1 ? <Text style={styles.photosHint}>{t('photos.primaryHint')}</Text> : null}

          <View style={styles.photosActions}>
            <Button
              label={t('photos.takePhoto')}
              variant="outlined"
              onPress={addPhotoFromCamera}
              testID="vehicle-form.take-photo-button"
            />
            <Button
              label={t('photos.chooseFromGallery')}
              variant="outlined"
              onPress={addPhotosFromLibrary}
              testID="vehicle-form.choose-photo-button"
            />
          </View>

          {photos.length > 0 ? (
            <Button
              label={isAnalyzing ? t('photos.analyzing') : t('photos.prefill')}
              onPress={analyzePhotos}
              disabled={isAnalyzing}
              testID="vehicle-form.prefill-button"
            />
          ) : null}

          {recognitionStatus === 'error' ? (
            <Text style={styles.errorText}>{t('photos.recognitionError')}</Text>
          ) : null}
          {recognitionStatus === 'empty' ? (
            <Text style={styles.photosHint}>{t('photos.recognitionEmpty')}</Text>
          ) : null}
        </View>

        <form.Field name="type">
          {(field) => (
            <FormField label={t('form.typeLabel')}>
              <SegmentedControl
                value={field.state.value}
                onChange={field.handleChange}
                options={VEHICLE_TYPES.map((type) => ({ value: type, label: t(`type.${type}`) }))}
              />
            </FormField>
          )}
        </form.Field>

        <form.Field name="make" validators={{ onChange: vehicleSchema.shape.make }}>
          {(field) => (
            <FormField
              label={t('form.makeLabel')}
              errorMessage={getDirtyErrorMessage(field.state.meta.isDirty, field.state.meta.errors[0]?.message)}
            >
              <TextField
                value={field.state.value}
                onChangeText={field.handleChange}
                placeholder={t('form.makePlaceholder')}
                hasError={field.state.meta.isDirty && !!field.state.meta.errors[0]}
                testID="vehicle-form.make-field"
              />
            </FormField>
          )}
        </form.Field>

        <form.Field name="model" validators={{ onChange: vehicleSchema.shape.model }}>
          {(field) => (
            <FormField
              label={t('form.modelLabel')}
              errorMessage={getDirtyErrorMessage(field.state.meta.isDirty, field.state.meta.errors[0]?.message)}
            >
              <TextField
                value={field.state.value}
                onChangeText={field.handleChange}
                placeholder={t('form.modelPlaceholder')}
                hasError={field.state.meta.isDirty && !!field.state.meta.errors[0]}
                testID="vehicle-form.model-field"
              />
            </FormField>
          )}
        </form.Field>

        <form.Field name="year" validators={{ onChange: vehicleSchema.shape.year }}>
          {(field) => (
            <FormField
              label={t('form.yearLabel')}
              errorMessage={getDirtyErrorMessage(field.state.meta.isDirty, field.state.meta.errors[0]?.message)}
            >
              <TextField
                value={field.state.value}
                onChangeText={field.handleChange}
                placeholder={t('form.yearPlaceholder')}
                keyboardType="numeric"
                hasError={field.state.meta.isDirty && !!field.state.meta.errors[0]}
                testID="vehicle-form.year-field"
              />
            </FormField>
          )}
        </form.Field>

        <form.Field name="licensePlate" validators={{ onChange: vehicleSchema.shape.licensePlate }}>
          {(field) => (
            <FormField
              label={t('form.licensePlateLabel')}
              errorMessage={getDirtyErrorMessage(field.state.meta.isDirty, field.state.meta.errors[0]?.message)}
            >
              <TextField
                value={field.state.value}
                onChangeText={field.handleChange}
                placeholder={t('form.licensePlatePlaceholder')}
                hasError={field.state.meta.isDirty && !!field.state.meta.errors[0]}
                testID="vehicle-form.license-plate-field"
              />
            </FormField>
          )}
        </form.Field>

        <form.Field name="color" validators={{ onChange: vehicleSchema.shape.color }}>
          {(field) => (
            <FormField
              label={t('form.colorLabel')}
              errorMessage={getDirtyErrorMessage(field.state.meta.isDirty, field.state.meta.errors[0]?.message)}
            >
              <TextField
                value={field.state.value}
                onChangeText={field.handleChange}
                placeholder={t('form.colorPlaceholder')}
                hasError={field.state.meta.isDirty && !!field.state.meta.errors[0]}
                testID="vehicle-form.color-field"
              />
            </FormField>
          )}
        </form.Field>

        <form.Field name="dailyRate" validators={{ onChange: vehicleSchema.shape.dailyRate }}>
          {(field) => (
            <FormField
              label={t('form.dailyRateLabel')}
              errorMessage={getDirtyErrorMessage(field.state.meta.isDirty, field.state.meta.errors[0]?.message)}
            >
              <TextField
                value={field.state.value}
                onChangeText={field.handleChange}
                placeholder={t('form.dailyRatePlaceholder')}
                keyboardType="decimal-pad"
                hasError={field.state.meta.isDirty && !!field.state.meta.errors[0]}
                testID="vehicle-form.daily-rate-field"
              />
            </FormField>
          )}
        </form.Field>

        <form.Field name="includedKmPerDay" validators={{ onChange: vehicleSchema.shape.includedKmPerDay }}>
          {(field) => (
            <FormField
              label={t('form.includedKmPerDayLabel')}
              errorMessage={getDirtyErrorMessage(field.state.meta.isDirty, field.state.meta.errors[0]?.message)}
            >
              <TextField
                value={field.state.value}
                onChangeText={field.handleChange}
                placeholder={t('form.includedKmPerDayPlaceholder')}
                keyboardType="numeric"
                hasError={field.state.meta.isDirty && !!field.state.meta.errors[0]}
                testID="vehicle-form.included-km-field"
              />
            </FormField>
          )}
        </form.Field>

        <form.Field name="extraKmRate" validators={{ onChange: vehicleSchema.shape.extraKmRate }}>
          {(field) => (
            <FormField
              label={t('form.extraKmRateLabel')}
              errorMessage={getDirtyErrorMessage(field.state.meta.isDirty, field.state.meta.errors[0]?.message)}
            >
              <TextField
                value={field.state.value}
                onChangeText={field.handleChange}
                placeholder={t('form.extraKmRatePlaceholder')}
                keyboardType="decimal-pad"
                hasError={field.state.meta.isDirty && !!field.state.meta.errors[0]}
                testID="vehicle-form.extra-km-rate-field"
              />
            </FormField>
          )}
        </form.Field>

        <form.Field name="currentMileage" validators={{ onChange: vehicleSchema.shape.currentMileage }}>
          {(field) => (
            <FormField
              label={t('form.currentMileageLabel')}
              errorMessage={getDirtyErrorMessage(field.state.meta.isDirty, field.state.meta.errors[0]?.message)}
            >
              <TextField
                value={field.state.value}
                onChangeText={field.handleChange}
                placeholder={t('form.currentMileagePlaceholder')}
                keyboardType="numeric"
                hasError={field.state.meta.isDirty && !!field.state.meta.errors[0]}
                testID="vehicle-form.current-mileage-field"
              />
            </FormField>
          )}
        </form.Field>

        <View style={styles.actions}>
          <Button
            label={t('form.cancel')}
            variant="outlined"
            onPress={onCancel}
            testID="vehicle-form.cancel-button"
          />
          <Button
            label={isSubmitting ? t('form.saving') : t('form.save')}
            onPress={() => form.handleSubmit()}
            disabled={isSubmitting}
            testID="vehicle-form.save-button"
          />
        </View>
      </Screen>
    </>
  );
};

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
    marginTop: Spacing.two,
  },
  photosSection: {
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  photosTitle: {
    fontFamily: Fonts.uiBold,
    fontSize: FontSize.body,
    color: Colors.light.text,
  },
  photosHint: {
    fontFamily: Fonts.ui,
    fontSize: FontSize.meta,
    color: Colors.light.textSecondary,
  },
  photosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  photoItem: {
    alignItems: 'center',
    gap: Spacing.half,
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: Radius.sm,
  },
  primaryBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 20,
    height: 20,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBadgeLabel: {
    fontFamily: Fonts.uiBold,
    fontSize: FontSize.meta,
    color: Colors.light.background,
  },
  photosActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  errorText: {
    fontFamily: Fonts.ui,
    fontSize: FontSize.meta,
    color: Colors.light.overdue,
  },
});
