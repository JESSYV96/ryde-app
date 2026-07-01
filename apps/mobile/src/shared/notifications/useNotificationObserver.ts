import * as Notifications from 'expo-notifications';
import { router } from 'expo-router';
import { useEffect } from 'react';

// Routes a notification tap to its deep link. The server puts the rental path in
// `data.url` (e.g. "/rentals/<id>"); we forward it to expo-router. Handles both
// taps while the app runs and the cold-start tap that launched the app.
export const useNotificationObserver = (): void => {
  useEffect(() => {
    const redirect = (notification: Notifications.Notification): void => {
      const url = notification.request.content.data?.url;
      if (typeof url === 'string') {
        router.push(url as Parameters<typeof router.push>[0]);
      }
    };

    const lastResponse = Notifications.getLastNotificationResponse();
    if (lastResponse?.notification) {
      redirect(lastResponse.notification);
    }

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      redirect(response.notification);
    });

    return () => subscription.remove();
  }, []);
};
