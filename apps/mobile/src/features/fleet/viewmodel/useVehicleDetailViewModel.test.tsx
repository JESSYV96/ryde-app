import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import type { FleetRepositoryInterface } from '@/features/fleet/repository/FleetRepository';
import type { Vehicle } from '@/features/fleet/model/vehicle.types';
import type { RentalRepositoryInterface } from '@/features/rental/repository/RentalRepository.interface';

import { useVehicleDetailViewModel } from './useVehicleDetailViewModel';

const vehicle: Vehicle = {
  id: 'vehicle-1',
  type: 'car',
  make: 'Toyota',
  model: 'Corolla',
  year: 2022,
  licensePlate: 'ABC-123',
  dailyRate: 55,
  includedKmPerDay: 200,
  extraKmRate: 0.3,
  color: 'Argent',
  currentMileage: 42000,
  photos: [],
};

const createFakeRepository = (vehicles: Vehicle[]): FleetRepositoryInterface => ({
  getAll: async () => vehicles,
  getById: async (id) => vehicles.find((candidate) => candidate.id === id) ?? null,
  create: async () => {
    throw new Error('not implemented');
  },
  update: async () => {
    throw new Error('not implemented');
  },
  delete: async () => {
    throw new Error('not implemented');
  },
});

const fakeRentalRepository = {
  getAll: async () => [],
} as unknown as RentalRepositoryInterface;

const renderWithQueryClient = async (vehicleId: string, repository: FleetRepositoryInterface) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(
    () => useVehicleDetailViewModel(vehicleId, { repository, rentalRepository: fakeRentalRepository }),
    { wrapper }
  );
};

describe('useVehicleDetailViewModel', () => {
  it('returns the vehicle matching the given id', async () => {
    // arrange
    const repository = createFakeRepository([vehicle]);

    // act
    const { result } = await renderWithQueryClient(vehicle.id, repository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // assert
    expect(result.current.vehicle).toEqual(vehicle);
  });

  it('returns null when no vehicle matches the given id', async () => {
    // arrange
    const repository = createFakeRepository([vehicle]);

    // act
    const { result } = await renderWithQueryClient('unknown-id', repository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // assert
    expect(result.current.vehicle).toBeNull();
  });
});
