import type { Vehicle, VehicleInput } from '@/features/fleet/model/vehicle.types';

export interface FleetRepositoryInterface {
  getAll(): Promise<Vehicle[]>;
  getById(id: string): Promise<Vehicle | null>;
  create(input: VehicleInput): Promise<Vehicle>;
  update(id: string, input: VehicleInput): Promise<Vehicle>;
  delete(id: string): Promise<void>;
}

export const fleetQueryKeys = {
  all: () => ['vehicles'] as const,
  detail: (id: string) => ['vehicles', id] as const,
};
