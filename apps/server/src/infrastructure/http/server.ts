import express, { type Express } from 'express';

import { registerRoutes, type HttpControllers } from './routes';

// Assembles the Express application from the wired inbound controllers.
export const createApp = (controllers: HttpControllers): Express => {
  const app = express();
  registerRoutes(app, controllers);
  return app;
};
