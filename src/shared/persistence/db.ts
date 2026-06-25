import { openDatabaseAsync, type SQLiteDatabase } from 'expo-sqlite';

const DATABASE_NAME = 'car-rental.db';

let dbPromise: Promise<SQLiteDatabase> | null = null;

const runMigrations = async (db: SQLiteDatabase): Promise<void> => {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS rentals (
      id TEXT PRIMARY KEY NOT NULL,
      customer_first_name TEXT NOT NULL,
      customer_last_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      customer_phone_number TEXT NOT NULL,
      vehicle_id TEXT NOT NULL,
      vehicle_snapshot_json TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      mileage_at_start INTEGER NOT NULL,
      fuel_level_at_start INTEGER NOT NULL,
      condition_notes TEXT NOT NULL DEFAULT '',
      quote_pdf_uri TEXT,
      created_at TEXT NOT NULL,
      returned_at TEXT,
      mileage_at_end INTEGER,
      fuel_level_at_end INTEGER,
      end_condition_notes TEXT,
      return_report_pdf_uri TEXT,
      customer_license_photo_front_uri TEXT NOT NULL DEFAULT '',
      customer_license_photo_back_uri TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY NOT NULL,
      rental_id TEXT NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
      uri TEXT NOT NULL,
      phase TEXT NOT NULL CHECK (phase IN ('before', 'after')),
      taken_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_photos_rental_id ON photos(rental_id);
  `);

  const rentalsColumns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(rentals)');
  const existingColumnNames = new Set(rentalsColumns.map((column) => column.name));
  if (!existingColumnNames.has('customer_license_photo_front_uri')) {
    await db.execAsync("ALTER TABLE rentals ADD COLUMN customer_license_photo_front_uri TEXT NOT NULL DEFAULT '';");
  }
  if (!existingColumnNames.has('customer_license_photo_back_uri')) {
    await db.execAsync("ALTER TABLE rentals ADD COLUMN customer_license_photo_back_uri TEXT NOT NULL DEFAULT '';");
  }
  if (existingColumnNames.has('customer_driver_license_number')) {
    await db.execAsync('ALTER TABLE rentals DROP COLUMN customer_driver_license_number;');
  }
  if (!existingColumnNames.has('accepted_at')) {
    await db.execAsync('ALTER TABLE rentals ADD COLUMN accepted_at TEXT;');
  }
  if (!existingColumnNames.has('signature_uri')) {
    await db.execAsync('ALTER TABLE rentals ADD COLUMN signature_uri TEXT;');
  }
};

const initializeDb = async (): Promise<SQLiteDatabase> => {
  const db = await openDatabaseAsync(DATABASE_NAME);
  await runMigrations(db);
  return db;
};

export const getDb = (): Promise<SQLiteDatabase> => {
  if (!dbPromise) {
    dbPromise = initializeDb();
  }
  return dbPromise;
};
