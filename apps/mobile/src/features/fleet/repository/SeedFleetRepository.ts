import type { Vehicle } from '@/features/fleet/model/vehicle.types';
import type { FleetRepositoryInterface } from '@/features/fleet/repository/FleetRepository';

const SEED_VEHICLES: Vehicle[] = [
  { id: 'veh-1', make: 'Toyota', model: 'Corolla', year: 2022, licensePlate: 'ABC-123', color: 'Argent' },
  { id: 'veh-2', make: 'Honda', model: 'CR-V', year: 2023, licensePlate: 'XYZ-789', color: 'Noir' },
  { id: 'veh-3', make: 'Hyundai', model: 'Elantra', year: 2021, licensePlate: 'JKL-456', color: 'Blanc' },
  { id: 'veh-4', make: 'Ford', model: 'Escape', year: 2023, licensePlate: 'DEF-321', color: 'Bleu' },
  { id: 'veh-5', make: 'Nissan', model: 'Rogue', year: 2022, licensePlate: 'GHI-654', color: 'Gris' },
  { id: 'veh-6', make: 'Kia', model: 'Forte', year: 2020, licensePlate: 'MNO-987', color: 'Rouge' },
];

export class SeedFleetRepository implements FleetRepositoryInterface {
  getAll(): Promise<Vehicle[]> {
    return Promise.resolve(SEED_VEHICLES);
  }

  getById(id: string): Promise<Vehicle | null> {
    return Promise.resolve(SEED_VEHICLES.find((vehicle) => vehicle.id === id) ?? null);
  }
}

export const fleetRepository: FleetRepositoryInterface = new SeedFleetRepository();
