// Canonical base URL of apps/server, which the mobile app calls for several
// features (payment links, vehicle recognition). Prefer EXPO_PUBLIC_SERVER_URL;
// fall back to the older payment-specific var, then localhost for dev.
export const serverUrl =
  process.env.EXPO_PUBLIC_SERVER_URL ??
  process.env.EXPO_PUBLIC_PAYMENT_API_URL ??
  'http://localhost:4000';
