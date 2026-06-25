import { CameraView } from 'expo-camera';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { WizardStepFooter } from '@/features/rental/view/WizardStepFooter';
import { useReturnStepViewModel } from '@/features/rental/viewmodel/useReturnStepViewModel';
import { Screen } from '@/shared/ui/components/Screen';
import { Button } from '@/shared/ui/design-system/atoms/Button';
import { SliderField } from '@/shared/ui/design-system/atoms/SliderField';
import { TextField } from '@/shared/ui/design-system/atoms/TextField';
import { FormField } from '@/shared/ui/design-system/molecules/FormField';
import { Colors, FontSize, Fonts, Radius, Spacing } from '@/shared/ui/theme';
import { getDirtyErrorMessage } from '@/shared/utils/form';

interface ReturnStepViewProps {
  rentalId: string;
}

export const ReturnStepView = ({ rentalId }: ReturnStepViewProps) => {
  const {
    form,
    returnSchema,
    mileageAtEndValidator,
    photos,
    isCameraOpen,
    isCapturing,
    photoRequiredError,
    cameraRef,
    openCamera,
    closeCamera,
    capturePhoto,
    removePhoto,
    onCancel,
  } = useReturnStepViewModel(rentalId);
  const { t } = useTranslation('rental');

  return (
    <Screen>
      <Text style={styles.title}>{t('returnStep.title')}</Text>

      <form.Field name="mileageAtEnd" validators={{ onChange: mileageAtEndValidator }}>
        {(field) => (
          <FormField
            label={t('returnStep.mileageLabel')}
            errorMessage={getDirtyErrorMessage(field.state.meta.isDirty, field.state.meta.errors[0])}
          >
            <TextField
              value={String(field.state.value)}
              onChangeText={(text) => field.handleChange(Number(text.replace(/[^0-9]/g, '')) || 0)}
              placeholder={t('returnStep.mileagePlaceholder')}
              keyboardType="numeric"
              hasError={field.state.meta.isDirty && !!field.state.meta.errors[0]}
            />
          </FormField>
        )}
      </form.Field>

      <form.Field name="fuelLevelAtEnd" validators={{ onChange: returnSchema.shape.fuelLevelAtEnd }}>
        {(field) => (
          <FormField
            label={t('returnStep.fuelLevelLabel')}
            errorMessage={getDirtyErrorMessage(field.state.meta.isDirty, field.state.meta.errors[0]?.message)}
          >
            <SliderField
              value={field.state.value}
              onChangeValue={field.handleChange}
              step={5}
              valueLabel={(value) => `${Math.round(value)}%`}
            />
          </FormField>
        )}
      </form.Field>

      <form.Field name="endConditionNotes">
        {(field) => (
          <FormField label={t('returnStep.conditionNotesLabel')}>
            <TextField
              value={field.state.value}
              onChangeText={field.handleChange}
              placeholder={t('returnStep.conditionNotesPlaceholder')}
              multiline
            />
          </FormField>
        )}
      </form.Field>

      <View style={styles.photosSection}>
        <Text style={styles.photosTitle}>{t('returnStep.photosTitle')}</Text>

        {photos.length > 0 ? (
          <View style={styles.photosGrid}>
            {photos.map((photo) => (
              <View key={photo.id} style={styles.photoItem}>
                <Image source={{ uri: photo.uri }} style={styles.photoThumbnail} />
                <Button label={t('returnStep.removePhoto')} variant="text" onPress={() => removePhoto(photo.id)} />
              </View>
            ))}
          </View>
        ) : null}

        {photoRequiredError ? <Text style={styles.errorText}>{t('returnStep.photoRequiredError')}</Text> : null}

        {isCameraOpen ? (
          <View style={styles.cameraContainer}>
            <CameraView ref={cameraRef} style={styles.camera} facing="back" />
            <View style={styles.cameraControls}>
              <Button label={t('returnStep.closeCamera')} variant="outlined" onPress={closeCamera} />
              <Button
                label={isCapturing ? t('returnStep.capturingPhoto') : t('returnStep.takePhoto')}
                onPress={capturePhoto}
                disabled={isCapturing}
              />
            </View>
          </View>
        ) : (
          <Button label={t('returnStep.openCamera')} onPress={openCamera} />
        )}
      </View>

      <WizardStepFooter
        onCancel={onCancel}
        onNext={() => form.handleSubmit()}
        nextLabel={t('returnStep.confirmCheckout')}
        testIDPrefix="return-step"
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    fontFamily: Fonts.display,
    fontSize: FontSize.heading,
    color: Colors.light.text,
  },
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
