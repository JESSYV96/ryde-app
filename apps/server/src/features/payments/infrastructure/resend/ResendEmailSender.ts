import { Resend } from 'resend';

import type {
  EmailSender,
  PaymentConfirmationEmail,
  PaymentLinkEmail,
} from '../../application/ports/EmailSender';

const FROM_ADDRESS = 'Car Rental <onboarding@resend.dev>';

// Resend adapter implementing the EmailSender port. Owns the HTML rendering of
// the payment-link email.
export class ResendEmailSender implements EmailSender {
  private readonly resend: Resend;

  constructor(apiKey: string) {
    this.resend = new Resend(apiKey);
  }

  async sendPaymentLink(email: PaymentLinkEmail): Promise<void> {
    const formattedAmount = email.money.format();

    const { error } = await this.resend.emails.send({
      from: FROM_ADDRESS,
      to: [email.to],
      subject: `Payment request: ${formattedAmount}`,
      html: `
      <p>Hi ${email.customerName},</p>
      <p>${email.description}</p>
      <p><strong>Amount due: ${formattedAmount}</strong></p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0;">
        <tr>
          <td align="center" bgcolor="#635bff" style="border-radius: 6px;">
            <a href="${email.paymentUrl}"
               style="display: inline-block; padding: 14px 28px; font-family: Arial, sans-serif; font-size: 16px; font-weight: bold; color: #ffffff; text-decoration: none; border-radius: 6px;">
              Pay now
            </a>
          </td>
        </tr>
      </table>
      <p style="font-size: 12px; color: #666;">
        If the button doesn't work, copy and paste this link into your browser:<br />
        <a href="${email.paymentUrl}">${email.paymentUrl}</a>
      </p>
    `,
    });

    if (error) {
      throw new Error(`Failed to send payment link email: ${error.message}`);
    }
  }

  async sendPaymentConfirmation(email: PaymentConfirmationEmail): Promise<void> {
    const amountLine = email.money
      ? `<p><strong>Amount paid: ${email.money.format()}</strong></p>`
      : '';

    const { error } = await this.resend.emails.send({
      from: FROM_ADDRESS,
      to: [email.to],
      subject: 'Payment received — thank you!',
      html: `
      <p>Hi ${email.customerName},</p>
      <p>We've received your payment for rental <strong>${email.rentalId}</strong>. Thank you!</p>
      ${amountLine}
    `,
    });

    if (error) {
      throw new Error(`Failed to send payment confirmation email: ${error.message}`);
    }
  }
}
