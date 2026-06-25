import { useForm } from '@tanstack/react-form';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createInspectionSchema, type InspectionInput } from '@/features/rental/model/rental.schema';
import { PhotoPhase } from '@/features/rental/model/rental.types';
import { copyToPermanentStorage, deletePhotos } from '@/features/rental/services/photoStorageService';
import { useRentalDraftStore } from '@/store/rentalDraftStore';

export const useInspectionStepViewModel = () => {
  const draft = useRentalDraftStore((state) => state.draft);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [photoRequiredError, setPhotoRequiredError] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const { t } = useTranslation('rental');
  const inspectionSchema = useMemo(() => createInspectionSchema(t), [t]);

  const form = useForm({
    defaultValues: {
      mileageAtStart: draft.inspection.mileageAtStart ?? 0,
      fuelLevelAtStart: draft.inspection.fuelLevelAtStart ?? 50,
      conditionNotes: draft.inspection.conditionNotes,
    } as InspectionInput,
    onSubmit: async ({ value }) => {
      if (useRentalDraftStore.getState().draft.photos.length === 0) {
        setPhotoRequiredError(true);
        return;
      }
      setPhotoRequiredError(false);
      useRentalDraftStore.getState().setInspection(value);
      router.push('/rentals/new/recap');
    },
  });

  const openCamera = async () => {
    if (!permission?.granted) {
      const response = await requestPermission();
      if (!response.granted) {
        return;
      }
    }
    setIsCameraOpen(true);
  };

  const closeCamera = () => {
    setIsCameraOpen(false);
  };

  const capturePhoto = async () => {
    if (!cameraRef.current) {
      return;
    }
    setIsCapturing(true);
    try {
      const picture = await cameraRef.current.takePictureAsync();
      const stored = await copyToPermanentStorage({
        tempUri: picture.uri,
        rentalDraftId: 'draft',
        phase: PhotoPhase.Before,
      });
      useRentalDraftStore.getState().addPhoto({ ...stored, phase: PhotoPhase.Before });
      setPhotoRequiredError(false);
    } finally {
      setIsCapturing(false);
    }
  };

  const removePhoto = async (photoId: string) => {
    const photo = draft.photos.find((candidate) => candidate.id === photoId);
    if (photo) {
      await deletePhotos([photo.uri]);
    }
    useRentalDraftStore.getState().removePhoto(photoId);
  };

  const onBack = () => {
    router.back();
  };

  const onCancel = async () => {
    const photoUris = useRentalDraftStore.getState().draft.photos.map((photo) => photo.uri);
    await deletePhotos(photoUris);
    useRentalDraftStore.getState().reset();
    router.dismissTo('/');
  };

  return {
    form,
    inspectionSchema,
    photos: draft.photos,
    permission,
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
  };
};
