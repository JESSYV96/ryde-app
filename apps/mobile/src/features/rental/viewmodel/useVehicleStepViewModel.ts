import { useForm } from '@tanstack/react-form';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import type { FleetRepositoryInterface } from '@/features/fleet/repository/FleetRepository';
import { fleetQueryKeys } from '@/features/fleet/repository/FleetRepository';
import { fleetRepository } from '@/features/fleet/repository/SqliteFleetRepository';
import { createVehicleSelectionSchema, type VehicleSelectionInput } from '@/features/rental/model/rental.schema';
import { deletePhotos } from '@/features/rental/services/photoStorageService';
import { useRentalDraftStore } from '@/store/rentalDraftStore';

interface UseVehicleStepViewModelDeps {
  repository?: FleetRepositoryInterface;
}

export const useVehicleStepViewModel = ({ repository = fleetRepository }: UseVehicleStepViewModelDeps = {}) => {
  const draft = useRentalDraftStore((state) => state.draft);
  const { t } = useTranslation('rental');
  const vehicleSelectionSchema = useMemo(() => createVehicleSelectionSchema(t), [t]);

  const {
    data: vehiclesData,
    isLoading: isLoadingVehicles,
    error: vehiclesError,
  } = useQuery({
    queryKey: fleetQueryKeys.all(),
    queryFn: () => repository.getAll(),
  });
  const vehicles = vehiclesData ?? [];

  const form = useForm({
    defaultValues: {
      vehicleId: draft.vehicleId ?? '',
      startDate: draft.startDate ?? '',
      endDate: draft.endDate ?? '',
    } as VehicleSelectionInput,
    validators: { onChange: vehicleSelectionSchema },
    onSubmit: async ({ value }) => {
      useRentalDraftStore.getState().setVehicleAndDates(value);
      router.push('/rentals/new/inspection');
    },
  });

  const onBack = () => {
    router.back();
  };

  const onCancel = async () => {
    const photoUris = useRentalDraftStore.getState().draft.photos.map((photo) => photo.uri);
    await deletePhotos(photoUris);
    useRentalDraftStore.getState().reset();
    router.dismissTo('/');
  };

  return { form, vehicles, isLoadingVehicles, vehiclesError, onBack, onCancel };
};

export interface UseVehicleStepViewModelResult extends ReturnType<typeof useVehicleStepViewModel> {}
