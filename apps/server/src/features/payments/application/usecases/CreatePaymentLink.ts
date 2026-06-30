import type { PaymentLinkRequest } from '../../domain/PaymentLinkRequest';
import type { EmailSender } from '../ports/EmailSender';
import type { PaymentGateway } from '../ports/PaymentGateway';

export interface CreatePaymentLinkResult {
  stripeSessionId: string;
  paymentUrl: string;
  emailSent: boolean;
}

// Open a payable checkout session and email the link to the customer.
//
// The session already exists and is payable once the gateway returns. A failed
// email must not discard it (that would orphan the session and lose the link),
// so email delivery is reported as a non-fatal flag and the link is returned
// regardless — the mobile app can fall back to sharing it manually.
export class CreatePaymentLink {
  constructor(
    private readonly payments: PaymentGateway,
    private readonly email: EmailSender
  ) {}

  async execute(request: PaymentLinkRequest): Promise<CreatePaymentLinkResult> {
    const session = await this.payments.createCheckoutSession(request);

    let emailSent = true;
    try {
      await this.email.sendPaymentLink({
        to: request.customerEmail,
        customerName: request.customerName,
        description: request.description(),
        money: request.money,
        paymentUrl: session.url,
      });
    } catch (emailError) {
      emailSent = false;
      console.error(`Failed to email payment link for session ${session.id}:`, emailError);
    }

    return { stripeSessionId: session.id, paymentUrl: session.url, emailSent };
  }
}
