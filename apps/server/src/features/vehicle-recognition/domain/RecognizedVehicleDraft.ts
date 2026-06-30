// What a vehicle photo analysis can yield. Every field is optional: the analyzer
// fills in only what it can confidently read from the photos, and the mobile app
// pre-fills its form with whatever is present, leaving the rest for the user to
// complete. A field is `null` when it could not be determined.
export interface RecognizedVehicleDraft {
  make: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
  licensePlate: string | null;
}

// An empty draft — nothing could be recognized. Useful as a safe fallback.
export const emptyRecognizedVehicleDraft = (): RecognizedVehicleDraft => ({
  make: null,
  model: null,
  year: null,
  color: null,
  licensePlate: null,
});
