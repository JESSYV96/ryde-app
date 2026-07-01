import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { createReturnSchema, type ReturnInput } from '@/features/rental/model/rental.schema';
import { PaymentKind, PaymentStatus, PhotoPhase } from '@/features/rental/model/rental.types';
import type { RentalRepositoryInterface } from '@/features/rental/repository/RentalRepository.interface';
import { rentalQueryKeys } from '@/features/rental/repository/RentalRepository.interface';
import { rentalRepository } from '@/features/rental/repository/SqliteRentalRepository';
import { buildPaidPushContent } from '@/features/rental/services/payment/paidPushContent';
import { createAndSendPaymentLink } from '@/features/rental/services/payment/paymentLinkService';
import { generateReturnReportPdf } from '@/features/rental/services/pdf/quotePdfService';
import { copyToPermanentStorage, deletePhotos } from '@/features/rental/services/photoStorageService';
import { companySettingsRepository } from '@/features/settings/repository/SqliteCompanySettingsRepository';
import { computeExtraKmCharge } from '@/shared/utils/pricing';
import { useRentalReturnDraftStore } from '@/store/rentalReturnDraftStore';

interface UseReturnStepViewModelDeps {
  repository?: RentalRepositoryInterface;
}

export const useReturnStepViewModel = (
  rentalId: string,
  { repository = rentalRepository }: UseReturnStepViewModelDeps = {}
) => {
  const draft = useRentalReturnDraftStore((state) => state.draft);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [photoRequiredError, setPhotoRequiredError] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const { t } = useTranslation('rental');
  const returnSchema = useMemo(() => createReturnSchema(t), [t]);
  const queryClient = useQueryClient();

  const { data: rental, isLoading } = useQuery({
    queryKey: rentalQueryKeys.detail(rentalId),
    queryFn: () => repository.getById(rentalId),
  });

  const mileageAtEndValidator = ({ value }: { value: number }) => {
    const basicCheck = returnSchema.shape.mileageAtEnd.safeParse(value);
    if (!basicCheck.success) {
      return basicCheck.error.issues[0]?.message;
    }
    if (rental && value < rental.mileageAtStart) {
      return t('validation.mileageAtEndBelowStart');
    }
    return undefined;
  };

  const recordReturnMutation = useMutation({
    mutationFn: async (value: ReturnInput) => {
      const updated = await repository.recordReturn(rentalId, {
        mileageAtEnd: value.mileageAtEnd,
        fuelLevelAtEnd: value.fuelLevelAtEnd,
        endConditionNotes: value.endConditionNotes,
        photos: draft.photos.map((photo) => ({ uri: photo.uri, phase: photo.phase, takenAt: photo.takenAt })),
      });

      try {
        const includedKm = (updated.vehicleSnapshot.includedKmPerDay / 2) * updated.billableHalfDays;
        const actualKm = updated.mileageAtEnd! - updated.mileageAtStart;
        const extraCharge = computeExtraKmCharge(actualKm, includedKm, updated.vehicleSnapshot.extraKmRate);
        if (extraCharge > 0) {
          const { currency } = await companySettingsRepository.getSettings();
          const { stripeSessionId, paymentUrl, emailSent } = await createAndSendPaymentLink({
            rentalId,
            kind: PaymentKind.ExtraMileage,
            amount: extraCharge,
            currency,
            customerEmail: updated.customer.email,
            customerName: `${updated.customer.firstName} ${updated.customer.lastName}`,
            vehicleLabel: `${updated.vehicleSnapshot.make} ${updated.vehicleSnapshot.model}`,
            ...buildPaidPushContent(t, {
              customerName: `${updated.customer.firstName} ${updated.customer.lastName}`,
              amount: extraCharge,
              currency,
            }),
          });
          await repository.addPayment(rentalId, {
            kind: PaymentKind.ExtraMileage,
            amount: extraCharge,
            currency,
            status: PaymentStatus.Pending,
            stripeSessionId,
            paymentUrl,
            emailSent,
          });
        }
      } catch (error) {
        console.warn('Failed to send the extra-mileage payment link', error);
      }

      const returnReportPdfUri = await generateReturnReportPdf(updated);
      return repository.update(rentalId, { returnReportPdfUri });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rentalQueryKeys.detail(rentalId) });
      queryClient.invalidateQueries({ queryKey: rentalQueryKeys.all() });
    },
  });

  const form = useForm({
    defaultValues: {
      mileageAtEnd: draft.mileageAtEnd ?? 0,
      fuelLevelAtEnd: draft.fuelLevelAtEnd ?? 50,
      endConditionNotes: draft.endConditionNotes,
    } as ReturnInput,
    onSubmit: async ({ value }) => {
      if (draft.photos.length === 0) {
        setPhotoRequiredError(true);
        return;
      }
      setPhotoRequiredError(false);
      await recordReturnMutation.mutateAsync(value);
      useRentalReturnDraftStore.getState().reset();
      router.dismissTo({ pathname: '/rentals/[id]', params: { id: rentalId } });
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
        rentalDraftId: rentalId,
        phase: PhotoPhase.After,
      });
      useRentalReturnDraftStore.getState().addPhoto({ ...stored, phase: PhotoPhase.After });
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
    useRentalReturnDraftStore.getState().removePhoto(photoId);
  };

  const onCancel = async () => {
    const photoUris = draft.photos.map((photo) => photo.uri);
    await deletePhotos(photoUris);
    useRentalReturnDraftStore.getState().reset();
    router.back();
  };

  return {
    form,
    returnSchema,
    mileageAtEndValidator,
    isLoading,
    photos: draft.photos,
    isCameraOpen,
    isCapturing,
    photoRequiredError,
    cameraRef,
    openCamera,
    closeCamera,
    capturePhoto,
    removePhoto,
    onCancel,
  };
};

export interface UseReturnStepViewModelResult extends ReturnType<typeof useReturnStepViewModel> { }
