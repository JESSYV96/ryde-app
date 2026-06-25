import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';

import type { Vehicle } from '@/features/fleet/model/vehicle.types';
import type { FleetRepositoryInterface } from '@/features/fleet/repository/FleetRepository';
import { deletePhotos } from '@/features/rental/services/photoStorageService';
import { useRentalDraftStore } from '@/store/rentalDraftStore';

import { useVehicleStepViewModel } from './useVehicleStepViewModel';

jest.mock('expo-router', () => ({ router: { push: jest.fn(), back: jest.fn(), dismissTo: jest.fn() } }));
jest.mock('@/features/rental/services/photoStorageService', () => ({ deletePhotos: jest.fn() }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const vehicle: Vehicle = {
  id: 'vehicle-1',
  make: 'Toyota',
  model: 'Corolla',
  year: 2022,
  licensePlate: 'ABC-123',
  color: 'Argent',
  dailyRate: 55,
  includedKmPerDay: 200,
  extraKmRate: 0.3,
};

const createFakeRepository = (vehicles: Vehicle[]): FleetRepositoryInterface => ({
  getAll: async () => vehicles,
  getById: async (id) => vehicles.find((candidate) => candidate.id === id) ?? null,
});

const renderWithQueryClient = async (repository: FleetRepositoryInterface) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useVehicleStepViewModel({ repository }), { wrapper });
};

beforeEach(() => {
  jest.clearAllMocks();
  useRentalDraftStore.getState().reset();
});

describe('useVehicleStepViewModel', () => {
  it('exposes the fleet vehicles from the repository', async () => {
    // arrange
    const repository = createFakeRepository([vehicle]);

    // act
    const { result } = await renderWithQueryClient(repository);
    await waitFor(() => expect(result.current.isLoadingVehicles).toBe(false));

    // assert
    expect(result.current.vehicles).toEqual([vehicle]);
  });

  it('saves the selection to the draft and moves to inspection on submit', async () => {
    // arrange
    const repository = createFakeRepository([vehicle]);

    // act
    const { result } = await renderWithQueryClient(repository);
    await waitFor(() => expect(result.current.isLoadingVehicles).toBe(false));
    await act(async () => {
      result.current.form.setFieldValue('vehicleId', vehicle.id);
      result.current.form.setFieldValue('startDate', '2026-07-01T00:00:00.000Z');
      result.current.form.setFieldValue('endDate', '2026-07-05T00:00:00.000Z');
    });
    await act(() => result.current.form.handleSubmit());

    // assert
    expect(useRentalDraftStore.getState().draft.vehicleId).toBe(vehicle.id);
    expect(router.push).toHaveBeenCalledWith('/rentals/new/inspection');
  });

  it('deletes draft photos, resets the draft and dismisses the wizard on cancel', async () => {
    // arrange
    const repository = createFakeRepository([vehicle]);
    useRentalDraftStore.getState().addPhoto({ id: 'photo-1', uri: 'file:///photo-1.jpg', phase: 'before', takenAt: '2026-06-20T00:00:00.000Z' });

    // act
    const { result } = await renderWithQueryClient(repository);
    await waitFor(() => expect(result.current.isLoadingVehicles).toBe(false));
    await act(() => result.current.onCancel());

    // assert
    expect(deletePhotos).toHaveBeenCalledWith(['file:///photo-1.jpg']);
    expect(useRentalDraftStore.getState().draft.photos).toEqual([]);
    expect(router.dismissTo).toHaveBeenCalledWith('/');
  });

  it('navigates back on onBack', async () => {
    // arrange
    const repository = createFakeRepository([vehicle]);

    // act
    const { result } = await renderWithQueryClient(repository);
    await waitFor(() => expect(result.current.isLoadingVehicles).toBe(false));
    await act(() => result.current.onBack());

    // assert
    expect(router.back).toHaveBeenCalled();
  });
});
