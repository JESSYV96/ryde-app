import type { RecognizedVehicleDraft } from '../../domain/RecognizedVehicleDraft';
import type { VehicleImage, VehicleImageAnalyzer } from '../ports/VehicleImageAnalyzer';

// Analyze one or more vehicle photos and return a pre-fill draft.
//
// Stateless: the photos are only inspected, never stored here (they live in the
// mobile app's local storage). The use case validates that at least one photo
// was provided and delegates recognition to the analyzer port.
export class AnalyzeVehiclePhotos {
  constructor(private readonly analyzer: VehicleImageAnalyzer) {}

  async execute(images: VehicleImage[]): Promise<RecognizedVehicleDraft> {
    if (images.length === 0) {
      throw new Error('At least one photo is required to analyze a vehicle');
    }

    return this.analyzer.analyze(images);
  }
}
