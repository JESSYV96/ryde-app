import { File } from 'expo-file-system';

import type { RecognizedVehicleDraft } from '@/features/fleet/model/vehicle.types';
import { serverUrl } from '@/shared/api/serverUrl';

interface VehicleImagePayload {
  base64: string;
  mediaType: string;
}

// Reads each stored photo as base64 and asks the server to recognize the vehicle
// from them. Returns a best-effort draft used to pre-fill the form.
export const recognizeVehicleFromPhotos = async (uris: string[]): Promise<RecognizedVehicleDraft> => {
  const images: VehicleImagePayload[] = [];
  for (const uri of uris) {
    const base64 = await new File(uri).base64();
    images.push({ base64, mediaType: 'image/jpeg' });
  }

  const response = await fetch(`${serverUrl}/vehicle-recognition`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ images }),
  });
  if (!response.ok) {
    throw new Error(`Failed to recognize vehicle from photos: ${response.status}`);
  }
  return response.json();
};
