import type { TFunction } from 'i18next';

import {
  createInspectionSchema,
  createRentalCustomerSchema,
  createReturnSchema,
  createVehicleSelectionSchema,
} from './rental.schema';

const t = ((key: string) => key) as TFunction<'rental'>;

describe('createRentalCustomerSchema', () => {
  const validCustomer = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phoneNumber: '555-0100',
    licensePhotoFrontUri: 'file:///license-front.jpg',
    licensePhotoBackUri: 'file:///license-back.jpg',
  };

  it('passes validation for a fully valid customer payload', () => {
    // arrange
    const schema = createRentalCustomerSchema(t);

    // act
    const result = schema.safeParse(validCustomer);

    // assert
    expect(result.success).toBe(true);
  });

  it('fails when firstName is empty', () => {
    // arrange
    const schema = createRentalCustomerSchema(t);
    const payload = { ...validCustomer, firstName: '' };

    // act
    const result = schema.safeParse(payload);

    // assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('validation.firstNameRequired');
  });

  it('fails when lastName is empty', () => {
    // arrange
    const schema = createRentalCustomerSchema(t);
    const payload = { ...validCustomer, lastName: '' };

    // act
    const result = schema.safeParse(payload);

    // assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('validation.lastNameRequired');
  });

  it('fails when email is not a valid email format', () => {
    // arrange
    const schema = createRentalCustomerSchema(t);
    const payload = { ...validCustomer, email: 'not-an-email' };

    // act
    const result = schema.safeParse(payload);

    // assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('validation.emailInvalid');
  });

  it('fails when phoneNumber is empty', () => {
    // arrange
    const schema = createRentalCustomerSchema(t);
    const payload = { ...validCustomer, phoneNumber: '' };

    // act
    const result = schema.safeParse(payload);

    // assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('validation.phoneRequired');
  });

  it('fails when licensePhotoFrontUri is empty', () => {
    // arrange
    const schema = createRentalCustomerSchema(t);
    const payload = { ...validCustomer, licensePhotoFrontUri: '' };

    // act
    const result = schema.safeParse(payload);

    // assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('validation.licensePhotoFrontRequired');
  });

  it('fails when licensePhotoBackUri is empty', () => {
    // arrange
    const schema = createRentalCustomerSchema(t);
    const payload = { ...validCustomer, licensePhotoBackUri: '' };

    // act
    const result = schema.safeParse(payload);

    // assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('validation.licensePhotoBackRequired');
  });
});

describe('createVehicleSelectionSchema', () => {
  const validVehicleSelection = {
    vehicleId: 'vehicle-1',
    startDate: '2026-07-01T00:00:00.000Z',
    endDate: '2026-07-05T00:00:00.000Z',
  };

  it('passes validation when endDate is after startDate', () => {
    // arrange
    const schema = createVehicleSelectionSchema(t);

    // act
    const result = schema.safeParse(validVehicleSelection);

    // assert
    expect(result.success).toBe(true);
  });

  it('fails when vehicleId is empty', () => {
    // arrange
    const schema = createVehicleSelectionSchema(t);
    const payload = { ...validVehicleSelection, vehicleId: '' };

    // act
    const result = schema.safeParse(payload);

    // assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('validation.vehicleRequired');
  });

  it('fails when startDate is empty', () => {
    // arrange
    const schema = createVehicleSelectionSchema(t);
    const payload = { ...validVehicleSelection, startDate: '' };

    // act
    const result = schema.safeParse(payload);

    // assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('validation.startDateRequired');
  });

  it('fails when endDate is empty', () => {
    // arrange
    const schema = createVehicleSelectionSchema(t);
    const payload = { ...validVehicleSelection, endDate: '' };

    // act
    const result = schema.safeParse(payload);

    // assert
    expect(result.success).toBe(false);
    // endDate being empty fails both the min-length check and the
    // endDate-after-startDate refinement; assert the required-field issue is present.
    expect(result.error?.issues.some((issue) => issue.message === 'validation.endDateRequired')).toBe(
      true
    );
  });

  it('fails when endDate is before startDate', () => {
    // arrange
    const schema = createVehicleSelectionSchema(t);
    const payload = {
      ...validVehicleSelection,
      startDate: '2026-07-05T00:00:00.000Z',
      endDate: '2026-07-01T00:00:00.000Z',
    };

    // act
    const result = schema.safeParse(payload);

    // assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('validation.endDateAfterStartDate');
    expect(result.error?.issues[0]?.path).toEqual(['endDate']);
  });

  it('fails when endDate equals startDate', () => {
    // arrange
    const schema = createVehicleSelectionSchema(t);
    const payload = {
      ...validVehicleSelection,
      startDate: '2026-07-01T00:00:00.000Z',
      endDate: '2026-07-01T00:00:00.000Z',
    };

    // act
    const result = schema.safeParse(payload);

    // assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('validation.endDateAfterStartDate');
  });
});

