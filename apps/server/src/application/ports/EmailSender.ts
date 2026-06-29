import type { Money } from '../../domain/payment/Money';

export interface PaymentLinkEmail {
  to: string;
  customerName: string;
  description: string;
  money: Money;
  paymentUrl: string;
}

// Output port for transactional email. Implemented by infrastructure (Resend).
export interface EmailSender {
  sendPaymentLink(email: PaymentLinkEmail): Promise<void>;
}
