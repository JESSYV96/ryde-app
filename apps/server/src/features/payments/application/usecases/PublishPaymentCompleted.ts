import { paymentCompletedFromMetadata } from '../../domain/PaymentCompletedEvent';
import type { EventPublisher } from '../ports/EventPublisher';

// API-side use case: on a completed Stripe checkout, publish a domain event onto
// the bus and return. The actual side effects (push, email) are handled by the
// worker. Errors propagate so the webhook can respond non-2xx and let Stripe
// redeliver — no event is lost without persistence.
export class PublishPaymentCompleted {
  constructor(private readonly publisher: EventPublisher) {}

  async execute(metadata: Record<string, string>): Promise<void> {
    const event = paymentCompletedFromMetadata(metadata);
    if (!event.rentalId) {
      // Nothing actionable (e.g. a session created outside this flow).
      return;
    }
    await this.publisher.publishPaymentCompleted(event);
  }
}
