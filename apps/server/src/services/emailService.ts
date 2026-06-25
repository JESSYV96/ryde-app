import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY ?? '');

export interface SendPaymentLinkEmailInput {
  to: string;
  customerName: string;
  description: string;
  amount: number;
  currency: string;
  paymentUrl: string;
}

export const sendPaymentLinkEmail = async (input: SendPaymentLinkEmailInput): Promise<void> => {
  const formattedAmount = new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: input.currency,
  }).format(input.amount);

  const { error } = await resend.emails.send({
    from: 'Car Rental <onboarding@resend.dev>',
    to: [input.to],
    subject: `Payment request: ${formattedAmount}`,
    html: `
      <p>Hi ${input.customerName},</p>
      <p>${input.description}</p>
      <p><strong>Amount due: ${formattedAmount}</strong></p>
      <p><a href="${input.paymentUrl}">Pay now</a></p>
    `,
  });

  if (error) {
    throw new Error(`Failed to send payment link email: ${error.message}`);
  }
};
