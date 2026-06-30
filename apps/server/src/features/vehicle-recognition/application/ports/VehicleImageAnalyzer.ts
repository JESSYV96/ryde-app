import type { RecognizedVehicleDraft } from '../../domain/RecognizedVehicleDraft';

// A single photo to analyze, carried as base64 plus its MIME type.
export interface VehicleImage {
  base64: string;
  mediaType: string;
}

// Output port for vehicle photo recognition. Implemented by infrastructure
// (Claude vision). Given one or more photos of a vehicle, returns a best-effort
// draft of the vehicle's attributes.
export interface VehicleImageAnalyzer {
  analyze(images: VehicleImage[]): Promise<RecognizedVehicleDraft>;
}
