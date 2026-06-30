import type { Money } from '../../domain/Money';

export interface PaymentLinkEmail {
  to: string;
  customerName: string;
  description: string;
  money: Money;
  paymentUrl: string;
}

export interface PaymentConfirmationEmail {
  to: string;
  customerName: string;
  rentalId: string;
  // Amount charged, when known (carried through the payment event).
  money?: Money;
}

// Output port for transactional email. Implemented by infrastructure (Resend).
export interface EmailSender {
  sendPaymentLink(email: PaymentLinkEmail): Promise<void>;
  sendPaymentConfirmation(email: PaymentConfirmationEmail): Promise<void>;
}
