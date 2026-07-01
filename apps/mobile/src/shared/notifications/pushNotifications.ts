import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Foreground presentation: still show the banner/list so the company sees the
// "paid" alert even while using the app.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Cached at module scope so the payment service can attach the token to a
// create-link request without each call site threading it through.
let cachedExpoPushToken: string | null = null;

export const getCachedExpoPushToken = (): string | null => cachedExpoPushToken;

// Registers the device for remote push and caches its Expo token. Returns null
// (and logs) on anything that legitimately blocks a token — denied permission,
// iOS simulator, missing EAS projectId — so the app keeps working without push.
export const registerForPushNotificationsAsync = async (): Promise<string | null> => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('payments', {
      name: 'Payments',
      importance: Notifications.AndroidImportance.MAX,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  const finalStatus =
    existingStatus === 'granted' ? existingStatus : (await Notifications.requestPermissionsAsync()).status;
  if (finalStatus !== 'granted') {
    console.warn('Push notifications permission not granted; skipping token registration.');
    return null;
  }

  const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) {
    console.warn('Missing EAS projectId; cannot obtain an Expo push token.');
    return null;
  }

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    cachedExpoPushToken = data;
    return data;
  } catch (error) {
    console.warn('Failed to obtain Expo push token:', error);
    return null;
  }
};
