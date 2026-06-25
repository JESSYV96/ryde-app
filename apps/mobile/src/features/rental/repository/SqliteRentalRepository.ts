import type {
  Photo,
  PhotoPhase,
  Rental,
  RentalCreateInput,
  RentalReturnInput,
  RentalVehicle,
} from '@/features/rental/model/rental.types';
import type { RentalRepositoryInterface } from '@/features/rental/repository/RentalRepository.interface';
import { getDb } from '@/shared/persistence/db';
import { isEndAfterStart, nowIso } from '@/shared/utils/date';
import { generateId } from '@/shared/utils/id';

type RentalRow = {
  id: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone_number: string;
  vehicle_id: string;
  vehicle_snapshot_json: string;
  start_date: string;
  end_date: string;
  mileage_at_start: number;
  fuel_level_at_start: number;
  condition_notes: string;
  quote_pdf_uri: string | null;
  created_at: string;
  accepted_at: string | null;
  signature_uri: string | null;
  returned_at: string | null;
  mileage_at_end: number | null;
  fuel_level_at_end: number | null;
  end_condition_notes: string | null;
  return_report_pdf_uri: string | null;
  customer_license_photo_front_uri: string;
  customer_license_photo_back_uri: string;
};

type PhotoRow = {
  id: string;
  rental_id: string;
  uri: string;
  phase: PhotoPhase;
  taken_at: string;
};

const mapRentalRow = (row: RentalRow, photos: Photo[]): Rental => {
  return {
    id: row.id,
    customer: {
      firstName: row.customer_first_name,
      lastName: row.customer_last_name,
      email: row.customer_email,
      phoneNumber: row.customer_phone_number,
      licensePhotoFrontUri: row.customer_license_photo_front_uri,
      licensePhotoBackUri: row.customer_license_photo_back_uri,
    },
    vehicleId: row.vehicle_id,
    vehicleSnapshot: JSON.parse(row.vehicle_snapshot_json) as RentalVehicle,
    startDate: row.start_date,
    endDate: row.end_date,
    mileageAtStart: row.mileage_at_start,
    fuelLevelAtStart: row.fuel_level_at_start,
    conditionNotes: row.condition_notes,
    photos,
    quotePdfUri: row.quote_pdf_uri,
    createdAt: row.created_at,
    acceptedAt: row.accepted_at,
    signatureUri: row.signature_uri,
    returnedAt: row.returned_at,
    mileageAtEnd: row.mileage_at_end,
    fuelLevelAtEnd: row.fuel_level_at_end,
    endConditionNotes: row.end_condition_notes,
    returnReportPdfUri: row.return_report_pdf_uri,
  };
};

const mapPhotoRow = (row: PhotoRow): Photo => {
  return { id: row.id, rentalId: row.rental_id, uri: row.uri, phase: row.phase, takenAt: row.taken_at };
};

export class SqliteRentalRepository implements RentalRepositoryInterface {
  async getAll(): Promise<Rental[]> {
    const db = await getDb();
    const rentalRows = await db.getAllAsync<RentalRow>('SELECT * FROM rentals ORDER BY created_at DESC');
    const rentals: Rental[] = [];
    for (const row of rentalRows) {
      const photoRows = await db.getAllAsync<PhotoRow>('SELECT * FROM photos WHERE rental_id = ?', row.id);
      rentals.push(mapRentalRow(row, photoRows.map(mapPhotoRow)));
    }
    return rentals;
  }

  async getById(id: string): Promise<Rental | null> {
    const db = await getDb();
    const row = await db.getFirstAsync<RentalRow>('SELECT * FROM rentals WHERE id = ?', id);
    if (!row) {
      return null;
    }
    const photoRows = await db.getAllAsync<PhotoRow>('SELECT * FROM photos WHERE rental_id = ?', id);
    return mapRentalRow(row, photoRows.map(mapPhotoRow));
  }

  async create(input: RentalCreateInput): Promise<Rental> {
    if (!isEndAfterStart(input.startDate, input.endDate)) {
      throw new Error('endDate must be after startDate');
    }

    const db = await getDb();
    const id = generateId();
    const createdAt = nowIso();

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `INSERT INTO rentals (
          id, customer_first_name, customer_last_name,
          customer_email, customer_phone_number, customer_license_photo_front_uri,
          customer_license_photo_back_uri, vehicle_id, vehicle_snapshot_json,
          start_date, end_date, mileage_at_start, fuel_level_at_start, condition_notes,
          quote_pdf_uri, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        id,
        input.customer.firstName,
        input.customer.lastName,
        input.customer.email,
        input.customer.phoneNumber,
        input.customer.licensePhotoFrontUri,
        input.customer.licensePhotoBackUri,
        input.vehicleId,
        JSON.stringify(input.vehicleSnapshot),
        input.startDate,
        input.endDate,
        input.mileageAtStart,
        input.fuelLevelAtStart,
        input.conditionNotes,
        null,
        createdAt
      );

      for (const photo of input.photos) {
        await db.runAsync(
          'INSERT INTO photos (id, rental_id, uri, phase, taken_at) VALUES (?, ?, ?, ?, ?)',
          generateId(),
          id,
          photo.uri,
          photo.phase,
          photo.takenAt
        );
      }
    });

    const created = await this.getById(id);
    if (!created) {
      throw new Error('Failed to read back the rental that was just created');
    }
    return created;
  }

  async update(id: string, patch: Partial<Pick<Rental, 'quotePdfUri' | 'returnReportPdfUri'>>): Promise<Rental> {
    const db = await getDb();
    if (patch.quotePdfUri !== undefined) {
      await db.runAsync('UPDATE rentals SET quote_pdf_uri = ? WHERE id = ?', patch.quotePdfUri, id);
    }
    if (patch.returnReportPdfUri !== undefined) {
      await db.runAsync('UPDATE rentals SET return_report_pdf_uri = ? WHERE id = ?', patch.returnReportPdfUri, id);
    }
    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`Rental ${id} not found`);
    }
    return updated;
  }

  async acceptQuote(id: string, input: { signatureUri: string }): Promise<Rental> {
    const db = await getDb();
    await db.runAsync(
      'UPDATE rentals SET accepted_at = ?, signature_uri = ? WHERE id = ?',
      nowIso(),
      input.signatureUri,
      id
    );
    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`Rental ${id} not found`);
    }
    return updated;
  }

  async recordReturn(id: string, input: RentalReturnInput): Promise<Rental> {
    const db = await getDb();
    const returnedAt = nowIso();

    await db.withTransactionAsync(async () => {
      await db.runAsync(
        `UPDATE rentals SET
          returned_at = ?, mileage_at_end = ?, fuel_level_at_end = ?, end_condition_notes = ?
        WHERE id = ?`,
        returnedAt,
        input.mileageAtEnd,
        input.fuelLevelAtEnd,
        input.endConditionNotes,
        id
      );

      for (const photo of input.photos) {
        await db.runAsync(
          'INSERT INTO photos (id, rental_id, uri, phase, taken_at) VALUES (?, ?, ?, ?, ?)',
          generateId(),
          id,
          photo.uri,
          photo.phase,
          photo.takenAt
        );
      }
    });

    const updated = await this.getById(id);
    if (!updated) {
      throw new Error(`Rental ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    const db = await getDb();
    await db.runAsync('DELETE FROM rentals WHERE id = ?', id);
  }
}

export const rentalRepository: RentalRepositoryInterface = new SqliteRentalRepository();
