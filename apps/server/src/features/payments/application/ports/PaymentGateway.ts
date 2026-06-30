import type { CheckoutSession, PaymentStatus } from '../../domain/CheckoutSession';
import type { PaymentLinkRequest } from '../../domain/PaymentLinkRequest';

// A verified provider webhook, normalized so the application never touches the
// provider SDK's event types. `completedCheckoutMetadata` is the metadata of a
// completed checkout session (present only for that event), where the push
// intent set at link-creation time travels.
export interface VerifiedWebhookEvent {
  type: string;
  completedCheckoutMetadata: Record<string, string> | null;
}

// Output port: everything the application needs from a payment provider,
// expressed in domain terms. Implemented by infrastructure (Stripe).
export interface PaymentGateway {
  createCheckoutSession(request: PaymentLinkRequest): Promise<CheckoutSession>;
  getSessionStatus(sessionId: string): Promise<PaymentStatus>;
  verifyWebhookEvent(rawBody: Buffer, signature: string): VerifiedWebhookEvent;
}
