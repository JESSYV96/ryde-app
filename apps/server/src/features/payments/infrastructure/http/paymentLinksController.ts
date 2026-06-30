import { Router } from 'express';

import type { CreatePaymentLink } from '../../application/usecases/CreatePaymentLink';
import type { GetPaymentStatus } from '../../application/usecases/GetPaymentStatus';
import { Money } from '../../domain/Money';
import { PaymentLinkRequest } from '../../domain/PaymentLinkRequest';
import type { PaymentKind } from '../../domain/PaymentKind';

interface CreatePaymentLinkBody {
  rentalId: string;
  kind: PaymentKind;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  vehicleLabel: string;
  // Optional push metadata — lets the webhook notify the company on payment.
  expoPushToken?: string;
  pushTitle?: string;
  pushBody?: string;
}

// Inbound HTTP adapter for payment links. Maps the JSON body onto domain
// objects, delegates to use cases, and translates failures to 502.
export const createPaymentLinksRouter = (
  createPaymentLink: CreatePaymentLink,
  getPaymentStatus: GetPaymentStatus
): Router => {
  const router = Router();

  router.post('/payment-links', async (req, res) => {
    try {
      const body = req.body as CreatePaymentLinkBody;
      const request = new PaymentLinkRequest({
        rentalId: body.rentalId,
        kind: body.kind,
        money: Money.of(body.amount, body.currency),
        customerEmail: body.customerEmail,
        customerName: body.customerName,
        vehicleLabel: body.vehicleLabel,
        push: body.expoPushToken
          ? { expoPushToken: body.expoPushToken, title: body.pushTitle, body: body.pushBody }
          : undefined,
      });

      const result = await createPaymentLink.execute(request);
      res.json(result);
    } catch (error) {
      res.status(502).json({ error: (error as Error).message });
    }
  });

  router.get('/payment-links/:sessionId/status', async (req, res) => {
    try {
      const status = await getPaymentStatus.execute(req.params.sessionId);
      res.json(status);
    } catch (error) {
      res.status(502).json({ error: (error as Error).message });
    }
  });

  return router;
};
