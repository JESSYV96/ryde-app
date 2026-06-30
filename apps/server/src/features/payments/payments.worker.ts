import type { Env } from '../../shared/config/env';
import { RabbitMqConnection } from '../../shared/messaging/RabbitMqConnection';
import { HandlePaymentCompleted } from './application/usecases/HandlePaymentCompleted';
import { NotifyOnPaymentCompleted } from './application/usecases/NotifyOnPaymentCompleted';
import { SendPaymentConfirmationEmail } from './application/usecases/SendPaymentConfirmationEmail';
import { ExpoPushNotifier } from './infrastructure/expo/ExpoPushNotifier';
import { PaymentCompletedConsumer } from './infrastructure/rabbitmq/PaymentCompletedConsumer';
import { assertTopology } from './infrastructure/rabbitmq/topology';
import { ResendEmailSender } from './infrastructure/resend/ResendEmailSender';

export interface PaymentsWorker {
  rabbit: RabbitMqConnection;
}

// Worker-side composition for the payments slice: wires the outbound adapters
// into the side-effect use cases and starts the RabbitMQ consumer.
export const buildPaymentsWorker = async (env: Env): Promise<PaymentsWorker> => {
  const push = new ExpoPushNotifier();
  const email = new ResendEmailSender(env.resendApiKey);

  const notify = new NotifyOnPaymentCompleted(push);
  const sendConfirmation = new SendPaymentConfirmationEmail(email);
  const handle = new HandlePaymentCompleted(notify, sendConfirmation);

  const rabbit = new RabbitMqConnection(env.rabbitmqUrl);
  const channel = await rabbit.connect();
  await assertTopology(channel);
  const consumer = new PaymentCompletedConsumer(channel, handle);
  await consumer.start();

  return { rabbit };
};
