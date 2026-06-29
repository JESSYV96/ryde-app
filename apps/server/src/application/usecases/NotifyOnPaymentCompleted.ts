import { buildCompanyNotification } from '../../domain/payment/CompanyNotification';
import type { PushNotifier } from '../ports/PushNotifier';

// React to a completed payment by notifying the company's device with a deep
// link to the rental. We stay stateless: the push token, rentalId and copy
// travel in the checkout session metadata set when the link was created.
//
// No-op when the push intent is absent. A push failure is logged and swallowed
// so it never fails the webhook (the provider would otherwise retry).
export class NotifyOnPaymentCompleted {
  constructor(private readonly push: PushNotifier) {}

  async execute(metadata: Record<string, string>): Promise<void> {
    const { expoPushToken, rentalId, pushTitle, pushBody } = metadata;
    if (!expoPushToken || !rentalId) {
      return;
    }

    const notification = buildCompanyNotification({
      expoPushToken,
      rentalId,
      title: pushTitle,
      body: pushBody,
    });

    try {
      await this.push.notify(notification);
    } catch (error) {
      console.error(`Failed to push payment notification for rental ${rentalId}:`, error);
    }
  }
}
