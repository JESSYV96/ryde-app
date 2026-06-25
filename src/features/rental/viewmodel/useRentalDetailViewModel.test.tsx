import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { shareAsync } from 'expo-sharing';
import type { ReactNode } from 'react';

import type { Rental } from '@/features/rental/model/rental.types';
import type { RentalRepositoryInterface } from '@/features/rental/repository/RentalRepository.interface';

import { useRentalDetailViewModel } from './useRentalDetailViewModel';

jest.mock('expo-router', () => ({ router: { push: jest.fn() } }));
jest.mock('expo-sharing', () => ({ shareAsync: jest.fn() }));

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
  vehicleSnapshot: { make: 'Toyota', model: 'Corolla', year: 2022, licensePlate: 'ABC-123', color: 'Argent' },
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

const createFakeRepository = (rental: Rental | null): RentalRepositoryInterface => ({
  getAll: async () => (rental ? [rental] : []),
  getById: async () => rental,
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
  remove: async () => {
    throw new Error('not implemented');
  },
});

const renderWithQueryClient = async (rentalId: string, repository: RentalRepositoryInterface) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useRentalDetailViewModel(rentalId, { repository }), { wrapper });
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useRentalDetailViewModel', () => {
  it('derives pending-acceptance status for a rental with no acceptedAt', async () => {
    // arrange
    const rental = createRental({ acceptedAt: null, returnedAt: null });
    const repository = createFakeRepository(rental);

    // act
    const { result } = await renderWithQueryClient(rental.id, repository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // assert
    expect(result.current.status).toBe('pending-acceptance');
  });

  it('derives returned status for a rental with a returnedAt', async () => {
    // arrange
    const rental = createRental({ acceptedAt: '2026-07-01T00:00:00.000Z', returnedAt: '2026-07-05T00:00:00.000Z' });
    const repository = createFakeRepository(rental);

    // act
    const { result } = await renderWithQueryClient(rental.id, repository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // assert
    expect(result.current.status).toBe('returned');
  });

  it('shares the quote pdf only when one exists', async () => {
    // arrange
    const rental = createRental({ quotePdfUri: 'file:///quote.pdf' });
    const repository = createFakeRepository(rental);

    // act
    const { result } = await renderWithQueryClient(rental.id, repository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(() => result.current.onShareQuotePdf());

    // assert
    expect(shareAsync).toHaveBeenCalledWith('file:///quote.pdf');
  });

  it('does not share when there is no quote pdf yet', async () => {
    // arrange
    const rental = createRental({ quotePdfUri: null });
    const repository = createFakeRepository(rental);

    // act
    const { result } = await renderWithQueryClient(rental.id, repository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(() => result.current.onShareQuotePdf());

    // assert
    expect(shareAsync).not.toHaveBeenCalled();
  });

  it('navigates to the checkout return flow', async () => {
    // arrange
    const rental = createRental({});
    const repository = createFakeRepository(rental);

    // act
    const { result } = await renderWithQueryClient(rental.id, repository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(() => result.current.onStartCheckout());

    // assert
    expect(router.push).toHaveBeenCalledWith({ pathname: '/rentals/[id]/return', params: { id: rental.id } });
  });
});
