import type { TFunction } from 'i18next';
import { z } from 'zod';

import { isEndAfterStart } from '@/shared/utils/date';

export const createRentalCustomerSchema = (t: TFunction<'rental'>) =>
  z.object({
    firstName: z.string().min(1, t('validation.firstNameRequired')),
    lastName: z.string().min(1, t('validation.lastNameRequired')),
    email: z.email(t('validation.emailInvalid')),
    phoneNumber: z.string().min(1, t('validation.phoneRequired')),
    licensePhotoFrontUri: z.string().min(1, t('validation.licensePhotoFrontRequired')),
    licensePhotoBackUri: z.string().min(1, t('validation.licensePhotoBackRequired')),
  });

export const createVehicleSelectionSchema = (t: TFunction<'rental'>) => {
  const vehicleSelectionObjectSchema = z.object({
    vehicleId: z.string().min(1, t('validation.vehicleRequired')),
    startDate: z.string().min(1, t('validation.startDateRequired')),
    endDate: z.string().min(1, t('validation.endDateRequired')),
  });

  return vehicleSelectionObjectSchema.refine(
    (vehicle) => isEndAfterStart(vehicle.startDate, vehicle.endDate),
    { message: t('validation.endDateAfterStartDate'), path: ['endDate'] }
  );
};

export type VehicleSelectionInput = z.infer<ReturnType<typeof createVehicleSelectionSchema>>;

export const createInspectionSchema = (t: TFunction<'rental'>) =>
  z.object({
    mileageAtStart: z.number().int().nonnegative(t('validation.mileageNonNegative')),
    fuelLevelAtStart: z.number().int().min(0).max(100),
    conditionNotes: z.string(),
  });

export type InspectionInput = z.infer<ReturnType<typeof createInspectionSchema>>;

export const createReturnSchema = (t: TFunction<'rental'>) =>
  z.object({
    mileageAtEnd: z.number().int().nonnegative(t('validation.mileageNonNegative')),
    fuelLevelAtEnd: z.number().int().min(0).max(100),
    endConditionNotes: z.string(),
  });

export type ReturnInput = z.infer<ReturnType<typeof createReturnSchema>>;
