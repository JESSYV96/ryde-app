import type { TFunction } from 'i18next';

import { formatPrice } from '@/shared/utils/pricing';

interface PaidPushContentInput {
  customerName: string;
  amount: number;
  currency: string;
}

export interface PaidPushContent {
  pushTitle: string;
  pushBody: string;
}

// Builds the localized copy for the "payment received" push, keeping notification
// wording in the app's i18n (the single source) rather than on the stateless server.
// Field names match CreatePaymentLinkInput so the result can be spread directly.
export const buildPaidPushContent = (t: TFunction, input: PaidPushContentInput): PaidPushContent => ({
  pushTitle: t('detail.paymentPaidPushTitle'),
  pushBody: t('detail.paymentPaidPushBody', {
    customerName: input.customerName,
    price: formatPrice(input.amount, input.currency),
  }),
});
