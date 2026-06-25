export type CompanySettings = {
  currency: string;
};

export const SUPPORTED_CURRENCIES = ['CAD', 'USD', 'EUR'] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];
