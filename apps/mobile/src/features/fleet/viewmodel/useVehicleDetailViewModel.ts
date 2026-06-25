import { useQuery } from '@tanstack/react-query';

import type { FleetRepositoryInterface } from '@/features/fleet/repository/FleetRepository';
import { fleetQueryKeys } from '@/features/fleet/repository/FleetRepository';
import { fleetRepository } from '@/features/fleet/repository/SeedFleetRepository';
import { companySettingsQueryKeys } from '@/features/settings/repository/CompanySettingsRepository.interface';
import { companySettingsRepository } from '@/features/settings/repository/SqliteCompanySettingsRepository';

interface UseVehicleDetailViewModelDeps {
  repository?: FleetRepositoryInterface;
}

export const useVehicleDetailViewModel = (
  vehicleId: string,
  { repository = fleetRepository }: UseVehicleDetailViewModelDeps = {}
) => {
  const { data: vehicle, isLoading } = useQuery({
    queryKey: fleetQueryKeys.detail(vehicleId),
    queryFn: () => repository.getById(vehicleId),
  });

  const { data: companySettings } = useQuery({
    queryKey: companySettingsQueryKeys.detail(),
    queryFn: () => companySettingsRepository.getSettings(),
  });

  return { vehicle, isLoading, currency: companySettings?.currency ?? 'CAD' };
};

export interface UseVehicleDetailViewModelResult extends ReturnType<typeof useVehicleDetailViewModel> {}
