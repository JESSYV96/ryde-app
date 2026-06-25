import type { CompanySettings } from '@/features/settings/model/companySettings.types';

export interface CompanySettingsRepositoryInterface {
  getSettings(): Promise<CompanySettings>;
  updateCurrency(currency: string): Promise<CompanySettings>;
}

export const companySettingsQueryKeys = {
  detail: () => ['company-settings'] as const,
};
