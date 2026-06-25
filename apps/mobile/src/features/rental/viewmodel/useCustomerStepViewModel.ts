import { useForm } from '@tanstack/react-form';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createRentalCustomerSchema } from '@/features/rental/model/rental.schema';
import type { DriverLicenseSide, RentalCustomer } from '@/features/rental/model/rental.types';
import { copyLicensePhotoToPermanentStorage, deletePhotos } from '@/features/rental/services/photoStorageService';
import { useRentalDraftStore } from '@/store/rentalDraftStore';

export const useCustomerStepViewModel = () => {
  const draftCustomer = useRentalDraftStore((state) => state.draft.customer);
  const { t } = useTranslation('rental');
  const customerSchema = useMemo(() => createRentalCustomerSchema(t), [t]);
  const [permission, requestPermission] = useCameraPermissions();
  const [isLicenseCameraOpen, setIsLicenseCameraOpen] = useState(false);
  const [licenseCaptureSide, setLicenseCaptureSide] = useState<DriverLicenseSide | null>(null);
  const [isCapturingLicensePhoto, setIsCapturingLicensePhoto] = useState(false);
  const licenseCameraRef = useRef<CameraView>(null);

  const form = useForm({
    defaultValues: {
      firstName: draftCustomer.firstName ?? '',
      lastName: draftCustomer.lastName ?? '',
      email: draftCustomer.email ?? '',
      phoneNumber: draftCustomer.phoneNumber ?? '',
      licensePhotoFrontUri: draftCustomer.licensePhotoFrontUri ?? '',
      licensePhotoBackUri: draftCustomer.licensePhotoBackUri ?? '',
    } as RentalCustomer,
    onSubmit: async ({ value }) => {
      useRentalDraftStore.getState().setCustomer(value);
      router.push('/rentals/new/vehicle');
    },
  });

  const startLicensePhotoCapture = async () => {
    if (!permission?.granted) {
      const response = await requestPermission();
      if (!response.granted) {
        return;
      }
    }
    setLicenseCaptureSide('front');
    setIsLicenseCameraOpen(true);
  };

  const closeLicensePhotoCapture = () => {
    setIsLicenseCameraOpen(false);
    setLicenseCaptureSide(null);
  };

  const captureLicensePhoto = async (
    currentFrontUri: string,
    currentBackUri: string
  ): Promise<{ side: DriverLicenseSide; uri: string } | null> => {
    if (!licenseCameraRef.current || !licenseCaptureSide) {
      return null;
    }
    const side = licenseCaptureSide;
    setIsCapturingLicensePhoto(true);
    try {
      const picture = await licenseCameraRef.current.takePictureAsync();
      const uri = await copyLicensePhotoToPermanentStorage({ tempUri: picture.uri, rentalDraftId: 'draft', side });

      const previousUri = side === 'front' ? currentFrontUri : currentBackUri;
      if (previousUri) {
        await deletePhotos([previousUri]);
      }

      if (side === 'front') {
        setLicenseCaptureSide('back');
      } else {
        closeLicensePhotoCapture();
      }

      return { side, uri };
    } finally {
      setIsCapturingLicensePhoto(false);
    }
  };

  const onCancel = async () => {
    const photoUris = useRentalDraftStore.getState().draft.photos.map((photo) => photo.uri);
    const licensePhotoUris = [form.state.values.licensePhotoFrontUri, form.state.values.licensePhotoBackUri].filter(
      (uri) => uri.length > 0
    );
    await deletePhotos([...photoUris, ...licensePhotoUris]);
    useRentalDraftStore.getState().reset();
    router.dismissTo('/');
  };

  return {
    form,
    customerSchema,
    permission,
    isLicenseCameraOpen,
    licenseCaptureSide,
    isCapturingLicensePhoto,
    licenseCameraRef,
    startLicensePhotoCapture,
    closeLicensePhotoCapture,
    captureLicensePhoto,
    onCancel,
  };
};
