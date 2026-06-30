import { buildCompanyNotification } from '../../domain/CompanyNotification';
import type { PaymentCompletedEvent } from '../../domain/PaymentCompletedEvent';
import type { PushNotifier } from '../ports/PushNotifier';

// Worker-side use case: notify the company's device of a completed payment with
// a deep link to the rental. No-op when the event carries no push intent.
//
// Unlike the old inline webhook path, a push failure now PROPAGATES so the
// consumer can nack the message (retry / dead-letter) instead of silently
// losing the notification.
export class NotifyOnPaymentCompleted {
  constructor(private readonly push: PushNotifier) {}

  async execute(event: PaymentCompletedEvent): Promise<void> {
    if (!event.expoPushToken || !event.rentalId) {
      return;
    }

    const notification = buildCompanyNotification({
      expoPushToken: event.expoPushToken,
      rentalId: event.rentalId,
      title: event.pushTitle,
      body: event.pushBody,
    });

    await this.push.notify(notification);
  }
}
