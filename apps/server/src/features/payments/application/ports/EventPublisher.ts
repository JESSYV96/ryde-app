import type { PaymentCompletedEvent } from '../../domain/PaymentCompletedEvent';

// Output port for publishing domain events onto the message bus. Implemented by
// infrastructure (RabbitMQ). A publish failure must propagate so the caller
// (the Stripe webhook) can signal a retry rather than lose the event.
export interface EventPublisher {
  publishPaymentCompleted(event: PaymentCompletedEvent): Promise<void>;
}
