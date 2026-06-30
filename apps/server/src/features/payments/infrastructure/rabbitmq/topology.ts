import type { Channel } from 'amqplib';

// Single source of truth for the messaging topology. Declared identically by
// both the publisher (API) and the consumer (worker) — assertExchange/Queue are
// idempotent, so whichever process boots first creates them.
export const topology = {
  // Main topic exchange the API publishes payment events to.
  exchange: 'payments',
  // Dead-letter exchange: messages the worker fails to process land here.
  deadLetterExchange: 'payments.dlx',
  routingKeys: {
    paymentCompleted: 'payment.completed',
  },
  queues: {
    // Work queue consumed by the worker.
    paymentCompleted: 'payment.completed.q',
    // Parking queue for failed messages, for inspection / manual replay.
    deadLetter: 'payment.completed.dlq',
  },
} as const;

export const assertTopology = async (channel: Channel): Promise<void> => {
  // Main exchange.
  await channel.assertExchange(topology.exchange, 'topic', { durable: true });

  // Dead-letter exchange + parking queue.
  await channel.assertExchange(topology.deadLetterExchange, 'fanout', { durable: true });
  await channel.assertQueue(topology.queues.deadLetter, { durable: true });
  await channel.bindQueue(topology.queues.deadLetter, topology.deadLetterExchange, '');

  // Work queue: durable, and dead-letters to the DLX when a message is nacked
  // without requeue.
  await channel.assertQueue(topology.queues.paymentCompleted, {
    durable: true,
    deadLetterExchange: topology.deadLetterExchange,
  });
  await channel.bindQueue(
    topology.queues.paymentCompleted,
    topology.exchange,
    topology.routingKeys.paymentCompleted
  );
};
