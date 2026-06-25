import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';

import { PhotoPhase } from '@/features/rental/model/rental.types';
import type { Rental } from '@/features/rental/model/rental.types';
import type { RentalRepositoryInterface } from '@/features/rental/repository/RentalRepository.interface';
import { generateReturnReportPdf } from '@/features/rental/services/pdf/quotePdfService';
import { copyToPermanentStorage, deletePhotos } from '@/features/rental/services/photoStorageService';
import { useRentalReturnDraftStore } from '@/store/rentalReturnDraftStore';

import { useReturnStepViewModel } from './useReturnStepViewModel';

const mockUseCameraPermissions = jest.fn();
const mockRequestPermission = jest.fn();

jest.mock('expo-router', () => ({ router: { back: jest.fn(), dismissTo: jest.fn() } }));
jest.mock('expo-camera', () => ({
  useCameraPermissions: () => mockUseCameraPermissions(),
  CameraView: () => null,
}));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('@/features/rental/services/pdf/quotePdfService', () => ({
  generateReturnReportPdf: jest.fn(async () => 'file:///return-report.pdf'),
}));
jest.mock('@/features/rental/services/photoStorageService', () => ({
  copyToPermanentStorage: jest.fn(async () => ({
    id: 'photo-after-1',
    uri: 'file:///after-1.jpg',
    phase: 'after',
    takenAt: '2026-07-05T00:00:00.000Z',
  })),
  deletePhotos: jest.fn(),
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
  acceptedAt: '2026-07-01T00:00:00.000Z',
  signatureUri: 'file:///signature.png',
  returnedAt: null,
  mileageAtEnd: null,
  fuelLevelAtEnd: null,
  endConditionNotes: null,
  returnReportPdfUri: null,
  ...overrides,
});

const createFakeRepository = (rental: Rental): RentalRepositoryInterface => ({
  getAll: async () => [rental],
  getById: async () => rental,
  create: async () => {
    throw new Error('not implemented');
  },
  update: jest.fn(async (id, patch) => ({ ...rental, ...patch })),
  acceptQuote: async () => {
    throw new Error('not implemented');
  },
  recordReturn: jest.fn(async (id, input) => ({
    ...rental,
    mileageAtEnd: input.mileageAtEnd,
    fuelLevelAtEnd: input.fuelLevelAtEnd,
    endConditionNotes: input.endConditionNotes,
    returnedAt: '2026-07-05T00:00:00.000Z',
  })),
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

const renderWithQueryClient = async (rentalId: string, repository: RentalRepositoryInterface) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useReturnStepViewModel(rentalId, { repository }), { wrapper });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseCameraPermissions.mockReturnValue([{ granted: true }, mockRequestPermission]);
  useRentalReturnDraftStore.getState().reset();
});

