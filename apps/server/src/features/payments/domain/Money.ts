// Value object for a monetary amount. Amounts enter the system in major
// currency units (e.g. dollars, not cents) — this type owns the conversion
// rules so the "× 100 only at the Stripe boundary" convention lives in one
// place instead of being duplicated across adapters.
export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: string
  ) {}

  static of(amount: number, currency: string): Money {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new Error(`Invalid monetary amount: ${amount}`);
    }
    if (!currency || currency.trim().length === 0) {
      throw new Error('Currency is required');
    }
    return new Money(amount, currency);
  }

  // Smallest currency unit (cents). Only ever applied at the payment provider
  // boundary.
  toMinorUnits(): number {
    return Math.round(this.amount * 100);
  }

  // Stripe expects an ISO currency code in lower case for `price_data`.
  normalizedCurrency(): string {
    return this.currency.toLowerCase();
  }

  format(locale = 'en-CA'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
    }).format(this.amount);
  }
}
