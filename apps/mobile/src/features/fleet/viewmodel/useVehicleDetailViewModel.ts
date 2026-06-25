import { useQuery } from '@tanstack/react-query';

import type { FleetRepositoryInterface } from '@/features/fleet/repository/FleetRepository';
import { fleetQueryKeys } from '@/features/fleet/repository/FleetRepository';
import { fleetRepository } from '@/features/fleet/repository/SeedFleetRepository';

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

  return { vehicle, isLoading };
};

export interface UseVehicleDetailViewModelResult extends ReturnType<typeof useVehicleDetailViewModel> {}
