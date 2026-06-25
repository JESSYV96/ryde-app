import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';

import type { FleetRepositoryInterface } from '@/features/fleet/repository/FleetRepository';
import { fleetQueryKeys } from '@/features/fleet/repository/FleetRepository';
import { fleetRepository } from '@/features/fleet/repository/SeedFleetRepository';
import type { RentalRepositoryInterface } from '@/features/rental/repository/RentalRepository.interface';
import { rentalQueryKeys } from '@/features/rental/repository/RentalRepository.interface';
import { rentalRepository } from '@/features/rental/repository/SqliteRentalRepository';
import { generateQuotePdf } from '@/features/rental/services/pdf/quotePdfService';
import { deletePhotos } from '@/features/rental/services/photoStorageService';
import { useRentalDraftStore } from '@/store/rentalDraftStore';

interface UseRecapStepViewModelDeps {
  rentalRepository?: RentalRepositoryInterface;
  fleetRepository?: FleetRepositoryInterface;
}

export const useRecapStepViewModel = ({
  rentalRepository: repository = rentalRepository,
  fleetRepository: fleetRepo = fleetRepository,
}: UseRecapStepViewModelDeps = {}) => {
  const draft = useRentalDraftStore((state) => state.draft);
  const queryClient = useQueryClient();

  const {
    data: vehicle,
    isLoading: isLoadingVehicle,
    error: vehicleError,
  } = useQuery({
    queryKey: fleetQueryKeys.detail(draft.vehicleId ?? ''),
    queryFn: () => fleetRepo.getById(draft.vehicleId as string),
    enabled: Boolean(draft.vehicleId),
  });

  const createRentalMutation = useMutation({
    mutationFn: async () => {
      if (!vehicle || !draft.startDate || !draft.endDate) {
        return null;
      }
      const { mileageAtStart, fuelLevelAtStart } = draft.inspection;
      if (mileageAtStart === null || fuelLevelAtStart === null) {
        return null;
      }

      const rental = await repository.create({
        customer: {
          firstName: draft.customer.firstName ?? '',
          lastName: draft.customer.lastName ?? '',
          email: draft.customer.email ?? '',
          phoneNumber: draft.customer.phoneNumber ?? '',
          licensePhotoFrontUri: draft.customer.licensePhotoFrontUri ?? '',
          licensePhotoBackUri: draft.customer.licensePhotoBackUri ?? '',
        },
        vehicleId: vehicle.id,
        vehicleSnapshot: {
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          licensePlate: vehicle.licensePlate,
          color: vehicle.color,
        },
        startDate: draft.startDate,
        endDate: draft.endDate,
        mileageAtStart,
        fuelLevelAtStart,
        conditionNotes: draft.inspection.conditionNotes,
        photos: draft.photos.map((photo) => ({ uri: photo.uri, phase: photo.phase, takenAt: photo.takenAt })),
      });

      const pdfUri = await generateQuotePdf(rental);
      return repository.update(rental.id, { quotePdfUri: pdfUri });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rentalQueryKeys.all() });
    },
  });

  const form = useForm({
    onSubmit: async () => {
      const created = await createRentalMutation.mutateAsync();
      if (!created) {
        return;
      }
      useRentalDraftStore.getState().reset();
      router.dismissTo('/');
      router.push({ pathname: '/rentals/[id]/accept-quote', params: { id: created.id } });
    },
  });

  const onBack = () => {
    router.back();
  };

  const onCancel = async () => {
    await deletePhotos(draft.photos.map((photo) => photo.uri));
    useRentalDraftStore.getState().reset();
    router.dismissTo('/');
  };

  return { draft, vehicle, isLoadingVehicle, vehicleError, form, onBack, onCancel };
};

export interface UseRecapStepViewModelResult extends ReturnType<typeof useRecapStepViewModel> {}
