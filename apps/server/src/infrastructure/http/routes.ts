import cors from 'cors';
import express, { type Express, type Router } from 'express';

export interface HttpControllers {
  webhooks: Router;
  paymentLinks: Router;
  staticPages: Router;
}

// Mounts the inbound adapters in the order required for Stripe signature
// verification: the webhook router must see the RAW body, so `express.raw()`
// is applied to `/webhooks` BEFORE the global `express.json()` parser.
export const registerRoutes = (app: Express, controllers: HttpControllers): void => {
  app.use(cors());

  app.use('/webhooks', express.raw({ type: 'application/json' }));
  app.use(controllers.webhooks);

  app.use(express.json());
  app.use(controllers.paymentLinks);
  app.use(controllers.staticPages);
};
