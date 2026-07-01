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
      email_sent INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      paid_at TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_payments_rental_id ON payments(rental_id);
    CREATE TABLE IF NOT EXISTS company_settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      currency TEXT NOT NULL DEFAULT 'CAD'
    );
    INSERT OR IGNORE INTO company_settings (id, currency) VALUES (1, 'CAD');
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY NOT NULL,
      type TEXT NOT NULL DEFAULT 'car' CHECK (type IN ('car', 'motorcycle', 'truck')),
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      license_plate TEXT NOT NULL,
      color TEXT NOT NULL,
      daily_rate REAL NOT NULL,
      included_km_per_day INTEGER NOT NULL,
      extra_km_rate REAL NOT NULL,
      current_mileage INTEGER NOT NULL DEFAULT 0
    );
    INSERT OR IGNORE INTO vehicles
      (id, type, make, model, year, license_plate, color, daily_rate, included_km_per_day, extra_km_rate, current_mileage)
    VALUES
      ('veh-1', 'car', 'Toyota', 'Corolla', 2022, 'ABC-123', 'Argent', 55, 200, 0.3, 42000),
      ('veh-2', 'car', 'Honda', 'CR-V', 2023, 'XYZ-789', 'Noir', 75, 200, 0.35, 18500),
      ('veh-3', 'motorcycle', 'Yamaha', 'MT-07', 2021, 'JKL-456', 'Bleu', 45, 150, 0.25, 12400),
      ('veh-4', 'truck', 'Ford', 'Transit', 2023, 'DEF-321', 'Blanc', 95, 150, 0.4, 30200),
      ('veh-5', 'car', 'Nissan', 'Rogue', 2022, 'GHI-654', 'Gris', 78, 200, 0.35, 33700),
      ('veh-6', 'car', 'Kia', 'Forte', 2020, 'MNO-987', 'Rouge', 48, 200, 0.3, 61000);
    CREATE TABLE IF NOT EXISTS vehicle_photos (
      id TEXT PRIMARY KEY NOT NULL,
      vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
      uri TEXT NOT NULL,
      taken_at TEXT NOT NULL,
      is_primary INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_vehicle_photos_vehicle_id ON vehicle_photos(vehicle_id);
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

  const paymentsColumns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(payments)');
  const existingPaymentColumnNames = new Set(paymentsColumns.map((column) => column.name));
  if (!existingPaymentColumnNames.has('email_sent')) {
    await db.execAsync('ALTER TABLE payments ADD COLUMN email_sent INTEGER NOT NULL DEFAULT 1;');
  }

  const vehiclesColumns = await db.getAllAsync<{ name: string }>('PRAGMA table_info(vehicles)');
  const existingVehicleColumnNames = new Set(vehiclesColumns.map((column) => column.name));
  if (!existingVehicleColumnNames.has('type')) {
    // Existing vehicles predate Vehicle Type; they are all cars. A CHECK can't be
    // added via ALTER, but the type picker constrains new writes.
    await db.execAsync("ALTER TABLE vehicles ADD COLUMN type TEXT NOT NULL DEFAULT 'car';");
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
