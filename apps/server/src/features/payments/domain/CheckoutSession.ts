// Result of opening a payment link: the provider session id and its payable
// URL. A pure domain value — no provider SDK types leak here.
export interface CheckoutSession {
  id: string;
  url: string;
}

// Snapshot of where a payment stands, as polled by the mobile app.
export interface PaymentStatus {
  status: string | null;
  paidAt: string | null;
}
