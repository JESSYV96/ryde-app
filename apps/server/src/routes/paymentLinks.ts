import { Router } from 'express';

import { sendPaymentLinkEmail } from '../services/emailService';
import { createCheckoutSession, getCheckoutSessionStatus } from '../services/stripeService';

export const paymentLinksRouter = Router();

interface CreatePaymentLinkBody {
  rentalId: string;
  kind: 'quote' | 'extra-mileage';
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  vehicleLabel: string;
}

const descriptionForKind = (kind: CreatePaymentLinkBody['kind'], vehicleLabel: string): string =>
  kind === 'quote' ? `Rental quote — ${vehicleLabel}` : `Extra mileage charge — ${vehicleLabel}`;

paymentLinksRouter.post('/payment-links', async (req, res) => {
  try {
    const body = req.body as CreatePaymentLinkBody;

    const session = await createCheckoutSession({
      amount: body.amount,
      currency: body.currency,
      description: descriptionForKind(body.kind, body.vehicleLabel),
      customerEmail: body.customerEmail,
    });

    if (!session.url) {
      res.status(502).json({ error: 'Stripe did not return a checkout URL' });
      return;
    }

    await sendPaymentLinkEmail({
      to: body.customerEmail,
      customerName: body.customerName,
      description: descriptionForKind(body.kind, body.vehicleLabel),
      amount: body.amount,
      currency: body.currency,
      paymentUrl: session.url,
    });

    res.json({ stripeSessionId: session.id, paymentUrl: session.url });
  } catch (error) {
    res.status(502).json({ error: (error as Error).message });
  }
});

paymentLinksRouter.get('/payment-links/:sessionId/status', async (req, res) => {
  try {
    const { status, paidAt } = await getCheckoutSessionStatus(req.params.sessionId);
    res.json({ status, paidAt });
  } catch (error) {
    res.status(502).json({ error: (error as Error).message });
  }
});
