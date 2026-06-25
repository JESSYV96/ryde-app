import type { CompanySettings } from '@/features/settings/model/companySettings.types';
import type { CompanySettingsRepositoryInterface } from '@/features/settings/repository/CompanySettingsRepository.interface';
import { getDb } from '@/shared/persistence/db';

type CompanySettingsRow = {
  id: number;
  currency: string;
};

const mapRow = (row: CompanySettingsRow): CompanySettings => ({ currency: row.currency });

export class SqliteCompanySettingsRepository implements CompanySettingsRepositoryInterface {
  async getSettings(): Promise<CompanySettings> {
    const db = await getDb();
    const row = await db.getFirstAsync<CompanySettingsRow>('SELECT * FROM company_settings WHERE id = 1');
    if (!row) {
      throw new Error('Company settings row is missing');
    }
    return mapRow(row);
  }

  async updateCurrency(currency: string): Promise<CompanySettings> {
    const db = await getDb();
    await db.runAsync('UPDATE company_settings SET currency = ? WHERE id = 1', currency);
    return this.getSettings();
  }
}

export const companySettingsRepository: CompanySettingsRepositoryInterface = new SqliteCompanySettingsRepository();
