import { Router } from 'express';

import type { PaymentGateway } from '../../application/ports/PaymentGateway';
import type { PublishPaymentCompleted } from '../../application/usecases/PublishPaymentCompleted';

// Inbound HTTP adapter for Stripe webhooks. Verifies the signature, then on a
// completed checkout publishes a payment.completed event onto the bus and ACKs.
// If publishing fails it responds 500 so Stripe redelivers — without a database,
// letting Stripe retry is how we avoid losing the event.
export const createWebhooksRouter = (
  payments: PaymentGateway,
  publishPaymentCompleted: PublishPaymentCompleted
): Router => {
  const router = Router();

  router.post('/webhooks/stripe', async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (typeof signature !== 'string') {
      res.status(400).json({ error: 'Missing stripe-signature header' });
      return;
    }

    let event;
    try {
      event = payments.verifyWebhookEvent(req.body as Buffer, signature);
    } catch (error) {
      res
        .status(400)
        .json({ error: `Webhook signature verification failed: ${(error as Error).message}` });
      return;
    }

    console.log(`Received Stripe event: ${event.type}`);
    if (event.completedCheckoutMetadata) {
      try {
        await publishPaymentCompleted.execute(event.completedCheckoutMetadata);
      } catch (error) {
        console.error('Failed to publish payment.completed event:', error);
        res.status(500).json({ error: 'Failed to enqueue payment event' });
        return;
      }
    }

    res.json({ received: true });
  });

  return router;
};
