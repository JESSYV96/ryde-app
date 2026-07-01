import type { Vehicle, VehicleInput, VehiclePhoto } from '@/features/fleet/model/vehicle.types';
import type { FleetRepositoryInterface } from '@/features/fleet/repository/FleetRepository';
import { generateId } from '@/shared/utils/id';

const toPhotos = (vehicleId: string, input: VehicleInput): VehiclePhoto[] =>
  input.photos.map((photo) => ({
    id: generateId(),
    vehicleId,
    uri: photo.uri,
    takenAt: photo.takenAt,
    isPrimary: photo.isPrimary,
  }));

const SEED_VEHICLES: Omit<Vehicle, 'photos'>[] = [
  {
    id: 'veh-1',
    type: 'car',
    make: 'Toyota',
    model: 'Corolla',
    year: 2022,
    licensePlate: 'ABC-123',
    color: 'Argent',
    dailyRate: 55,
    includedKmPerDay: 200,
    extraKmRate: 0.3,
    currentMileage: 42000,
  },
  {
    id: 'veh-2',
    type: 'car',
    make: 'Honda',
    model: 'CR-V',
    year: 2023,
    licensePlate: 'XYZ-789',
    color: 'Noir',
    dailyRate: 75,
    includedKmPerDay: 200,
    extraKmRate: 0.35,
    currentMileage: 18500,
  },
  {
    id: 'veh-3',
    type: 'motorcycle',
    make: 'Yamaha',
    model: 'MT-07',
    year: 2021,
    licensePlate: 'JKL-456',
    color: 'Bleu',
    dailyRate: 45,
    includedKmPerDay: 150,
    extraKmRate: 0.25,
    currentMileage: 12400,
  },
  {
    id: 'veh-4',
    type: 'truck',
    make: 'Ford',
    model: 'Transit',
    year: 2023,
    licensePlate: 'DEF-321',
    color: 'Blanc',
    dailyRate: 95,
    includedKmPerDay: 150,
    extraKmRate: 0.4,
    currentMileage: 30200,
  },
  {
    id: 'veh-5',
    type: 'car',
    make: 'Nissan',
    model: 'Rogue',
    year: 2022,
    licensePlate: 'GHI-654',
    color: 'Gris',
    dailyRate: 78,
    includedKmPerDay: 200,
    extraKmRate: 0.35,
    currentMileage: 33700,
  },
  {
    id: 'veh-6',
    type: 'car',
    make: 'Kia',
    model: 'Forte',
    year: 2020,
    licensePlate: 'MNO-987',
    color: 'Rouge',
    dailyRate: 48,
    includedKmPerDay: 200,
    extraKmRate: 0.3,
    currentMileage: 61000,
  },
];

// In-memory implementation kept as a test double for the fleet viewmodels.
// Production code uses SqliteFleetRepository.
export class SeedFleetRepository implements FleetRepositoryInterface {
  private vehicles: Vehicle[] = SEED_VEHICLES.map((vehicle) => ({ ...vehicle, photos: [] }));

  getAll(): Promise<Vehicle[]> {
    return Promise.resolve([...this.vehicles]);
  }

  getById(id: string): Promise<Vehicle | null> {
    return Promise.resolve(this.vehicles.find((vehicle) => vehicle.id === id) ?? null);
  }

  create(input: VehicleInput): Promise<Vehicle> {
    const id = generateId();
    const created: Vehicle = { ...input, id, photos: toPhotos(id, input) };
    this.vehicles = [...this.vehicles, created];
    return Promise.resolve(created);
  }

  update(id: string, input: VehicleInput): Promise<Vehicle> {
    const updated: Vehicle = { ...input, id, photos: toPhotos(id, input) };
    this.vehicles = this.vehicles.map((vehicle) => (vehicle.id === id ? updated : vehicle));
    return Promise.resolve(updated);
  }

  delete(id: string): Promise<void> {
    this.vehicles = this.vehicles.filter((vehicle) => vehicle.id !== id);
    return Promise.resolve();
  }
}
