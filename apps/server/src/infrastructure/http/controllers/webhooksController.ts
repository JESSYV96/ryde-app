import { Router } from 'express';

import type { PaymentGateway } from '../../../application/ports/PaymentGateway';
import type { NotifyOnPaymentCompleted } from '../../../application/usecases/NotifyOnPaymentCompleted';

// Inbound HTTP adapter for Stripe webhooks. Verifies the signature via the
// gateway and, on a completed checkout, hands the metadata to the use case.
// Always ACKs (Stripe retries otherwise) regardless of downstream outcome.
export const createWebhooksRouter = (
  payments: PaymentGateway,
  notifyOnPaymentCompleted: NotifyOnPaymentCompleted
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
      await notifyOnPaymentCompleted.execute(event.completedCheckoutMetadata);
    }

    res.json({ received: true });
  });

  return router;
};
