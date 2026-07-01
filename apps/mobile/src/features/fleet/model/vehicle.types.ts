export type VehiclePhoto = {
  id: string;
  vehicleId: string;
  uri: string;
  takenAt: string;
  isPrimary: boolean;
};

// The category a Vehicle belongs to. Closed set — drives the vehicle's icon (and,
// later, filtering the fleet by type). Unlike `color`, this is never free text.
export const VEHICLE_TYPES = ['car', 'motorcycle', 'truck'] as const;
export type VehicleType = (typeof VEHICLE_TYPES)[number];

export type Vehicle = {
  id: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  dailyRate: number;
  includedKmPerDay: number;
  extraKmRate: number;
  currentMileage: number;
  photos: VehiclePhoto[];
};

// A photo as supplied when creating or updating a vehicle, before it is
// persisted (no id / vehicleId yet — the repository assigns them). `isPrimary`
// travels with the photo so the primary survives the set rewrite on save.
export type VehiclePhotoInput = {
  uri: string;
  takenAt: string;
  isPrimary: boolean;
};

export type VehicleInput = Omit<Vehicle, 'id' | 'photos'> & {
  photos: VehiclePhotoInput[];
};

// The subset of vehicle attributes a photo analysis can pre-fill. Every field is
// optional: the recognition service only fills what it can read from the photos.
export type RecognizedVehicleDraft = {
  make: string | null;
  model: string | null;
  year: number | null;
  color: string | null;
  licensePlate: string | null;
};
