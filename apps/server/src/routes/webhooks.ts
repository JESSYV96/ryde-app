import { Router } from 'express';

import { constructWebhookEvent } from '../services/stripeService';

export const webhooksRouter = Router();

webhooksRouter.post('/webhooks/stripe', (req, res) => {
  const signature = req.headers['stripe-signature'];
  if (typeof signature !== 'string') {
    res.status(400).json({ error: 'Missing stripe-signature header' });
    return;
  }

  try {
    const event = constructWebhookEvent(req.body as Buffer, signature);
    console.log(`Received Stripe event: ${event.type}`);
  } catch (error) {
    res.status(400).json({ error: `Webhook signature verification failed: ${(error as Error).message}` });
    return;
  }

  res.json({ received: true });
});
