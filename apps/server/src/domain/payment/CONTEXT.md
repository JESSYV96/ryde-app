# Bounded Context — Payments

The single bounded context of `apps/server`. It turns a rental charge into a
payable Stripe Checkout link, delivers that link (email), and reacts to the
payment (push to the company). **Stateless**: Stripe is the source of truth —
this context owns no database.

## Ubiquitous language

| Term | Meaning |
|------|---------|
| **Payment Link Request** | A request to charge a customer for a rental (money + customer + optional push intent). Aggregate root of this context. |
| **Money** | A monetary amount in **major** currency units (dollars, not cents). Owns the conversion to minor units and the display formatting. |
| **Payment Kind** | What the charge is for: a `quote` or an `extra-mileage` charge. Drives the human-readable description. |
| **Checkout Session** | The provider's payable container, reduced here to `{ id, url }`. |
| **Payment Status** | Where a payment stands (`status`, `paidAt`), as polled by the mobile app. |
| **Push Intent / Company Notification** | The intent to notify the company's device on payment, with a deep link to the rental. |
| **Rental** | External concept. Only its `id` crosses into this context — never modelled here. |

## Model

- **Aggregate root**: `PaymentLinkRequest` — composes `Money`, the customer
  contact, and an optional `PushIntent`; derives its `description()` from
  `PaymentKind` + vehicle label.
- **Value objects**: `Money`, `PaymentKind`, `CheckoutSession`,
  `PaymentStatus`, `CompanyNotification`. Pure — no SDK or framework imports.

## Ports (driven / outbound)

The context depends on capabilities, not vendors. Interfaces in
`application/ports/`, implemented by `infrastructure/` adapters:

| Port | Adapter | Role |
|------|---------|------|
| `PaymentGateway` | `StripePaymentGateway` | open/poll checkout sessions, verify webhooks |
| `EmailSender` | `ResendEmailSender` | deliver the payment-link email |
| `PushNotifier` | `ExpoPushNotifier` | notify the company on payment |

Use cases (`application/usecases/`) — `CreatePaymentLink`, `GetPaymentStatus`,
`NotifyOnPaymentCompleted` — orchestrate the model through these ports.

## Invariants

- **No persistence.** State that must survive a request belongs in the mobile
  app's SQLite and travels in as a request param — not in a DB here.
- **Stateless choreography.** `rentalId` and the push intent ride in the Stripe
  session **metadata**, so the webhook can notify without storing anything.
- **Major → minor units only at the provider boundary.** Enforced by
  `Money.toMinorUnits()`, applied solely inside the Stripe adapter.
- **Side effects are non-fatal.** A failed email (on link creation) or push (on
  webhook) is logged and swallowed; it never fails the request.
- **Secrets stay here.** Stripe/Resend keys are loaded only via
  `infrastructure/config/env.ts`, never sent to or accepted from the mobile app.

## Relationship to the mobile app (context map)

Upstream–downstream, **Customer/Supplier**: `apps/mobile` is the customer, this
server the supplier. The integration contract is the HTTP API
(`POST /payment-links`, `GET /payment-links/:id/status`,
`POST /webhooks/stripe`) — change it in lockstep with the mobile client.
