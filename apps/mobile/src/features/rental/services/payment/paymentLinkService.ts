import type { PaymentKind } from '@/features/rental/model/rental.types';
import { getCachedExpoPushToken } from '@/shared/notifications/pushNotifications';

const PAYMENT_API_URL = process.env.EXPO_PUBLIC_PAYMENT_API_URL ?? 'http://localhost:4000';

export interface CreatePaymentLinkInput {
  rentalId: string;
  kind: PaymentKind;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  vehicleLabel: string;
  // Localized copy for the "paid" push the company receives. The device token is
  // injected by the service, so callers only supply the (i18n-owned) copy.
  pushTitle: string;
  pushBody: string;
}

export interface CreatePaymentLinkResult {
  stripeSessionId: string;
  paymentUrl: string;
  emailSent: boolean;
}

export const createAndSendPaymentLink = async (input: CreatePaymentLinkInput): Promise<CreatePaymentLinkResult> => {
  const response = await fetch(`${PAYMENT_API_URL}/payment-links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...input, expoPushToken: getCachedExpoPushToken() ?? undefined }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create payment link: ${response.status}`);
  }
  return response.json();
};

export type PaymentLinkStatus = 'open' | 'complete' | 'expired';

export interface PaymentLinkStatusResult {
  status: PaymentLinkStatus;
  paidAt: string | null;
}

export const getPaymentLinkStatus = async (stripeSessionId: string): Promise<PaymentLinkStatusResult> => {
  const response = await fetch(`${PAYMENT_API_URL}/payment-links/${stripeSessionId}/status`);
  if (!response.ok) {
    throw new Error(`Failed to fetch payment link status: ${response.status}`);
  }
  return response.json();
};