describe('useReturnStepViewModel', () => {
  it('rejects an end mileage below the rental start mileage once the rental has loaded', async () => {
    // arrange
    const rental = createRental({ mileageAtStart: 10000 });
    const repository = createFakeRepository(rental);

    // act
    const { result } = await renderWithQueryClient(rental.id, repository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // assert
    expect(result.current.mileageAtEndValidator({ value: 9000 })).toBe('validation.mileageAtEndBelowStart');
    expect(result.current.mileageAtEndValidator({ value: 10500 })).toBeUndefined();
  });

  it('rejects a negative end mileage regardless of the rental data', async () => {
    // arrange
    const rental = createRental({ mileageAtStart: 10000 });
    const repository = createFakeRepository(rental);

    // act
    const { result } = await renderWithQueryClient(rental.id, repository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    // assert
    expect(result.current.mileageAtEndValidator({ value: -1 })).toBe('validation.mileageNonNegative');
  });

  it('opens the camera only once permission is granted', async () => {
    // arrange
    mockUseCameraPermissions.mockReturnValue([{ granted: false }, mockRequestPermission]);
    mockRequestPermission.mockResolvedValue({ granted: false });
    const rental = createRental({});
    const repository = createFakeRepository(rental);

    // act
    const { result } = await renderWithQueryClient(rental.id, repository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(() => result.current.openCamera());

    // assert
    expect(mockRequestPermission).toHaveBeenCalled();
    expect(result.current.isCameraOpen).toBe(false);
  });

  it('captures a photo into the draft and clears the missing-photo error', async () => {
    // arrange
    const rental = createRental({});
    const repository = createFakeRepository(rental);

    // act
    const { result } = await renderWithQueryClient(rental.id, repository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(() => {
      result.current.cameraRef.current = { takePictureAsync: jest.fn(async () => ({ uri: 'file:///temp.jpg' })) } as never;
    });
    await act(() => result.current.capturePhoto());

    // assert
    expect(copyToPermanentStorage).toHaveBeenCalledWith({
      tempUri: 'file:///temp.jpg',
      rentalDraftId: rental.id,
      phase: PhotoPhase.After,
    });
    expect(useRentalReturnDraftStore.getState().draft.photos).toEqual([
      { id: 'photo-after-1', uri: 'file:///after-1.jpg', phase: 'after', takenAt: '2026-07-05T00:00:00.000Z' },
    ]);
    expect(result.current.photoRequiredError).toBe(false);
  });

  it('removes a photo from the draft and deletes its file', async () => {
    // arrange
    useRentalReturnDraftStore.getState().addPhoto({
      id: 'photo-1',
      uri: 'file:///photo-1.jpg',
      phase: PhotoPhase.After,
      takenAt: '2026-07-05T00:00:00.000Z',
    });
    const rental = createRental({});
    const repository = createFakeRepository(rental);

    // act
    const { result } = await renderWithQueryClient(rental.id, repository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(() => result.current.removePhoto('photo-1'));

    // assert
    expect(deletePhotos).toHaveBeenCalledWith(['file:///photo-1.jpg']);
    expect(useRentalReturnDraftStore.getState().draft.photos).toEqual([]);
  });

  it('blocks submission and flags the missing-photo error when no photo was captured', async () => {
    // arrange
    const rental = createRental({});
    const repository = createFakeRepository(rental);

    // act
    const { result } = await renderWithQueryClient(rental.id, repository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(() => {
      result.current.form.setFieldValue('mileageAtEnd', 10500);
      result.current.form.setFieldValue('fuelLevelAtEnd', 50);
    });
    await act(() => result.current.form.handleSubmit());

    // assert
    expect(result.current.photoRequiredError).toBe(true);
    expect(repository.recordReturn).not.toHaveBeenCalled();
  });

  it('records the return and navigates back to the rental once a photo exists', async () => {
    // arrange
    useRentalReturnDraftStore.getState().addPhoto({
      id: 'photo-1',
      uri: 'file:///photo-1.jpg',
      phase: PhotoPhase.After,
      takenAt: '2026-07-05T00:00:00.000Z',
    });
    const rental = createRental({});
    const repository = createFakeRepository(rental);

    // act
    const { result } = await renderWithQueryClient(rental.id, repository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(() => {
      result.current.form.setFieldValue('mileageAtEnd', 10500);
      result.current.form.setFieldValue('fuelLevelAtEnd', 50);
    });
    await act(() => result.current.form.handleSubmit());
    await waitFor(() => expect(repository.update).toHaveBeenCalled());

    // assert
    expect(repository.recordReturn).toHaveBeenCalledWith(rental.id, expect.objectContaining({ mileageAtEnd: 10500 }));
    expect(generateReturnReportPdf).toHaveBeenCalled();
    expect(repository.update).toHaveBeenCalledWith(rental.id, { returnReportPdfUri: 'file:///return-report.pdf' });
    expect(useRentalReturnDraftStore.getState().draft.photos).toEqual([]);
    expect(router.dismissTo).toHaveBeenCalledWith({ pathname: '/rentals/[id]', params: { id: rental.id } });
  });

  it('deletes all draft photos, resets the draft and navigates back on cancel', async () => {
    // arrange
    useRentalReturnDraftStore.getState().addPhoto({
      id: 'photo-1',
      uri: 'file:///photo-1.jpg',
      phase: PhotoPhase.After,
      takenAt: '2026-07-05T00:00:00.000Z',
    });
    const rental = createRental({});
    const repository = createFakeRepository(rental);

    // act
    const { result } = await renderWithQueryClient(rental.id, repository);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    await act(() => result.current.onCancel());

    // assert
    expect(deletePhotos).toHaveBeenCalledWith(['file:///photo-1.jpg']);
    expect(useRentalReturnDraftStore.getState().draft.photos).toEqual([]);
    expect(router.back).toHaveBeenCalled();
  });
});
