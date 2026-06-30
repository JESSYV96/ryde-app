// The kinds of charge a payment link can represent. The human-readable
// description is a domain rule, kept out of the HTTP layer.
export type PaymentKind = 'quote' | 'extra-mileage';

export const descriptionFor = (kind: PaymentKind, vehicleLabel: string): string =>
  kind === 'quote'
    ? `Rental quote — ${vehicleLabel}`
    : `Extra mileage charge — ${vehicleLabel}`;
