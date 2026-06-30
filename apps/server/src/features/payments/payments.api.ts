import type { Router } from 'express';

import type { Env } from '../../shared/config/env';
import { RabbitMqConnection } from '../../shared/messaging/RabbitMqConnection';
import { CreatePaymentLink } from './application/usecases/CreatePaymentLink';
import { GetPaymentStatus } from './application/usecases/GetPaymentStatus';
import { PublishPaymentCompleted } from './application/usecases/PublishPaymentCompleted';
import { createPaymentLinksRouter } from './infrastructure/http/paymentLinksController';
import { createWebhooksRouter } from './infrastructure/http/webhooksController';
import { RabbitMqEventPublisher } from './infrastructure/rabbitmq/RabbitMqEventPublisher';
import { assertTopology } from './infrastructure/rabbitmq/topology';
import { ResendEmailSender } from './infrastructure/resend/ResendEmailSender';
import { StripePaymentGateway } from './infrastructure/stripe/StripePaymentGateway';

export interface PaymentsApi {
  routers: { webhooks: Router; paymentLinks: Router };
  // Returned so the composition root can close it on shutdown.
  rabbit: RabbitMqConnection;
}

// API-side composition for the payments slice: wires the outbound adapters and
// the message-bus publisher into the HTTP inbound routers.
export const buildPaymentsApi = async (env: Env): Promise<PaymentsApi> => {
  const payments = new StripePaymentGateway(
    env.stripeSecretKey,
    env.stripeWebhookSecret,
    env.publicBaseUrl
  );
  const email = new ResendEmailSender(env.resendApiKey);

  const rabbit = new RabbitMqConnection(env.rabbitmqUrl);
  const channel = await rabbit.connect();
  await assertTopology(channel);
  const eventPublisher = new RabbitMqEventPublisher(channel);

  const createPaymentLink = new CreatePaymentLink(payments, email);
  const getPaymentStatus = new GetPaymentStatus(payments);
  const publishPaymentCompleted = new PublishPaymentCompleted(eventPublisher);

  return {
    routers: {
      webhooks: createWebhooksRouter(payments, publishPaymentCompleted),
      paymentLinks: createPaymentLinksRouter(createPaymentLink, getPaymentStatus),
    },
    rabbit,
  };
};
