import type { Channel, ConsumeMessage } from 'amqplib';

import type { HandlePaymentCompleted } from '../../application/usecases/HandlePaymentCompleted';
import type { PaymentCompletedEvent } from '../../domain/PaymentCompletedEvent';
import { topology } from './topology';

// Inbound adapter (worker side): consumes payment.completed messages and runs
// the side-effect use case. On success it acks; on failure it nacks WITHOUT
// requeue, routing the message to the dead-letter queue for inspection/replay.
export class PaymentCompletedConsumer {
  constructor(
    private readonly channel: Channel,
    private readonly handle: HandlePaymentCompleted,
    private readonly prefetch = 10
  ) {}

  async start(): Promise<void> {
    // Cap in-flight messages so one worker doesn't pull the whole queue.
    await this.channel.prefetch(this.prefetch);
    await this.channel.consume(topology.queues.paymentCompleted, (msg) => {
      if (msg) {
        void this.process(msg);
      }
    });
    console.log(`Worker consuming "${topology.queues.paymentCompleted}"`);
  }

  private async process(msg: ConsumeMessage): Promise<void> {
    try {
      const event = JSON.parse(msg.content.toString()) as PaymentCompletedEvent;
      await this.handle.execute(event);
      this.channel.ack(msg);
    } catch (error) {
      console.error('Failed to process payment.completed message; dead-lettering:', error);
      this.channel.nack(msg, false, false);
    }
  }
}
