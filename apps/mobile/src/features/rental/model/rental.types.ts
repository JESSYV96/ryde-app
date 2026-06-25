export const PhotoPhase = {
  Before: 'before',
  After: 'after',
} as const;

export type PhotoPhase = (typeof PhotoPhase)[keyof typeof PhotoPhase];

export type DriverLicenseSide = 'front' | 'back';

export type Photo = {
  id: string;
  rentalId: string;
  uri: string;
  phase: PhotoPhase;
  takenAt: string;
};

/**
 * The customer's info as it was at booking time, embedded on the `Rental`.
 * No `id`/`createdAt` — there is no separate customer directory yet
 * (see CLAUDE.md "Persistence & the future-backend seam"), so this is just
 * the fields the operator typed in step 1, not a reference to an entity.
 */
export type RentalCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  licensePhotoFrontUri: string;
  licensePhotoBackUri: string;
};

/**
 * The vehicle's descriptive info as it was at booking time, embedded on the
 * `Rental`. No `id` — `Rental.vehicleId` is already the reference back to
 * the fleet entry; this is just what that vehicle looked like when booked,
 * so a later edit/retirement in the fleet doesn't change past quotes.
 */
export type RentalVehicle = {
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  color: string;
  dailyRate: number;
  includedKmPerDay: number;
  extraKmRate: number;
};

/**
 * A photo as submitted when creating a `Rental` — before it has an `id` or
 * a `rentalId` of its own, since the rental it belongs to doesn't exist yet.
 * Only `before` photos are captured during creation; `after` photos are
 * submitted later via `RentalReturnPhotoInput` at checkout.
 */
export type RentalPhotoInput = {
  uri: string;
  phase: typeof PhotoPhase.Before;
  takenAt: string;
};

/**
 * An after-photo submitted at checkout, before it has an `id`/`rentalId`
 * of its own (mirrors `RentalPhotoInput` for the return side).
 */
export type RentalReturnPhotoInput = {
  uri: string;
  phase: typeof PhotoPhase.After;
  takenAt: string;
};

export const PaymentKind = {
  Quote: 'quote',
  ExtraMileage: 'extra-mileage',
} as const;

export type PaymentKind = (typeof PaymentKind)[keyof typeof PaymentKind];

export const PaymentStatus = {
  Pending: 'pending',
  Paid: 'paid',
} as const;

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

/**
 * A Stripe payment link sent to the customer for this rental — either the
 * upfront quote price (`kind: 'quote'`, sent at quote acceptance) or an
 * extra-mileage surcharge discovered at return (`kind: 'extra-mileage'`).
 * A `Payment` doesn't make sense outside of a `Rental`, same as `Photo`.
 */
export type Payment = {
  id: string;
  rentalId: string;
  kind: PaymentKind;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripeSessionId: string;
  paymentUrl: string;
  createdAt: string;
  paidAt: string | null;
};

export type PaymentInput = {
  kind: PaymentKind;
  amount: number;
  currency: string;
  status: PaymentStatus;
  stripeSessionId: string;
  paymentUrl: string;
};

export type Rental = {
  id: string;
  customer: RentalCustomer;
  vehicleId: string;
  vehicleSnapshot: RentalVehicle;
  startDate: string;
  endDate: string;
  mileageAtStart: number;
  fuelLevelAtStart: number;
  conditionNotes: string;
  photos: Photo[];
  totalPrice: number;
  billableHalfDays: number;
  payments: Payment[];
  quotePdfUri: string | null;
  createdAt: string;
  acceptedAt: string | null;
  signatureUri: string | null;
  returnedAt: string | null;
  mileageAtEnd: number | null;
  fuelLevelAtEnd: number | null;
  endConditionNotes: string | null;
  returnReportPdfUri: string | null;
};

export type RentalCreateInput = {
  customer: RentalCustomer;
  vehicleId: string;
  vehicleSnapshot: RentalVehicle;
  startDate: string;
  endDate: string;
  mileageAtStart: number;
  fuelLevelAtStart: number;
  conditionNotes: string;
  photos: RentalPhotoInput[];
  totalPrice: number;
  billableHalfDays: number;
};

/**
 * What checkout submits to record a car's return. `returnedAt` is not
 * included — it's assigned by the repository (`nowIso()`), same as
 * `Rental.createdAt` is on creation, not passed in by the caller.
 */
export type RentalReturnInput = {
  mileageAtEnd: number;
  fuelLevelAtEnd: number;
  endConditionNotes: string;
  photos: RentalReturnPhotoInput[];
};

export const RentalStatus = {
  PendingAcceptance: 'pending-acceptance',
  InProgress: 'in-progress',
  Returned: 'returned',
} as const;

export type RentalStatus = (typeof RentalStatus)[keyof typeof RentalStatus];

export const getRentalStatus = (rental: Rental): RentalStatus => {
  if (rental.returnedAt !== null) return RentalStatus.Returned;
  return rental.acceptedAt === null ? RentalStatus.PendingAcceptance : RentalStatus.InProgress;
};
