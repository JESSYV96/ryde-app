import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '');

const baseUrl = process.env.PUBLIC_BASE_URL ?? `http://localhost:${process.env.PORT ?? 4000}`;

export interface CreateCheckoutSessionInput {
  amount: number;
  currency: string;
  description: string;
  customerEmail: string;
}

export const createCheckoutSession = async (input: CreateCheckoutSessionInput): Promise<Stripe.Checkout.Session> => {
  return stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: input.customerEmail,
    success_url: `${baseUrl}/payment-success`,
    cancel_url: `${baseUrl}/payment-cancelled`,
    line_items: [
      {
        price_data: {
          currency: input.currency.toLowerCase(),
          unit_amount: Math.round(input.amount * 100),
          product_data: { name: input.description },
        },
        quantity: 1,
      },
    ],
  });
};

export const getCheckoutSessionStatus = async (
  sessionId: string
): Promise<{ status: Stripe.Checkout.Session.Status | null; paidAt: string | null }> => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  return {
    status: session.status,
    paidAt: session.status === 'complete' ? new Date().toISOString() : null,
  };
};

export const constructWebhookEvent = (rawBody: Buffer, signature: string): Stripe.Event => {
  return stripe.webhooks.constructEvent(rawBody, signature, process.env.STRIPE_WEBHOOK_SECRET ?? '');
};
