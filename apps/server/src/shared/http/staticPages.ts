import { Router } from 'express';

// Health check plus the Checkout success/cancel landing pages. These are this
// server's own pages — Checkout `success_url`/`cancel_url` point here (there is
// no separate web app).
export const createStaticPagesRouter = (): Router => {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  router.get('/payment-success', (_req, res) => {
    res.send('<html><body><h1>Payment received — thank you!</h1></body></html>');
  });

  router.get('/payment-cancelled', (_req, res) => {
    res.send('<html><body><h1>Payment cancelled.</h1></body></html>');
  });

  return router;
};
