import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { createVehicleSchema } from '@/features/fleet/model/vehicle.schema';
import type {
  RecognizedVehicleDraft,
  Vehicle,
  VehicleInput,
  VehicleType,
} from '@/features/fleet/model/vehicle.types';
import type { FleetRepositoryInterface } from '@/features/fleet/repository/FleetRepository';
import { fleetQueryKeys } from '@/features/fleet/repository/FleetRepository';
import { fleetRepository } from '@/features/fleet/repository/SqliteFleetRepository';
import { recognizeVehicleFromPhotos } from '@/features/fleet/services/vehicleRecognitionService';
import {
  copyToPermanentStorage as copyToPermanentStorageImpl,
  deletePhotos as deletePhotosImpl,
} from '@/features/fleet/services/vehiclePhotoStorageService';
import { nowIso } from '@/shared/utils/date';
import { generateId } from '@/shared/utils/id';

// A photo held in the form before the vehicle is saved. `uri` is a temporary
// camera/picker uri for a newly added photo, or the permanent uri for one loaded
// in edit mode. Nothing is copied to permanent storage until the form is saved.
export interface VehiclePhotoDraft {
  id: string;
  uri: string;
  takenAt: string;
  isPrimary: boolean;
}

export type RecognitionStatus = 'idle' | 'empty' | 'error';

interface UseVehicleFormViewModelDeps {
  repository?: FleetRepositoryInterface;
  recognize?: (uris: string[]) => Promise<RecognizedVehicleDraft>;
  copyToPermanentStorage?: (tempUri: string) => Promise<{ uri: string }>;
  deletePhotos?: (uris: string[]) => Promise<void>;
}

const toFormValues = (vehicle?: Vehicle | null) => ({
  type: vehicle?.type ?? ('car' as VehicleType),
  make: vehicle?.make ?? '',
  model: vehicle?.model ?? '',
  year: vehicle ? String(vehicle.year) : '',
  licensePlate: vehicle?.licensePlate ?? '',
  color: vehicle?.color ?? '',
  dailyRate: vehicle ? String(vehicle.dailyRate) : '',
  includedKmPerDay: vehicle ? String(vehicle.includedKmPerDay) : '',
  extraKmRate: vehicle ? String(vehicle.extraKmRate) : '',
  currentMileage: vehicle ? String(vehicle.currentMileage) : '',
});

// Keeps the primary-photo invariant: exactly one primary whenever photos exist.
const withPromotedPrimary = (photos: VehiclePhotoDraft[]): VehiclePhotoDraft[] => {
  if (photos.length === 0 || photos.some((photo) => photo.isPrimary)) {
    return photos;
  }
  return photos.map((photo, index) => (index === 0 ? { ...photo, isPrimary: true } : photo));
};

