import type { Vehicle, VehicleInput, VehiclePhoto, VehicleType } from '@/features/fleet/model/vehicle.types';
import type { FleetRepositoryInterface } from '@/features/fleet/repository/FleetRepository';
import { getDb } from '@/shared/persistence/db';
import { generateId } from '@/shared/utils/id';

type VehicleRow = {
  id: string;
  type: VehicleType;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  color: string;
  daily_rate: number;
  included_km_per_day: number;
  extra_km_rate: number;
  current_mileage: number;
};

type VehiclePhotoRow = {
  id: string;
  vehicle_id: string;
  uri: string;
  taken_at: string;
  is_primary: number;
};

const mapPhotoRow = (row: VehiclePhotoRow): VehiclePhoto => ({
  id: row.id,
  vehicleId: row.vehicle_id,
  uri: row.uri,
  takenAt: row.taken_at,
  isPrimary: row.is_primary === 1,
});

const mapRow = (row: VehicleRow, photos: VehiclePhoto[]): Vehicle => ({
  id: row.id,
  type: row.type,
  make: row.make,
  model: row.model,
  year: row.year,
  licensePlate: row.license_plate,
  color: row.color,
  dailyRate: row.daily_rate,
  includedKmPerDay: row.included_km_per_day,
  extraKmRate: row.extra_km_rate,
  currentMileage: row.current_mileage,
  photos,
});

export class SqliteFleetRepository implements FleetRepositoryInterface {
  async getAll(): Promise<Vehicle[]> {
    const db = await getDb();
    const rows = await db.getAllAsync<VehicleRow>('SELECT * FROM vehicles ORDER BY make, model');
    const photoRows = await db.getAllAsync<VehiclePhotoRow>(
      'SELECT * FROM vehicle_photos ORDER BY is_primary DESC, taken_at'
    );

    const photosByVehicle = new Map<string, VehiclePhoto[]>();
    for (const photoRow of photoRows) {
      const photos = photosByVehicle.get(photoRow.vehicle_id) ?? [];
      photos.push(mapPhotoRow(photoRow));
      photosByVehicle.set(photoRow.vehicle_id, photos);
    }

    return rows.map((row) => mapRow(row, photosByVehicle.get(row.id) ?? []));
  }

  async getById(id: string): Promise<Vehicle | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<VehicleRow>('SELECT * FROM vehicles WHERE id = ?', id);
    if (!row) {
      return null;
    }
    const photoRows = await db.getAllAsync<VehiclePhotoRow>(
      'SELECT * FROM vehicle_photos WHERE vehicle_id = ? ORDER BY is_primary DESC, taken_at',
      id
    );
    return mapRow(row, photoRows.map(mapPhotoRow));
  }

  async create(input: VehicleInput): Promise<Vehicle> {
    const db = await getDb();
    const id = generateId();

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO vehicles
          (id, type, make, model, year, license_plate, color, daily_rate, included_km_per_day, extra_km_rate, current_mileage)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        input.type,
        input.make,
        input.model,
        input.year,
        input.licensePlate,
        input.color,
        input.dailyRate,
        input.includedKmPerDay,
        input.extraKmRate,
        input.currentMileage
      );
      await this.insertPhotos(id, input);
    });

    const created = await this.getById(id);
    if (!created) {
      throw new Error('Failed to read back the created vehicle');
    }
    return created;
  }

  async update(id: string, input: VehicleInput): Promise<Vehicle> {
    const db = await getDb();

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `UPDATE vehicles SET
          type = ?, make = ?, model = ?, year = ?, license_plate = ?, color = ?,
          daily_rate = ?, included_km_per_day = ?, extra_km_rate = ?, current_mileage = ?
         WHERE id = ?`,
        input.type,
        input.make,
        input.model,
        input.year,
        input.licensePlate,
        input.color,
        input.dailyRate,
        input.includedKmPerDay,
        input.extraKmRate,
        input.currentMileage,
        id
      );
      // Photos are managed as a whole set: replace the stored rows with the
      // current selection so additions and removals both persist.
      await db.runAsync('DELETE FROM vehicle_photos WHERE vehicle_id = ?', id);
      await this.insertPhotos(id, input);
    });

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error('Failed to read back the updated vehicle');
    }
    return updated;
  }

  async delete(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM vehicles WHERE id = ?', id);
  }

  private async insertPhotos(vehicleId: string, input: VehicleInput): Promise<void> {
    const db = await getDb();
    for (const photo of input.photos) {
      await db.runAsync(
        'INSERT INTO vehicle_photos (id, vehicle_id, uri, taken_at, is_primary) VALUES (?, ?, ?, ?, ?)',
        generateId(),
        vehicleId,
        photo.uri,
        photo.takenAt,
        photo.isPrimary ? 1 : 0
      );
    }
  }
}

export const fleetRepository: FleetRepositoryInterface = new SqliteFleetRepository();
