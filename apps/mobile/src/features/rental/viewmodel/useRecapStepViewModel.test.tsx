import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';

import type { Vehicle } from '@/features/fleet/model/vehicle.types';
import type { FleetRepositoryInterface } from '@/features/fleet/repository/FleetRepository';
import type { Rental } from '@/features/rental/model/rental.types';
import type { RentalRepositoryInterface } from '@/features/rental/repository/RentalRepository.interface';
import { generateQuotePdf } from '@/features/rental/services/pdf/quotePdfService';
import { deletePhotos } from '@/features/rental/services/photoStorageService';
import { useRentalDraftStore } from '@/store/rentalDraftStore';

import { useRecapStepViewModel } from './useRecapStepViewModel';

jest.mock('expo-router', () => ({ router: { back: jest.fn(), dismissTo: jest.fn(), push: jest.fn() } }));
jest.mock('@/features/rental/services/pdf/quotePdfService', () => ({
  generateQuotePdf: jest.fn(async () => 'file:///quote.pdf'),
}));
jest.mock('@/features/rental/services/photoStorageService', () => ({ deletePhotos: jest.fn() }));

const vehicle: Vehicle = {
  id: 'vehicle-1',
  make: 'Toyota',
  model: 'Corolla',
  year: 2022,
  licensePlate: 'ABC-123',
  color: 'Argent',
};

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
  vehicleId: vehicle.id,
  vehicleSnapshot: { make: vehicle.make, model: vehicle.model, year: vehicle.year, licensePlate: vehicle.licensePlate, color: vehicle.color },
  startDate: '2026-07-01T00:00:00.000Z',
  endDate: '2026-07-05T00:00:00.000Z',
  mileageAtStart: 10000,
  fuelLevelAtStart: 100,
  conditionNotes: '',
  photos: [],
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

const createFakeRentalRepository = (rental: Rental): RentalRepositoryInterface => ({
  getAll: async () => [rental],
  getById: async () => rental,
  create: jest.fn(async () => rental),
  update: jest.fn(async (id, patch) => ({ ...rental, ...patch })),
  acceptQuote: async () => {
    throw new Error('not implemented');
  },
  recordReturn: async () => {
    throw new Error('not implemented');
  },
  remove: async () => {
    throw new Error('not implemented');
  },
});

const fillValidDraft = () => {
  useRentalDraftStore.getState().setCustomer({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phoneNumber: '555-0100',
    licensePhotoFrontUri: 'file:///front.jpg',
    licensePhotoBackUri: 'file:///back.jpg',
  });
  useRentalDraftStore
    .getState()
    .setVehicleAndDates({ vehicleId: vehicle.id, startDate: '2026-07-01T00:00:00.000Z', endDate: '2026-07-05T00:00:00.000Z' });
  useRentalDraftStore.getState().setInspection({ mileageAtStart: 10000, fuelLevelAtStart: 100, conditionNotes: '' });
};

const renderWithQueryClient = async (
  fleetRepository: FleetRepositoryInterface,
  rentalRepository: RentalRepositoryInterface
) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useRecapStepViewModel({ fleetRepository, rentalRepository }), { wrapper });
};

beforeEach(() => {
  jest.clearAllMocks();
  useRentalDraftStore.getState().reset();
});

describe('useRecapStepViewModel', () => {
  it('loads the selected vehicle once a vehicleId is set on the draft', async () => {
    // arrange
    fillValidDraft();
    const fleetRepository = createFakeFleetRepository([vehicle]);
    const rentalRepository = createFakeRentalRepository(createRental({}));

    // act
    const { result } = await renderWithQueryClient(fleetRepository, rentalRepository);
    await waitFor(() => expect(result.current.isLoadingVehicle).toBe(false));

    // assert
    expect(result.current.vehicle).toEqual(vehicle);
  });

  it('does not query a vehicle when the draft has no vehicleId yet', async () => {
    // arrange
    const fleetRepository = createFakeFleetRepository([vehicle]);
    const rentalRepository = createFakeRentalRepository(createRental({}));

    // act
    const { result } = await renderWithQueryClient(fleetRepository, rentalRepository);

    // assert
    expect(result.current.isLoadingVehicle).toBe(false);
    expect(result.current.vehicle).toBeUndefined();
  });

  it('creates the rental, generates the quote pdf and navigates to accept-quote on submit', async () => {
    // arrange
    fillValidDraft();
    const rental = createRental({});
    const fleetRepository = createFakeFleetRepository([vehicle]);
    const rentalRepository = createFakeRentalRepository(rental);

    // act
    const { result } = await renderWithQueryClient(fleetRepository, rentalRepository);
    await waitFor(() => expect(result.current.isLoadingVehicle).toBe(false));
    await act(() => result.current.form.handleSubmit());
    await waitFor(() => expect(rentalRepository.update).toHaveBeenCalled());

    // assert
    expect(rentalRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ vehicleId: vehicle.id, mileageAtStart: 10000 })
    );
    expect(generateQuotePdf).toHaveBeenCalledWith(rental);
    expect(rentalRepository.update).toHaveBeenCalledWith(rental.id, { quotePdfUri: 'file:///quote.pdf' });
    expect(useRentalDraftStore.getState().draft.vehicleId).toBeNull();
    expect(router.dismissTo).toHaveBeenCalledWith('/');
    expect(router.push).toHaveBeenCalledWith({ pathname: '/rentals/[id]/accept-quote', params: { id: rental.id } });
  });

  it('does not create a rental when the inspection step was never completed', async () => {
    // arrange
    useRentalDraftStore
      .getState()
      .setVehicleAndDates({ vehicleId: vehicle.id, startDate: '2026-07-01T00:00:00.000Z', endDate: '2026-07-05T00:00:00.000Z' });
    const fleetRepository = createFakeFleetRepository([vehicle]);
    const rentalRepository = createFakeRentalRepository(createRental({}));

    // act
    const { result } = await renderWithQueryClient(fleetRepository, rentalRepository);
    await waitFor(() => expect(result.current.isLoadingVehicle).toBe(false));
    await act(() => result.current.form.handleSubmit());

    // assert
    expect(rentalRepository.create).not.toHaveBeenCalled();
  });

  it('deletes draft photos, resets the draft and dismisses the wizard on cancel', async () => {
    // arrange
    fillValidDraft();
    useRentalDraftStore.getState().addPhoto({ id: 'photo-1', uri: 'file:///photo-1.jpg', phase: 'before', takenAt: '2026-06-20T00:00:00.000Z' });
    const fleetRepository = createFakeFleetRepository([vehicle]);
    const rentalRepository = createFakeRentalRepository(createRental({}));

    // act
    const { result } = await renderWithQueryClient(fleetRepository, rentalRepository);
    await waitFor(() => expect(result.current.isLoadingVehicle).toBe(false));
    await act(() => result.current.onCancel());

    // assert
    expect(deletePhotos).toHaveBeenCalledWith(['file:///photo-1.jpg']);
    expect(useRentalDraftStore.getState().draft.photos).toEqual([]);
    expect(router.dismissTo).toHaveBeenCalledWith('/');
  });

  it('navigates back on onBack', async () => {
    // arrange
    const fleetRepository = createFakeFleetRepository([vehicle]);
    const rentalRepository = createFakeRentalRepository(createRental({}));

    // act
    const { result } = await renderWithQueryClient(fleetRepository, rentalRepository);
    await act(() => result.current.onBack());

    // assert
    expect(router.back).toHaveBeenCalled();
  });
});
