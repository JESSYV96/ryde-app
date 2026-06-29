# Project

Stateless Stripe payment-link backend for the car-rental mobile app.
Creates Stripe Checkout Sessions, emails the link via Resend, and lets
the mobile app poll a session's status. No database — Stripe is the
single source of truth for payment state.

## Tech stack

- Node + Express + TypeScript (CommonJS)
- `stripe` SDK
- `resend` SDK for transactional email
- `tsx` for local dev (`pnpm --filter server run dev`)

## Architecture

Hexagonal (ports & adapters) with a DDD domain. Dependencies always
point inward toward the domain — `domain` depends on nothing, and the
provider SDKs (Stripe, Resend, Expo) are kept at the edges.

```
src/
  domain/payment/        Pure value objects / entities, no SDK or framework
                         imports (Money owns the major→minor unit rule;
                         PaymentKind, PaymentLinkRequest, CheckoutSession,
                         CompanyNotification).
  application/
    ports/               Interfaces the domain needs: PaymentGateway,
                         EmailSender, PushNotifier.
    usecases/            Orchestration: CreatePaymentLink, GetPaymentStatus,
                         NotifyOnPaymentCompleted. Depend only on ports.
  infrastructure/        Adapters implementing the ports + the HTTP edge.
    stripe/ resend/ expo/  Outbound adapters (one per provider).
    http/                Inbound adapters: controllers, route wiring,
                         static pages, Express app assembly.
    config/env.ts        Typed env loading.
  composition/container.ts  Composition root — the ONLY place that knows the
                            concrete adapters and wires them into use cases.
  index.ts               Entry point.
```

- No persistence layer here. Never add a database "to make this
  easier" — if a use case needs to remember something across requests,
  that's a sign the state belongs in the mobile app's SQLite (synced via
  a request param), not in this server.
- Business rules live in `domain/` and `application/` — never in a
  controller or an adapter. Provider SDK calls (Stripe, Resend, Expo)
  live only in their `infrastructure/` adapter, behind a port interface,
  never inline in an HTTP handler.
- To add a new outbound dependency: define a port in `application/ports/`,
  implement it under `infrastructure/`, and wire it in `composition/`.
- The Stripe secret key and Resend API key only ever exist here (loaded
  via `infrastructure/config/env.ts`) — never send them to or accept them
  from the mobile app.

## Conventions / gotchas

- All monetary amounts arrive from the mobile app in major currency
  units (e.g. dollars, not cents). The `Money` value object
  (`domain/payment/Money.ts`) owns this rule — convert to the smallest
  currency unit (`Money.toMinorUnits()`, `Math.round(amount * 100)`) only
  at the Stripe API boundary, inside the Stripe adapter.
- `success_url`/`cancel_url` for Checkout Sessions point at this
  server's own static `/payment-success` / `/payment-cancelled` pages —
  there is no separate web app to redirect to.
- The `/webhooks/stripe` route verifies the Stripe signature
  (`STRIPE_WEBHOOK_SECRET`) but does not persist anything (no DB) — it's
  a log/extension point. The actual "did it get paid" signal the mobile
  app relies on is the `GET /payment-links/:sessionId/status` polling
  endpoint, which proxies `stripe.checkout.sessions.retrieve`.

## Commands

- `pnpm --filter server run dev` — start with hot reload
- `pnpm --filter server run build` — typecheck + compile to `dist/`
- `pnpm --filter server exec tsc --noEmit` — typecheck only
