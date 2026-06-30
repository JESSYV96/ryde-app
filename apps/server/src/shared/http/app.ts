import cors from 'cors';
import express, { type Express, type Router } from 'express';

// The inbound routers each slice contributes, assembled by the composition root.
export interface HttpControllers {
  webhooks: Router;
  paymentLinks: Router;
  vehicleRecognition: Router;
  staticPages: Router;
}

// Assembles the Express application from the slices' inbound routers. Mounts
// them in the order required for Stripe signature verification: the webhook
// router must see the RAW body, so `express.raw()` is applied to `/webhooks`
// BEFORE the global `express.json()` parser. The JSON limit is raised because
// vehicle-recognition photos arrive base64-encoded.
export const createApp = (controllers: HttpControllers): Express => {
  const app = express();

  app.use(cors());

  app.use('/webhooks', express.raw({ type: 'application/json' }));
  app.use(controllers.webhooks);

  app.use(express.json({ limit: '15mb' }));
  app.use(controllers.paymentLinks);
  app.use(controllers.vehicleRecognition);
  app.use(controllers.staticPages);

  return app;
};
