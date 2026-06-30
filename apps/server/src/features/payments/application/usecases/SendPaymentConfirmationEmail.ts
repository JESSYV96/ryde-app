import { Money } from '../../domain/Money';
import type { PaymentCompletedEvent } from '../../domain/PaymentCompletedEvent';
import type { EmailSender } from '../ports/EmailSender';

// Worker-side use case: email the customer a payment confirmation. No-op when
// the event carries no recipient. Errors propagate so the consumer can retry /
// dead-letter the message.
export class SendPaymentConfirmationEmail {
  constructor(private readonly email: EmailSender) {}

  async execute(event: PaymentCompletedEvent): Promise<void> {
    if (!event.customerEmail) {
      return;
    }

    const money =
      event.amount !== undefined && event.currency
        ? Money.of(event.amount, event.currency)
        : undefined;

    await this.email.sendPaymentConfirmation({
      to: event.customerEmail,
      customerName: event.customerName ?? 'there',
      rentalId: event.rentalId,
      money,
    });
  }
}
