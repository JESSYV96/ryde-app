import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import type { ReactNode } from 'react';

import type {
  RecognizedVehicleDraft,
  Vehicle,
  VehicleInput,
} from '@/features/fleet/model/vehicle.types';
import type { FleetRepositoryInterface } from '@/features/fleet/repository/FleetRepository';

import { useVehicleFormViewModel } from './useVehicleFormViewModel';

jest.mock('expo-router', () => ({ router: { back: jest.fn() } }));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
jest.mock('expo-image-picker', () => ({
  requestCameraPermissionsAsync: jest.fn(async () => ({ granted: true })),
  launchCameraAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
}));

const mockCamera = (uri: string) => {
  (ImagePicker.launchCameraAsync as jest.Mock).mockResolvedValueOnce({
    canceled: false,
    assets: [{ uri }],
  });
};

const noopRepository = (): FleetRepositoryInterface => ({
  getAll: async () => [],
  getById: async () => null,
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

const renderForm = (deps: Parameters<typeof useVehicleFormViewModel>[1]) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return renderHook(() => useVehicleFormViewModel(undefined, deps), { wrapper });
};

describe('useVehicleFormViewModel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('pre-fills the detected fields from the recognition draft', async () => {
    // arrange
    const draft: RecognizedVehicleDraft = {
      make: 'Honda',
      model: 'Civic',
      year: 2020,
      color: 'Bleu',
      licensePlate: 'XYZ-001',
    };
    const { result } = await renderForm({ repository: noopRepository(), recognize: async () => draft });

    mockCamera('file:///temp-1.jpg');
    await act(async () => {
      await result.current.addPhotoFromCamera();
    });

    // act
    await act(async () => {
      await result.current.analyzePhotos();
    });

    // assert
    expect(result.current.form.state.values).toMatchObject({
      make: 'Honda',
      model: 'Civic',
      year: '2020',
      color: 'Bleu',
      licensePlate: 'XYZ-001',
    });
    expect(result.current.recognitionStatus).toBe('idle');
  });

  it('keeps exactly one primary photo and auto-promotes when it is removed', async () => {
    // arrange
    const { result } = await renderForm({ repository: noopRepository() });

    mockCamera('file:///a.jpg');
    await act(async () => {
      await result.current.addPhotoFromCamera();
    });
    mockCamera('file:///b.jpg');
    await act(async () => {
      await result.current.addPhotoFromCamera();
    });

    // first added is primary by default
    expect(result.current.photos.filter((photo) => photo.isPrimary)).toHaveLength(1);
    expect(result.current.photos[0].isPrimary).toBe(true);

    const [firstId, secondId] = result.current.photos.map((photo) => photo.id);

    // selecting the second makes it the only primary
    await act(async () => result.current.setPrimaryPhoto(secondId));
    expect(result.current.photos.find((photo) => photo.id === secondId)?.isPrimary).toBe(true);
    expect(result.current.photos.find((photo) => photo.id === firstId)?.isPrimary).toBe(false);

    // removing the primary auto-promotes the remaining one
    await act(async () => result.current.removePhoto(secondId));
    expect(result.current.photos).toHaveLength(1);
    expect(result.current.photos[0].isPrimary).toBe(true);
  });

  it('copies photos to permanent storage only on save and persists them', async () => {
    // arrange
    let created: VehicleInput | undefined;
    const repository: FleetRepositoryInterface = {
      ...noopRepository(),
      create: async (input) => {
        created = input;
        return { id: 'veh-new', ...input, photos: [] } as unknown as Vehicle;
      },
    };
    const copyToPermanentStorage = jest.fn(async (tempUri: string) => ({ uri: `permanent://${tempUri}` }));
    const { result } = await renderForm({ repository, copyToPermanentStorage });

    mockCamera('file:///temp-9.jpg');
    await act(async () => {
      await result.current.addPhotoFromCamera();
    });
    // nothing copied just by adding
    expect(copyToPermanentStorage).not.toHaveBeenCalled();

    act(() => {
      result.current.form.setFieldValue('make', 'Toyota');
      result.current.form.setFieldValue('model', 'Corolla');
      result.current.form.setFieldValue('year', '2022');
      result.current.form.setFieldValue('licensePlate', 'ABC-123');
      result.current.form.setFieldValue('color', 'Argent');
      result.current.form.setFieldValue('dailyRate', '55');
      result.current.form.setFieldValue('includedKmPerDay', '200');
      result.current.form.setFieldValue('extraKmRate', '0.3');
      result.current.form.setFieldValue('currentMileage', '42000');
    });

    // act
    await act(async () => {
      await result.current.form.handleSubmit();
    });

    // assert — copied at save, persisted with the permanent uri, primary preserved
    expect(copyToPermanentStorage).toHaveBeenCalledWith('file:///temp-9.jpg');
    expect(created?.photos).toEqual([
      { uri: 'permanent://file:///temp-9.jpg', takenAt: expect.any(String), isPrimary: true },
    ]);
  });
});
