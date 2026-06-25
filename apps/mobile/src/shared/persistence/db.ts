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
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY NOT NULL,
      rental_id TEXT NOT NULL REFERENCES rentals(id) ON DELETE CASCADE,
      kind TEXT NOT NULL CHECK (kind IN ('quote', 'extra-mileage')),
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending', 'paid')),
      stripe_session_id TEXT NOT NULL,
      payment_url TEXT NOT NULL,
      created_at TEXT NOT NULL,
      paid_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_payments_rental_id ON payments(rental_id);
    CREATE TABLE IF NOT EXISTS company_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      currency TEXT NOT NULL DEFAULT 'CAD'
    );
    INSERT OR IGNORE INTO company_settings (id, currency) VALUES (1, 'CAD');
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
  if (!existingColumnNames.has('total_price')) {
    await db.execAsync('ALTER TABLE rentals ADD COLUMN total_price REAL NOT NULL DEFAULT 0;');
  }
  if (!existingColumnNames.has('billable_half_days')) {
    await db.execAsync('ALTER TABLE rentals ADD COLUMN billable_half_days INTEGER NOT NULL DEFAULT 0;');
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
