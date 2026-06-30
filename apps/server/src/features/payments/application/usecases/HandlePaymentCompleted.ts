import type { PaymentCompletedEvent } from '../../domain/PaymentCompletedEvent';
import type { NotifyOnPaymentCompleted } from './NotifyOnPaymentCompleted';
import type { SendPaymentConfirmationEmail } from './SendPaymentConfirmationEmail';

// Worker-side orchestrator for a completed payment: run the push notification
// then the confirmation email. Any failure propagates so the RabbitMQ consumer
// nacks the message (retry / dead-letter) rather than losing the side effect.
//
// Delivery is at-least-once: on a retry, a step that already succeeded may run
// again (e.g. a duplicate push). Keep the side effects tolerant of that.
export class HandlePaymentCompleted {
  constructor(
    private readonly notify: NotifyOnPaymentCompleted,
    private readonly sendConfirmation: SendPaymentConfirmationEmail
  ) {}

  async execute(event: PaymentCompletedEvent): Promise<void> {
    await this.notify.execute(event);
    await this.sendConfirmation.execute(event);
  }
}
