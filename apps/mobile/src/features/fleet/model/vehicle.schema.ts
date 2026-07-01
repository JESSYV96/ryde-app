import type { TFunction } from 'i18next';
import { z } from 'zod';

import { VEHICLE_TYPES } from '@/features/fleet/model/vehicle.types';

const currentYear = new Date().getFullYear();

interface NumericFieldOptions {
  int?: boolean;
  positive?: boolean;
  min?: number;
  max?: number;
}

// Numeric fields are typed by the form as strings (so decimals can be typed
// freely). Each validates the raw string, then transforms it to a number and
// applies the numeric constraints — keeping the standard-schema input `string`
// so it can be used directly as a TanStack Form field validator.
const numericString = (message: string, options: NumericFieldOptions = {}) =>
  z
    .string()
    .refine((value) => value.trim() !== '' && Number.isFinite(Number(value)), message)
    .transform((value) => Number(value))
    .refine((value) => (options.int ? Number.isInteger(value) : true), message)
    .refine((value) => (options.positive ? value > 0 : true), message)
    .refine((value) => (options.min === undefined ? true : value >= options.min), message)
    .refine((value) => (options.max === undefined ? true : value <= options.max), message);

export const createVehicleSchema = (t: TFunction<'fleet'>) =>
  z.object({
    type: z.enum(VEHICLE_TYPES),
    make: z.string().min(1, t('validation.makeRequired')),
    model: z.string().min(1, t('validation.modelRequired')),
    year: numericString(t('validation.yearInvalid'), { int: true, min: 1900, max: currentYear + 1 }),
    licensePlate: z.string().min(1, t('validation.licensePlateRequired')),
    color: z.string().min(1, t('validation.colorRequired')),
    dailyRate: numericString(t('validation.dailyRateInvalid'), { positive: true }),
    includedKmPerDay: numericString(t('validation.includedKmInvalid'), { int: true, min: 0 }),
    extraKmRate: numericString(t('validation.extraKmRateInvalid'), { min: 0 }),
    currentMileage: numericString(t('validation.currentMileageInvalid'), { int: true, min: 0 }),
  });
