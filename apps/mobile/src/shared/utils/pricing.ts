import dayjs from 'dayjs';

const HALF_DAY_MINUTES = 12 * 60;

const roundToCents = (amount: number): number => Math.round(amount * 100) / 100;

export const getBillableHalfDays = (startIso: string, endIso: string): number => {
  const totalMinutes = dayjs(endIso).diff(dayjs(startIso), 'minute');
  return Math.max(1, Math.ceil(totalMinutes / HALF_DAY_MINUTES));
};

export interface QuotePrice {
  totalPrice: number;
  includedKm: number;
}

export const computeQuotePrice = (
  vehicle: { dailyRate: number; includedKmPerDay: number },
  billableHalfDays: number
): QuotePrice => ({
  totalPrice: roundToCents((vehicle.dailyRate / 2) * billableHalfDays),
  includedKm: (vehicle.includedKmPerDay / 2) * billableHalfDays,
});

export const computeExtraKmCharge = (actualKm: number, includedKm: number, extraKmRate: number): number =>
  roundToCents(Math.max(0, actualKm - includedKm) * extraKmRate);

export const formatPrice = (amount: number, currency: string): string =>
  new Intl.NumberFormat('en-CA', { style: 'currency', currency }).format(amount);
