// A push notification to the company's device announcing a completed payment,
// carrying a deep link to the paid rental. Built from the push intent that
// travelled through the Stripe session metadata.
export interface CompanyNotification {
  expoPushToken: string;
  title: string;
  body: string;
  rentalDeepLink: string;
}

const DEFAULT_TITLE = 'Payment received';
const DEFAULT_BODY = 'A rental payment has been completed.';

export const buildCompanyNotification = (params: {
  expoPushToken: string;
  rentalId: string;
  title?: string;
  body?: string;
}): CompanyNotification => ({
  expoPushToken: params.expoPushToken,
  title: params.title ?? DEFAULT_TITLE,
  body: params.body ?? DEFAULT_BODY,
  rentalDeepLink: `/rentals/${params.rentalId}`,
});
