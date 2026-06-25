import type { Vehicle } from '@/features/fleet/model/vehicle.types';

export interface FleetRepositoryInterface {
  getAll(): Promise<Vehicle[]>;
  getById(id: string): Promise<Vehicle | null>;
}

export const fleetQueryKeys = {
  all: () => ['vehicles'] as const,
  detail: (id: string) => ['vehicles', id] as const,
};
