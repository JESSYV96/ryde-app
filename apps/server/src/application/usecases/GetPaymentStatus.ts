import type { PaymentStatus } from '../../domain/payment/CheckoutSession';
import type { PaymentGateway } from '../ports/PaymentGateway';

// Proxy a checkout session's status — the signal the mobile app polls to learn
// whether a rental has been paid.
export class GetPaymentStatus {
  constructor(private readonly payments: PaymentGateway) {}

  execute(sessionId: string): Promise<PaymentStatus> {
    return this.payments.getSessionStatus(sessionId);
  }
}
