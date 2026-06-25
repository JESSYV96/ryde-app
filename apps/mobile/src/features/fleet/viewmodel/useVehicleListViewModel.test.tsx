import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import type { FleetRepositoryInterface } from '@/features/fleet/repository/FleetRepository';
import type { Vehicle } from '@/features/fleet/model/vehicle.types';
import type { Rental } from '@/features/rental/model/rental.types';
import type { RentalRepositoryInterface } from '@/features/rental/repository/RentalRepository.interface';

import { useVehicleListViewModel } from './useVehicleListViewModel';

const createVehicle = (overrides: Partial<Vehicle>): Vehicle => ({
  id: 'vehicle-1',
  make: 'Toyota',
  model: 'Corolla',
  year: 2022,
  licensePlate: 'ABC-123',
  color: 'Argent',
  dailyRate: 55,
  includedKmPerDay: 200,
  extraKmRate: 0.3,
  ...overrides,
});

const createRental = (overrides: Partial<Rental>): Rental => ({
  id: 'rental-1',
  customer: {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phoneNumber: '555-0100',
    licensePhotoFrontUri: 'file:///front.jpg',
    licensePhotoBackUri: 'file:///back.jpg',
  },
  vehicleId: 'vehicle-1',
  vehicleSnapshot: {
    make: 'Toyota',
    model: 'Corolla',
    year: 2022,
    licensePlate: 'ABC-123',
    color: 'Argent',
    dailyRate: 55,
    includedKmPerDay: 200,
    extraKmRate: 0.3,
  },
  startDate: '2026-07-01T00:00:00.000Z',
  endDate: '2026-07-05T00:00:00.000Z',
  mileageAtStart: 10000,
  fuelLevelAtStart: 100,
  conditionNotes: '',
  photos: [],
  totalPrice: 220,
  billableHalfDays: 8,
  payments: [],
  quotePdfUri: null,
  createdAt: '2026-06-20T00:00:00.000Z',
  acceptedAt: null,
  signatureUri: null,
  returnedAt: null,
  mileageAtEnd: null,
  fuelLevelAtEnd: null,
  endConditionNotes: null,
  returnReportPdfUri: null,
  ...overrides,
});

const createFakeFleetRepository = (vehicles: Vehicle[]): FleetRepositoryInterface => ({
  getAll: async () => vehicles,
  getById: async (id) => vehicles.find((candidate) => candidate.id === id) ?? null,
});

const createFakeRentalRepository = (rentals: Rental[]): RentalRepositoryInterface => ({
  getAll: async () => rentals,
  getById: async (id) => rentals.find((rental) => rental.id === id) ?? null,
  create: async () => {
    throw new Error('not implemented');
  },
  update: async () => {
    throw new Error('not implemented');
  },
  acceptQuote: async () => {
    throw new Error('not implemented');
  },
  recordReturn: async () => {
    throw new Error('not implemented');
  },
  addPayment: async () => {
    throw new Error('not implemented');
  },
  markPaymentPaid: async () => {
    throw new Error('not implemented');
  },
  remove: async () => {
    throw new Error('not implemented');
  },
});

const renderWithQueryClient = async (
  fleetRepository: FleetRepositoryInterface,
  rentalRepository: RentalRepositoryInterface
) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useVehicleListViewModel({ fleetRepository, rentalRepository }), { wrapper });
};

describe('useVehicleListViewModel', () => {
  it('flags a vehicle as rented when it has an in-progress rental', async () => {
    // arrange
    const rentedVehicle = createVehicle({ id: 'rented' });
    const freeVehicle = createVehicle({ id: 'free' });
    const fleetRepository = createFakeFleetRepository([rentedVehicle, freeVehicle]);
    const rentalRepository = createFakeRentalRepository([
      createRental({ vehicleId: 'rented', acceptedAt: '2026-07-01T00:00:00.000Z', returnedAt: null }),
    ]);

    // act
    const { result } = await renderWithQueryClient(fleetRepository, rentalRepository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // assert
    expect(result.current.vehicles).toEqual([
      { vehicle: rentedVehicle, isRented: true },
      { vehicle: freeVehicle, isRented: false },
    ]);
  });

  it('does not flag a vehicle as rented for a pending or returned rental', async () => {
    // arrange
    const vehicle = createVehicle({ id: 'vehicle-1' });
    const fleetRepository = createFakeFleetRepository([vehicle]);
    const rentalRepository = createFakeRentalRepository([
      createRental({ vehicleId: 'vehicle-1', acceptedAt: null, returnedAt: null }),
      createRental({
        id: 'rental-2',
        vehicleId: 'vehicle-1',
        acceptedAt: '2026-07-01T00:00:00.000Z',
        returnedAt: '2026-07-05T00:00:00.000Z',
      }),
    ]);

    // act
    const { result } = await renderWithQueryClient(fleetRepository, rentalRepository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // assert
    expect(result.current.vehicles).toEqual([{ vehicle, isRented: false }]);
  });
});
