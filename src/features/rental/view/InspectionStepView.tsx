import { CameraView } from 'expo-camera';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { WizardProgressHeader } from '@/features/rental/view/WizardProgressHeader';
import { WizardStepFooter } from '@/features/rental/view/WizardStepFooter';
import { useInspectionStepViewModel } from '@/features/rental/viewmodel/useInspectionStepViewModel';
import { Screen } from '@/shared/ui/components/Screen';
import { Button } from '@/shared/ui/design-system/atoms/Button';
import { SliderField } from '@/shared/ui/design-system/atoms/SliderField';
import { TextField } from '@/shared/ui/design-system/atoms/TextField';
import { FormField } from '@/shared/ui/design-system/molecules/FormField';
import { Colors, FontSize, Fonts, Radius, Spacing } from '@/shared/ui/theme';
import { getDirtyErrorMessage } from '@/shared/utils/form';

export const InspectionStepView = () => {
  const {
    form,
    inspectionSchema,
    photos,
    isCameraOpen,
    isCapturing,
    photoRequiredError,
    cameraRef,
    openCamera,
    closeCamera,
    capturePhoto,
    removePhoto,
    onBack,
    onCancel,
  } = useInspectionStepViewModel();
  const { t } = useTranslation('rental');

  return (
    <Screen>
      <WizardProgressHeader currentStep={3} totalSteps={4} title={t('inspectionStep.title')} />

      <form.Field name="mileageAtStart" validators={{ onChange: inspectionSchema.shape.mileageAtStart }}>
        {(field) => (
          <FormField
            label={t('inspectionStep.mileageLabel')}
            errorMessage={getDirtyErrorMessage(field.state.meta.isDirty, field.state.meta.errors[0]?.message)}
          >
            <TextField
              value={String(field.state.value)}
              onChangeText={(text) => field.handleChange(Number(text.replace(/[^0-9]/g, '')) || 0)}
              placeholder={t('inspectionStep.mileagePlaceholder')}
              keyboardType="numeric"
              hasError={field.state.meta.isDirty && !!field.state.meta.errors[0]}
              testID="inspection-step.mileage-field"
            />
          </FormField>
        )}
      </form.Field>

      <form.Field name="fuelLevelAtStart" validators={{ onChange: inspectionSchema.shape.fuelLevelAtStart }}>
        {(field) => (
          <FormField
            label={t('inspectionStep.fuelLevelLabel')}
            errorMessage={getDirtyErrorMessage(field.state.meta.isDirty, field.state.meta.errors[0]?.message)}
          >
            <SliderField
              value={field.state.value}
              onChangeValue={field.handleChange}
              step={5}
              valueLabel={(value) => `${Math.round(value)}%`}
              testID="inspection-step.fuel-level-slider"
            />
          </FormField>
        )}
      </form.Field>

      <form.Field name="conditionNotes">
        {(field) => (
          <FormField label={t('inspectionStep.conditionNotesLabel')}>
            <TextField
              value={field.state.value}
              onChangeText={field.handleChange}
              placeholder={t('inspectionStep.conditionNotesPlaceholder')}
              multiline
              testID="inspection-step.condition-notes-field"
            />
          </FormField>
        )}
      </form.Field>

      <View style={styles.photosSection}>
        <Text style={styles.photosTitle}>{t('inspectionStep.photosTitle')}</Text>

        {photos.length > 0 ? (
          <View style={styles.photosGrid}>
            {photos.map((photo) => (
              <View key={photo.id} style={styles.photoItem}>
                <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
                <Button label={t('inspectionStep.removePhoto')} variant="text" onPress={() => removePhoto(photo.id)} />
              </View>
            ))}
          </View>
        ) : null}

        {photoRequiredError ? (
          <Text style={styles.errorText}>{t('inspectionStep.photoRequiredError')}</Text>
        ) : null}

        {isCameraOpen ? (
          <View style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back" />
            <View style={styles.cameraControls}>
              <Button
                label={t('inspectionStep.closeCamera')}
                variant="outlined"
                onPress={closeCamera}
                testID="inspection-step.close-camera-button"
              />
              <Button
                label={isCapturing ? t('inspectionStep.capturingPhoto') : t('inspectionStep.takePhoto')}
                onPress={capturePhoto}
                disabled={isCapturing}
                testID="inspection-step.capture-photo-button"
              />
            </View>
          </View>
        ) : (
          <Button
            label={t('inspectionStep.openCamera')}
            onPress={openCamera}
            testID="inspection-step.open-camera-button"
          />
        )}
      </View>

      <WizardStepFooter
        onBack={onBack}
        onNext={() => form.handleSubmit()}
        onCancel={onCancel}
        testIDPrefix="inspection-step"
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  photosSection: {
    gap: Spacing.two,
  },
  photosTitle: {
    fontFamily: Fonts.uiBold,
    fontSize: FontSize.body,
    color: Colors.light.text,
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
  errorText: {
    fontFamily: Fonts.ui,
    fontSize: FontSize.meta,
    color: Colors.light.overdue,
  },
  cameraContainer: {
    height: 360,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.two,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});
