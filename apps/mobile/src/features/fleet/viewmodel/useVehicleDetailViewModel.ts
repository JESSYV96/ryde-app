import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import type { FleetRepositoryInterface } from '@/features/fleet/repository/FleetRepository';
import { fleetQueryKeys } from '@/features/fleet/repository/FleetRepository';
import { fleetRepository } from '@/features/fleet/repository/SqliteFleetRepository';
import { deletePhotos as deletePhotosImpl } from '@/features/fleet/services/vehiclePhotoStorageService';
import { getRentalStatus, RentalStatus } from '@/features/rental/model/rental.types';
import type { RentalRepositoryInterface } from '@/features/rental/repository/RentalRepository.interface';
import { rentalQueryKeys } from '@/features/rental/repository/RentalRepository.interface';
import { rentalRepository } from '@/features/rental/repository/SqliteRentalRepository';
import { companySettingsQueryKeys } from '@/features/settings/repository/CompanySettingsRepository.interface';
import { companySettingsRepository } from '@/features/settings/repository/SqliteCompanySettingsRepository';

interface UseVehicleDetailViewModelDeps {
  repository?: FleetRepositoryInterface;
  rentalRepository?: RentalRepositoryInterface;
  deletePhotos?: (uris: string[]) => Promise<void>;
}

export const useVehicleDetailViewModel = (
  vehicleId: string,
  {
    repository = fleetRepository,
    rentalRepository: rentalRepo = rentalRepository,
    deletePhotos = deletePhotosImpl,
  }: UseVehicleDetailViewModelDeps = {}
) => {
  const { t } = useTranslation('fleet');
  const queryClient = useQueryClient();
  const [enlargedPhotoUri, setEnlargedPhotoUri] = useState<string | null>(null);

  const { data: vehicle, isLoading } = useQuery({
    queryKey: fleetQueryKeys.detail(vehicleId),
    queryFn: () => repository.getById(vehicleId),
  });

  const { data: rentals } = useQuery({
    queryKey: rentalQueryKeys.all(),
    queryFn: () => rentalRepo.getAll(),
  });

  const { data: companySettings } = useQuery({
    queryKey: companySettingsQueryKeys.detail(),
    queryFn: () => companySettingsRepository.getSettings(),
  });

  const isRented = (rentals ?? []).some(
    (rental) => rental.vehicleId === vehicleId && getRentalStatus(rental) === RentalStatus.InProgress
  );

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const photoUris = (vehicle?.photos ?? []).map((photo) => photo.uri);
      await repository.delete(vehicleId);
      // Symmetric with the lazy-copy-on-save policy: remove the vehicle's photo
      // files so they don't outlive the vehicle.
      if (photoUris.length > 0) {
        await deletePhotos(photoUris);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fleetQueryKeys.all() });
      router.back();
    },
  });

  const onEdit = () => {
    router.push({ pathname: '/vehicles/[id]/edit', params: { id: vehicleId } });
  };

  const onDelete = () => {
    if (isRented) {
      Alert.alert(t('delete.blockedWhileRentedTitle'), t('delete.blockedWhileRentedMessage'));
      return;
    }
    Alert.alert(t('deleteConfirm.title'), t('deleteConfirm.message'), [
      { text: t('deleteConfirm.cancel'), style: 'cancel' },
      { text: t('deleteConfirm.confirm'), style: 'destructive', onPress: () => deleteMutation.mutate() },
    ]);
  };

  const onOpenPhoto = (uri: string) => setEnlargedPhotoUri(uri);
  const onClosePhoto = () => setEnlargedPhotoUri(null);

  return {
    vehicle,
    isLoading,
    isRented,
    currency: companySettings?.currency ?? 'CAD',
    isDeleting: deleteMutation.isPending,
    enlargedPhotoUri,
    onEdit,
    onDelete,
    onOpenPhoto,
    onClosePhoto,
  };
};

export interface UseVehicleDetailViewModelResult extends ReturnType<typeof useVehicleDetailViewModel> {}