describe('createInspectionSchema', () => {
  const validInspection = {
    mileageAtStart: 12000,
    fuelLevelAtStart: 50,
    conditionNotes: 'No visible damage.',
  };

  it('passes validation for a fully valid inspection payload', () => {
    // arrange
    const schema = createInspectionSchema(t);

    // act
    const result = schema.safeParse(validInspection);

    // assert
    expect(result.success).toBe(true);
  });

  it('allows conditionNotes to be an empty string', () => {
    // arrange
    const schema = createInspectionSchema(t);
    const payload = { ...validInspection, conditionNotes: '' };

    // act
    const result = schema.safeParse(payload);

    // assert
    expect(result.success).toBe(true);
  });

  it('fails when mileageAtStart is negative', () => {
    // arrange
    const schema = createInspectionSchema(t);
    const payload = { ...validInspection, mileageAtStart: -1 };

    // act
    const result = schema.safeParse(payload);

    // assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('validation.mileageNonNegative');
  });

  it('fails when mileageAtStart is not an integer', () => {
    // arrange
    const schema = createInspectionSchema(t);
    const payload = { ...validInspection, mileageAtStart: 12.5 };

    // act
    const result = schema.safeParse(payload);

    // assert
    expect(result.success).toBe(false);
  });

  it('accepts a mileageAtStart of exactly 0', () => {
    // arrange
    const schema = createInspectionSchema(t);
    const payload = { ...validInspection, mileageAtStart: 0 };

    // act
    const result = schema.safeParse(payload);

    // assert
    expect(result.success).toBe(true);
  });

  it('fails when fuelLevelAtStart is below 0', () => {
    // arrange
    const schema = createInspectionSchema(t);
    const payload = { ...validInspection, fuelLevelAtStart: -1 };

    // act
    const result = schema.safeParse(payload);

    // assert
    expect(result.success).toBe(false);
  });

  it('fails when fuelLevelAtStart is above 100', () => {
    // arrange
    const schema = createInspectionSchema(t);
    const payload = { ...validInspection, fuelLevelAtStart: 101 };

    // act
    const result = schema.safeParse(payload);

    // assert
    expect(result.success).toBe(false);
  });

  it('accepts fuelLevelAtStart boundary values of 0 and 100', () => {
    // arrange
    const schema = createInspectionSchema(t);
    const lowBoundaryPayload = { ...validInspection, fuelLevelAtStart: 0 };
    const highBoundaryPayload = { ...validInspection, fuelLevelAtStart: 100 };

    // act
    const lowResult = schema.safeParse(lowBoundaryPayload);
    const highResult = schema.safeParse(highBoundaryPayload);

    // assert
    expect(lowResult.success).toBe(true);
    expect(highResult.success).toBe(true);
  });
});

describe('createReturnSchema', () => {
  const validReturn = {
    mileageAtEnd: 12500,
    fuelLevelAtEnd: 75,
    endConditionNotes: 'Returned with a minor scratch on the rear bumper.',
  };

  it('passes validation for a fully valid return payload', () => {
    // arrange
    const schema = createReturnSchema(t);

    // act
    const result = schema.safeParse(validReturn);

    // assert
    expect(result.success).toBe(true);
  });

  it('fails when mileageAtEnd is negative', () => {
    // arrange
    const schema = createReturnSchema(t);
    const payload = { ...validReturn, mileageAtEnd: -10 };

    // act
    const result = schema.safeParse(payload);

    // assert
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toBe('validation.mileageNonNegative');
  });

  it('fails when fuelLevelAtEnd is below 0', () => {
    // arrange
    const schema = createReturnSchema(t);
    const payload = { ...validReturn, fuelLevelAtEnd: -5 };

    // act
    const result = schema.safeParse(payload);

    // assert
    expect(result.success).toBe(false);
  });

  it('fails when fuelLevelAtEnd is above 100', () => {
    // arrange
    const schema = createReturnSchema(t);
    const payload = { ...validReturn, fuelLevelAtEnd: 150 };

    // act
    const result = schema.safeParse(payload);

    // assert
    expect(result.success).toBe(false);
  });

  it('accepts fuelLevelAtEnd boundary values of 0 and 100', () => {
    // arrange
    const schema = createReturnSchema(t);
    const lowBoundaryPayload = { ...validReturn, fuelLevelAtEnd: 0 };
    const highBoundaryPayload = { ...validReturn, fuelLevelAtEnd: 100 };

    // act
    const lowResult = schema.safeParse(lowBoundaryPayload);
    const highResult = schema.safeParse(highBoundaryPayload);

    // assert
    expect(lowResult.success).toBe(true);
    expect(highResult.success).toBe(true);
  });

  it('allows endConditionNotes to be an empty string', () => {
    // arrange
    const schema = createReturnSchema(t);
    const payload = { ...validReturn, endConditionNotes: '' };

    // act
    const result = schema.safeParse(payload);

    // assert
    expect(result.success).toBe(true);
  });
});
