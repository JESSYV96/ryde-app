import { buildPaymentsWorker } from '../features/payments/payments.worker';
import { loadEnv, type Env } from '../shared/config/env';

// Composition root for the worker process. Starts each slice's consumers. Only
// the payments slice has a worker today.
export const buildWorker = async (env: Env = loadEnv()) => {
  const payments = await buildPaymentsWorker(env);

  return { rabbit: payments.rabbit };
};