export const useVehicleFormViewModel = (
  vehicleId?: string,
  {
    repository = fleetRepository,
    recognize = recognizeVehicleFromPhotos,
    copyToPermanentStorage = copyToPermanentStorageImpl,
    deletePhotos = deletePhotosImpl,
  }: UseVehicleFormViewModelDeps = {}
) => {
  const { t } = useTranslation('fleet');
  const queryClient = useQueryClient();
  const isEdit = Boolean(vehicleId);
  const vehicleSchema = useMemo(() => createVehicleSchema(t), [t]);

  const [photos, setPhotos] = useState<VehiclePhotoDraft[]>([]);
  const [photosSeeded, setPhotosSeeded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recognitionStatus, setRecognitionStatus] = useState<RecognitionStatus>('idle');

  const { data: vehicle, isLoading } = useQuery({
    queryKey: fleetQueryKeys.detail(vehicleId ?? ''),
    queryFn: () => repository.getById(vehicleId as string),
    enabled: isEdit,
  });

  const mutation = useMutation({
    mutationFn: (input: VehicleInput) =>
      isEdit ? repository.update(vehicleId as string, input) : repository.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fleetQueryKeys.all() });
      if (vehicleId) {
        queryClient.invalidateQueries({ queryKey: fleetQueryKeys.detail(vehicleId) });
      }
      router.back();
    },
  });

  const form = useForm({
    defaultValues: toFormValues(),
    onSubmit: async ({ value }) => {
      const parsed = vehicleSchema.parse(value);
      // Original (already-persisted) photo uris, straight from the loaded
      // vehicle — used to tell existing photos from newly added ones.
      const originalUris = new Set((vehicle?.photos ?? []).map((photo) => photo.uri));
      // Lazily copy newly added photos to permanent storage; existing ones keep
      // their uri. Nothing was written to disk before this point.
      const photoInputs = await Promise.all(
        photos.map(async (photo) => {
          const uri = originalUris.has(photo.uri)
            ? photo.uri
            : (await copyToPermanentStorage(photo.uri)).uri;
          return { uri, takenAt: photo.takenAt, isPrimary: photo.isPrimary };
        })
      );
      await mutation.mutateAsync({ ...parsed, photos: photoInputs });
      // Delete the files of original photos the user removed.
      const keptUris = new Set(photos.map((photo) => photo.uri));
      const removed = [...originalUris].filter((uri) => !keptUris.has(uri));
      if (removed.length > 0) {
        await deletePhotos(removed);
      }
    },
  });

  // Edit mode loads the vehicle asynchronously. Seed the editable photo state
  // from it once it arrives — done during render (not in an effect) per React's
  // "adjust state when data changes" guidance, guarded so it runs only once.
  if (vehicle && !photosSeeded) {
    setPhotosSeeded(true);
    setPhotos(
      vehicle.photos.map((photo) => ({
        id: photo.id,
        uri: photo.uri,
        takenAt: photo.takenAt,
        isPrimary: photo.isPrimary,
      }))
    );
  }

  // The form's scalar fields are populated once the vehicle loads.
  useEffect(() => {
    if (vehicle) {
      form.reset(toFormValues(vehicle));
    }
  }, [vehicle, form]);

  const appendPhoto = (uri: string) => {
    setPhotos((current) => [
      ...current,
      { id: generateId(), uri, takenAt: nowIso(), isPrimary: current.length === 0 },
    ]);
  };

  const addPhotoFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(t('photos.cameraDeniedTitle'), t('photos.cameraDeniedMessage'));
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (!result.canceled) {
      appendPhoto(result.assets[0].uri);
    }
  };

  const addPhotosFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      result.assets.forEach((asset) => appendPhoto(asset.uri));
    }
  };

  const removePhoto = (photoId: string) => {
    setPhotos((current) => withPromotedPrimary(current.filter((photo) => photo.id !== photoId)));
  };

  const setPrimaryPhoto = (photoId: string) => {
    setPhotos((current) => current.map((photo) => ({ ...photo, isPrimary: photo.id === photoId })));
  };

  // Sends the current photos to the server for recognition and pre-fills the
  // detected (non-null) fields, leaving the rest for the user to complete.
  const analyzePhotos = async () => {
    if (photos.length === 0) {
      return;
    }
    setIsAnalyzing(true);
    setRecognitionStatus('idle');
    try {
      const draft = await recognize(photos.map((photo) => photo.uri));
      const detectedNothing =
        draft.make === null &&
        draft.model === null &&
        draft.year === null &&
        draft.color === null &&
        draft.licensePlate === null;
      if (detectedNothing) {
        setRecognitionStatus('empty');
        return;
      }
      if (draft.make !== null) form.setFieldValue('make', draft.make);
      if (draft.model !== null) form.setFieldValue('model', draft.model);
      if (draft.year !== null) form.setFieldValue('year', String(draft.year));
      if (draft.color !== null) form.setFieldValue('color', draft.color);
      if (draft.licensePlate !== null) form.setFieldValue('licensePlate', draft.licensePlate);
    } catch {
      setRecognitionStatus('error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const onCancel = () => router.back();

  return {
    form,
    vehicleSchema,
    isEdit,
    isLoading: isEdit && isLoading,
    isSubmitting: mutation.isPending,
    photos,
    isAnalyzing,
    recognitionStatus,
    addPhotoFromCamera,
    addPhotosFromLibrary,
    removePhoto,
    setPrimaryPhoto,
    analyzePhotos,
    onCancel,
  };
};

export interface UseVehicleFormViewModelResult extends ReturnType<typeof useVehicleFormViewModel> {}
