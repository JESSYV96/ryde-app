import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';

import type { FleetRepositoryInterface } from '@/features/fleet/repository/FleetRepository';
import { fleetQueryKeys } from '@/features/fleet/repository/FleetRepository';
import { fleetRepository } from '@/features/fleet/repository/SeedFleetRepository';
import { getRentalStatus, RentalStatus } from '@/features/rental/model/rental.types';
import type { RentalRepositoryInterface } from '@/features/rental/repository/RentalRepository.interface';
import { rentalQueryKeys } from '@/features/rental/repository/RentalRepository.interface';
import { rentalRepository } from '@/features/rental/repository/SqliteRentalRepository';
import { companySettingsQueryKeys } from '@/features/settings/repository/CompanySettingsRepository.interface';
import { companySettingsRepository } from '@/features/settings/repository/SqliteCompanySettingsRepository';

interface UseVehicleListViewModelDeps {
  fleetRepository?: FleetRepositoryInterface;
  rentalRepository?: RentalRepositoryInterface;
}

export const useVehicleListViewModel = ({
  fleetRepository: fleetRepo = fleetRepository,
  rentalRepository: rentalRepo = rentalRepository,
}: UseVehicleListViewModelDeps = {}) => {
  const { data: vehicles, isLoading: isLoadingVehicles } = useQuery({
    queryKey: fleetQueryKeys.all(),
    queryFn: () => fleetRepo.getAll(),
  });

  const { data: rentals, isLoading: isLoadingRentals } = useQuery({
    queryKey: rentalQueryKeys.all(),
    queryFn: () => rentalRepo.getAll(),
  });

  const { data: companySettings } = useQuery({
    queryKey: companySettingsQueryKeys.detail(),
    queryFn: () => companySettingsRepository.getSettings(),
  });

  const vehiclesWithStatus = (vehicles ?? []).map((vehicle) => ({
    vehicle,
    isRented: (rentals ?? []).some(
      (rental) => rental.vehicleId === vehicle.id && getRentalStatus(rental) === RentalStatus.InProgress
    ),
  }));

  const onSelectVehicle = (id: string) => {
    router.push({ pathname: '/vehicles/[id]', params: { id } });
  };

  return {
    vehicles: vehiclesWithStatus,
    isLoading: isLoadingVehicles || isLoadingRentals,
    currency: companySettings?.currency ?? 'CAD',
    onSelectVehicle,
  };
};

export interface UseVehicleListViewModelResult extends ReturnType<typeof useVehicleListViewModel> {}
