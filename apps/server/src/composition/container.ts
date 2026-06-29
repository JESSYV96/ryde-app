import { CreatePaymentLink } from '../application/usecases/CreatePaymentLink';
import { GetPaymentStatus } from '../application/usecases/GetPaymentStatus';
import { NotifyOnPaymentCompleted } from '../application/usecases/NotifyOnPaymentCompleted';
import { loadEnv, type Env } from '../infrastructure/config/env';
import { ExpoPushNotifier } from '../infrastructure/expo/ExpoPushNotifier';
import { createPaymentLinksRouter } from '../infrastructure/http/controllers/paymentLinksController';
import { createWebhooksRouter } from '../infrastructure/http/controllers/webhooksController';
import { createStaticPagesRouter } from '../infrastructure/http/staticPages';
import { createApp } from '../infrastructure/http/server';
import { ResendEmailSender } from '../infrastructure/resend/ResendEmailSender';
import { StripePaymentGateway } from '../infrastructure/stripe/StripePaymentGateway';

// Composition root — the only place that knows the concrete adapters. Wires
// adapters into use cases into inbound controllers, then assembles the app.
export const buildApp = (env: Env = loadEnv()) => {
  // Outbound adapters (implement the application ports).
  const payments = new StripePaymentGateway(
    env.stripeSecretKey,
    env.stripeWebhookSecret,
    env.publicBaseUrl
  );
  const email = new ResendEmailSender(env.resendApiKey);
  const push = new ExpoPushNotifier();

  // Use cases.
  const createPaymentLink = new CreatePaymentLink(payments, email);
  const getPaymentStatus = new GetPaymentStatus(payments);
  const notifyOnPaymentCompleted = new NotifyOnPaymentCompleted(push);

  // Inbound adapters.
  const app = createApp({
    webhooks: createWebhooksRouter(payments, notifyOnPaymentCompleted),
    paymentLinks: createPaymentLinksRouter(createPaymentLink, getPaymentStatus),
    staticPages: createStaticPagesRouter(),
  });

  return { app, env };
};
