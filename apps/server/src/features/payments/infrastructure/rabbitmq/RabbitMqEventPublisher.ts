import type { ConfirmChannel } from 'amqplib';

import type { EventPublisher } from '../../application/ports/EventPublisher';
import type { PaymentCompletedEvent } from '../../domain/PaymentCompletedEvent';
import { topology } from './topology';

// RabbitMQ adapter for the EventPublisher port. Publishes persistent messages on
// a confirm channel and awaits the broker's acknowledgement, so a publish only
// resolves once the broker has durably accepted the message — otherwise it
// rejects and the webhook can ask Stripe to redeliver.
export class RabbitMqEventPublisher implements EventPublisher {
  constructor(private readonly channel: ConfirmChannel) {}

  publishPaymentCompleted(event: PaymentCompletedEvent): Promise<void> {
    const payload = Buffer.from(JSON.stringify(event));

    return new Promise<void>((resolve, reject) => {
      this.channel.publish(
        topology.exchange,
        topology.routingKeys.paymentCompleted,
        payload,
        { persistent: true, contentType: 'application/json' },
        (err) => (err ? reject(err) : resolve())
      );
    });
  }
}
