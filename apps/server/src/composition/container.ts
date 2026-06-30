import { buildPaymentsApi } from '../features/payments/payments.api';
import { buildVehicleRecognitionApi } from '../features/vehicle-recognition/vehicle-recognition.api';
import { loadEnv, type Env } from '../shared/config/env';
import { createApp } from '../shared/http/app';
import { createStaticPagesRouter } from '../shared/http/staticPages';

// Composition root for the API process. Builds each feature slice and assembles
// their inbound routers into the Express app. The slices own their own wiring;
// this root only knows the slices and the shared HTTP kernel.
export const buildApp = async (env: Env = loadEnv()) => {
  const payments = await buildPaymentsApi(env);
  const vehicleRecognition = buildVehicleRecognitionApi(env);

  const app = createApp({
    webhooks: payments.routers.webhooks,
    paymentLinks: payments.routers.paymentLinks,
    vehicleRecognition: vehicleRecognition.routers.vehicleRecognition,
    staticPages: createStaticPagesRouter(),
  });

  return { app, env, rabbit: payments.rabbit };
};
