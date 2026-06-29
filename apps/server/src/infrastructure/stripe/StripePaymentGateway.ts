import Stripe from 'stripe';

import type { PaymentGateway, VerifiedWebhookEvent } from '../../application/ports/PaymentGateway';
import type { CheckoutSession, PaymentStatus } from '../../domain/payment/CheckoutSession';
import type { PaymentLinkRequest } from '../../domain/payment/PaymentLinkRequest';

// Stripe metadata values must be strings; drop any undefined entries.
const buildMetadata = (entries: Record<string, string | undefined>): Record<string, string> =>
  Object.fromEntries(
    Object.entries(entries).filter((entry): entry is [string, string] => entry[1] !== undefined)
  );

// Stripe adapter implementing the PaymentGateway port. Translates between the
// domain and the Stripe SDK — no business rules live here.
export class StripePaymentGateway implements PaymentGateway {
  private readonly stripe: Stripe;

  constructor(
    secretKey: string,
    private readonly webhookSecret: string,
    private readonly baseUrl: string
  ) {
    this.stripe = new Stripe(secretKey);
  }

  async createCheckoutSession(request: PaymentLinkRequest): Promise<CheckoutSession> {
    // rentalId + push intent ride along in metadata so the stateless webhook
    // can notify the company on payment with a deep link to the rental.
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: request.customerEmail,
      success_url: `${this.baseUrl}/payment-success`,
      cancel_url: `${this.baseUrl}/payment-cancelled`,
      metadata: buildMetadata({
        rentalId: request.rentalId,
        expoPushToken: request.push?.expoPushToken,
        pushTitle: request.push?.title,
        pushBody: request.push?.body,
      }),
      line_items: [
        {
          price_data: {
            currency: request.money.normalizedCurrency(),
            unit_amount: request.money.toMinorUnits(),
            product_data: { name: request.description() },
          },
          quantity: 1,
        },
      ],
    });

    if (!session.url) {
      throw new Error('Stripe did not return a checkout URL');
    }
    return { id: session.id, url: session.url };
  }

  async getSessionStatus(sessionId: string): Promise<PaymentStatus> {
    const session = await this.stripe.checkout.sessions.retrieve(sessionId);
    return {
      status: session.status,
      paidAt: session.status === 'complete' ? new Date().toISOString() : null,
    };
  }

  verifyWebhookEvent(rawBody: Buffer, signature: string): VerifiedWebhookEvent {
    const event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
    const completedCheckoutMetadata =
      event.type === 'checkout.session.completed'
        ? (event.data.object as Stripe.Checkout.Session).metadata ?? {}
        : null;
    return { type: event.type, completedCheckoutMetadata };
  }
}
