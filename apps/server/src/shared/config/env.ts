// Centralized, typed access to the environment. The Stripe and Resend secrets
// only ever exist here, on the server — never sent to or accepted from the
// mobile app.
export interface Env {
  port: number;
  publicBaseUrl: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  resendApiKey: string;
  anthropicApiKey: string;
  rabbitmqUrl: string;
}

export const loadEnv = (): Env => {
  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  return {
    port,
    publicBaseUrl: process.env.PUBLIC_BASE_URL ?? `http://localhost:${port}`,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY ?? '',
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET ?? '',
    resendApiKey: process.env.RESEND_API_KEY ?? '',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? '',
    rabbitmqUrl: process.env.RABBITMQ_URL ?? 'amqp://guest:guest@localhost:5672',
  };
};
