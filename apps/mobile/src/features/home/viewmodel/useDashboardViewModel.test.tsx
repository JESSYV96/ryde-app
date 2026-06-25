import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import type { Rental } from '@/features/rental/model/rental.types';
import type { RentalRepositoryInterface } from '@/features/rental/repository/RentalRepository.interface';

import { DashboardTab, useDashboardViewModel } from './useDashboardViewModel';

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

const createFakeRepository = (rentals: Rental[]): RentalRepositoryInterface => ({
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

const renderWithQueryClient = async (repository: RentalRepositoryInterface) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useDashboardViewModel({ repository }), { wrapper });
};

describe('useDashboardViewModel', () => {
  it('sorts fetched rentals into the pending acceptance, in progress and past tabs', async () => {
    // arrange
    const pendingRental = createRental({ id: 'pending', acceptedAt: null, returnedAt: null });
    const inProgressRental = createRental({ id: 'in-progress', acceptedAt: '2026-07-01T00:00:00.000Z', returnedAt: null });
    const pastRental = createRental({
      id: 'past',
      acceptedAt: '2026-07-01T00:00:00.000Z',
      returnedAt: '2026-07-05T00:00:00.000Z',
    });
    const repository = createFakeRepository([pendingRental, inProgressRental, pastRental]);

    // act
    const { result } = await renderWithQueryClient(repository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // assert
    expect(result.current.visibleRentals).toEqual([inProgressRental]);

    await act(() => result.current.onSelectTab(DashboardTab.PendingAcceptance));
    await waitFor(() => expect(result.current.visibleRentals).toEqual([pendingRental]));

    await act(() => result.current.onSelectTab(DashboardTab.Past));
    await waitFor(() => expect(result.current.visibleRentals).toEqual([pastRental]));
  });

  it('defaults to an empty list for every tab while no rentals exist', async () => {
    // arrange
    const repository = createFakeRepository([]);

    // act
    const { result } = await renderWithQueryClient(repository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // assert
    expect(result.current.visibleRentals).toEqual([]);
  });
});
