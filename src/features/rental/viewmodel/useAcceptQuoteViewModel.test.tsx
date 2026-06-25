import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { RefObject } from 'react';
import type { ReactNode } from 'react';

import type { Rental } from '@/features/rental/model/rental.types';
import type { RentalRepositoryInterface } from '@/features/rental/repository/RentalRepository.interface';
import { rentalQueryKeys } from '@/features/rental/repository/RentalRepository.interface';
import { saveSignature } from '@/features/rental/services/photoStorageService';
import type { SignaturePadRef } from '@/shared/ui/design-system/atoms/SignaturePad';

import { useAcceptQuoteViewModel } from './useAcceptQuoteViewModel';

jest.mock('expo-router', () => ({ router: { replace: jest.fn() } }));
jest.mock('@/features/rental/services/photoStorageService', () => ({
  saveSignature: jest.fn(() => 'file:///signature.png'),
}));

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

const createFakeRepository = (rental: Rental): RentalRepositoryInterface => ({
  getAll: async () => [rental],
  getById: jest.fn(async () => rental),
  create: async () => {
    throw new Error('not implemented');
  },
  update: async () => {
    throw new Error('not implemented');
  },
  acceptQuote: jest.fn(async (id, input) => ({ ...rental, acceptedAt: '2026-07-02T00:00:00.000Z', ...input })),
  recordReturn: async () => {
    throw new Error('not implemented');
  },
  remove: async () => {
    throw new Error('not implemented');
  },
});

const createSignaturePadRef = (base64Png: string | undefined): RefObject<SignaturePadRef | null> => ({
  current: { exportAsPng: async () => base64Png, clear: jest.fn() } as unknown as SignaturePadRef,
});

const renderWithQueryClient = async (rentalId: string, repository: RentalRepositoryInterface) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const rendered = await renderHook(() => useAcceptQuoteViewModel(rentalId, { repository }), { wrapper });
  return { ...rendered, queryClient };
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useAcceptQuoteViewModel', () => {
  it('toggles hasSignature via onSignatureChange', async () => {
    // arrange
    const rental = createRental({});
    const repository = createFakeRepository(rental);

    // act
    const { result } = await renderWithQueryClient(rental.id, repository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(() => result.current.onSignatureChange(true));

    // assert
    expect(result.current.hasSignature).toBe(true);
  });

  it('saves the exported signature and accepts the quote', async () => {
    // arrange
    const rental = createRental({});
    const repository = createFakeRepository(rental);
    const signaturePadRef = createSignaturePadRef('base64-png-data');

    // act
    const { result, queryClient } = await renderWithQueryClient(rental.id, repository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(() => result.current.onAccept(signaturePadRef));
    await waitFor(() => expect(result.current.isAccepting).toBe(false));
    // accepting invalidates the detail query, which is actively observed here and
    // triggers a background refetch — wait for it to fully settle too, so it can't
    // notify React past the end of this test, outside of any act() scope
    await waitFor(() => expect(queryClient.isFetching({ queryKey: rentalQueryKeys.detail(rental.id) })).toBe(0));

    // assert
    expect(saveSignature).toHaveBeenCalledWith({ base64Png: 'base64-png-data', rentalId: rental.id });
    expect(repository.acceptQuote).toHaveBeenCalledWith(rental.id, { signatureUri: 'file:///signature.png' });
    expect(router.replace).toHaveBeenCalledWith({ pathname: '/rentals/[id]', params: { id: rental.id } });
  });

  it('does not accept the quote when no signature was exported', async () => {
    // arrange
    const rental = createRental({});
    const repository = createFakeRepository(rental);
    const signaturePadRef = createSignaturePadRef(undefined);

    // act
    const { result } = await renderWithQueryClient(rental.id, repository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(() => result.current.onAccept(signaturePadRef));
    await waitFor(() => expect(result.current.isAccepting).toBe(false));

    // assert
    expect(repository.acceptQuote).not.toHaveBeenCalled();
    expect(router.replace).not.toHaveBeenCalled();
  });
});
