import { CameraView } from 'expo-camera';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { WizardProgressHeader } from '@/features/rental/view/WizardProgressHeader';
import { WizardStepFooter } from '@/features/rental/view/WizardStepFooter';
import { useCustomerStepViewModel } from '@/features/rental/viewmodel/useCustomerStepViewModel';
import { Screen } from '@/shared/ui/components/Screen';
import { Button } from '@/shared/ui/design-system/atoms/Button';
import { TextField } from '@/shared/ui/design-system/atoms/TextField';
import { FormField } from '@/shared/ui/design-system/molecules/FormField';
import { Colors, FontSize, Fonts, Radius, Spacing } from '@/shared/ui/theme';
import { getDirtyErrorMessage } from '@/shared/utils/form';

export const CustomerStepView = () => {
  const {
    form,
    customerSchema,
    isLicenseCameraOpen,
    licenseCaptureSide,
    isCapturingLicensePhoto,
    licenseCameraRef,
    startLicensePhotoCapture,
    closeLicensePhotoCapture,
    captureLicensePhoto,
    onCancel,
  } = useCustomerStepViewModel();
  const { t } = useTranslation('rental');

  return (
    <Screen>
      <WizardProgressHeader currentStep={1} totalSteps={4} title={t('customerStep.title')} />

      <form.Field name="firstName" validators={{ onChange: customerSchema.shape.firstName }}>
        {(field) => (
          <FormField
            label={t('customerStep.firstNameLabel')}
            errorMessage={getDirtyErrorMessage(field.state.meta.isDirty, field.state.meta.errors[0]?.message)}
          >
            <TextField
              value={field.state.value}
              onChangeText={field.handleChange}
              placeholder={t('customerStep.firstNamePlaceholder')}
              hasError={field.state.meta.isDirty && !!field.state.meta.errors[0]}
              testID="customer-step.first-name-field"
            />
          </FormField>
        )}
      </form.Field>

      <form.Field name="lastName" validators={{ onChange: customerSchema.shape.lastName }}>
        {(field) => (
          <FormField
            label={t('customerStep.lastNameLabel')}
            errorMessage={getDirtyErrorMessage(field.state.meta.isDirty, field.state.meta.errors[0]?.message)}
          >
            <TextField
              value={field.state.value}
              onChangeText={field.handleChange}
              placeholder={t('customerStep.lastNamePlaceholder')}
              hasError={field.state.meta.isDirty && !!field.state.meta.errors[0]}
              testID="customer-step.last-name-field"
            />
          </FormField>
        )}
      </form.Field>

      <form.Field name="licensePhotoFrontUri" validators={{ onChange: customerSchema.shape.licensePhotoFrontUri }}>
        {(frontField) => (
          <form.Field name="licensePhotoBackUri" validators={{ onChange: customerSchema.shape.licensePhotoBackUri }}>
            {(backField) => {
              const handleCaptureLicensePhoto = async () => {
                const result = await captureLicensePhoto(frontField.state.value, backField.state.value);
                if (!result) {
                  return;
                }
                if (result.side === 'front') {
                  frontField.handleChange(result.uri);
                } else {
                  backField.handleChange(result.uri);
                }
              };

              return (
                <FormField
                  label={t('customerStep.licensePhotosLabel')}
                  errorMessage={
                    getDirtyErrorMessage(frontField.state.meta.isDirty, frontField.state.meta.errors[0]?.message) ??
                    getDirtyErrorMessage(backField.state.meta.isDirty, backField.state.meta.errors[0]?.message)
                  }
                >
                  {isLicenseCameraOpen ? (
                    <View style={styles.cameraContainer}>
                      <CameraView ref={licenseCameraRef} style={styles.camera} facing="back" />
                      <View style={styles.cameraInstruction}>
                        <Text style={styles.cameraInstructionText}>
                          {licenseCaptureSide === 'back'
                            ? t('customerStep.captureBackInstruction')
                            : t('customerStep.captureFrontInstruction')}
                        </Text>
                      </View>
                      <View style={styles.cameraControls}>
                        <Button
                          label={t('customerStep.closeCamera')}
                          variant="outlined"
                          onPress={closeLicensePhotoCapture}
                          testID="customer-step.close-camera-button"
                        />
                        <Button
                          label={isCapturingLicensePhoto ? t('customerStep.capturingPhoto') : t('customerStep.takePhoto')}
                          onPress={handleCaptureLicensePhoto}
                          disabled={isCapturingLicensePhoto}
                          testID="customer-step.capture-photo-button"
                        />
                      </View>
                    </View>
                  ) : frontField.state.value && backField.state.value ? (
                    <View style={styles.licensePhotosSection}>
                      <View style={styles.licensePhotosGrid}>
                        <View style={styles.licensePhotoItem}>
                          <Text style={styles.licensePhotoLabel}>{t('customerStep.frontLabel')}</Text>
                          <Image source={{ uri: frontField.state.value }} style={styles.photoThumbnail} />
                        </View>
                        <View style={styles.licensePhotoItem}>
                          <Text style={styles.licensePhotoLabel}>{t('customerStep.backLabel')}</Text>
                          <Image source={{ uri: backField.state.value }} style={styles.photoThumbnail} />
                        </View>
                      </View>
                      <Button
                        label={t('customerStep.retakeLicensePhotos')}
                        variant="text"
                        onPress={startLicensePhotoCapture}
                        testID="customer-step.retake-license-photos-button"
                      />
                    </View>
                  ) : (
                    <Button
                      label={t('customerStep.takeLicensePhotos')}
                      onPress={startLicensePhotoCapture}
                      testID="customer-step.take-license-photos-button"
                    />
                  )}
                </FormField>
              );
            }}
          </form.Field>
        )}
      </form.Field>

      <form.Field name="email" validators={{ onChange: customerSchema.shape.email }}>
        {(field) => (
          <FormField
            label={t('customerStep.emailLabel')}
            errorMessage={getDirtyErrorMessage(field.state.meta.isDirty, field.state.meta.errors[0]?.message)}
          >
            <TextField
              value={field.state.value}
              onChangeText={field.handleChange}
              placeholder={t('customerStep.emailPlaceholder')}
              hasError={field.state.meta.isDirty && !!field.state.meta.errors[0]}
              testID="customer-step.email-field"
            />
          </FormField>
        )}
      </form.Field>

      <form.Field name="phoneNumber" validators={{ onChange: customerSchema.shape.phoneNumber }}>
        {(field) => (
          <FormField
            label={t('customerStep.phoneLabel')}
            errorMessage={getDirtyErrorMessage(field.state.meta.isDirty, field.state.meta.errors[0]?.message)}
          >
            <TextField
              value={field.state.value}
              onChangeText={field.handleChange}
              placeholder={t('customerStep.phonePlaceholder')}
              hasError={field.state.meta.isDirty && !!field.state.meta.errors[0]}
              testID="customer-step.phone-field"
            />
          </FormField>
        )}
      </form.Field>

      <WizardStepFooter onNext={() => form.handleSubmit()} onCancel={onCancel} testIDPrefix="customer-step" />
    </Screen>
  );
};

const styles = StyleSheet.create({
  cameraContainer: {
    height: 360,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  camera: {
    flex: 1,
  },
  cameraInstruction: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: Spacing.two,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  cameraInstructionText: {
    color: '#ffffff',
    fontFamily: Fonts.uiBold,
    fontSize: FontSize.body,
    textAlign: 'center',
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
  licensePhotosSection: {
    gap: Spacing.two,
  },
  licensePhotosGrid: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  licensePhotoItem: {
    alignItems: 'center',
    gap: Spacing.half,
  },
  licensePhotoLabel: {
    fontFamily: Fonts.uiBold,
    fontSize: FontSize.meta,
    color: Colors.light.textSecondary,
  },
  photoThumbnail: {
    width: 80,
    height: 80,
    borderRadius: Radius.sm,
  },
});
