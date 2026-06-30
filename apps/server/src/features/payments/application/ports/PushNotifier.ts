import type { CompanyNotification } from '../../domain/CompanyNotification';

// Output port for push notifications. Implemented by infrastructure (Expo).
export interface PushNotifier {
  notify(notification: CompanyNotification): Promise<void>;
}
