// Domain event emitted when Stripe confirms a payment. It carries everything a
// downstream consumer needs to run side effects (push + confirmation email),
// so the worker stays stateless — all data travels from the Stripe checkout
// session metadata, never from a database.
export interface PaymentCompletedEvent {
  rentalId: string;
  customerEmail?: string;
  customerName?: string;
  // Amount in major currency units (e.g. dollars), as it was charged.
  amount?: number;
  currency?: string;
  // Optional push intent, carried so the company device can be notified.
  expoPushToken?: string;
  pushTitle?: string;
  pushBody?: string;
}

// Build the event from the raw Stripe checkout session metadata. The webhook
// (publish side) uses this; the worker (consume side) just JSON-parses the
// already-built event off the wire.
export const paymentCompletedFromMetadata = (
  metadata: Record<string, string>
): PaymentCompletedEvent => ({
  rentalId: metadata.rentalId,
  customerEmail: metadata.customerEmail,
  customerName: metadata.customerName,
  amount: metadata.amount ? Number(metadata.amount) : undefined,
  currency: metadata.currency,
  expoPushToken: metadata.expoPushToken,
  pushTitle: metadata.pushTitle,
  pushBody: metadata.pushBody,
});
