import type { PushNotifier } from '../../application/ports/PushNotifier';
import type { CompanyNotification } from '../../domain/payment/CompanyNotification';

// Expo Push adapter implementing the PushNotifier port. No SDK needed — a
// single HTTPS POST to Expo's push service.
const EXPO_PUSH_ENDPOINT = 'https://exp.host/--/api/v2/push/send';

export class ExpoPushNotifier implements PushNotifier {
  async notify(notification: CompanyNotification): Promise<void> {
    const response = await fetch(EXPO_PUSH_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: notification.expoPushToken,
        title: notification.title,
        body: notification.body,
        data: { url: notification.rentalDeepLink },
        sound: 'default',
      }),
    });

    if (!response.ok) {
      throw new Error(`Expo push request failed: ${response.status} ${await response.text()}`);
    }
  }
}
