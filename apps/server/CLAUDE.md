# Project

Stateless Stripe payment-link backend for the car-rental mobile app.
Creates Stripe Checkout Sessions, emails the link via Resend, and lets
the mobile app poll a session's status. On payment, a RabbitMQ event
fans the side effects (company push + customer confirmation email) out to
a separate worker. No database — Stripe is the single source of truth for
payment state; RabbitMQ is a transport, not a store.

## Tech stack

- Node + Express + TypeScript (CommonJS)
- `stripe` SDK
- `resend` SDK for transactional email
- `amqplib` (RabbitMQ) for the payment side-effect bus
- `tsx` for local dev (`pnpm --filter server run dev`)
- `docker compose` for a local RabbitMQ broker (`docker-compose.yml`)

## Architecture

**Vertical slices** (one folder per feature), each internally **hexagonal**
(ports & adapters with a DDD domain). Dependencies point inward toward the
slice's `domain` (which depends on nothing); provider SDKs (Stripe, Resend,
Expo, Anthropic) live only at the edges. A slice never imports another slice —
shared plumbing lives in `shared/`.

```
src/
  shared/                Cross-cutting kernel (no feature logic, no slice imports).
    config/env.ts        Typed env loading.
    http/                Express app factory (createApp) + static/health pages.
    messaging/           Generic RabbitMqConnection (knows no topology).
  features/
    payments/            Stripe links, status polling, webhook, side-effect bus.
      domain/            Pure VOs/entities: Money (major→minor rule), PaymentKind,
                         PaymentLinkRequest, CheckoutSession, CompanyNotification,
                         PaymentCompletedEvent.
      application/
        ports/           PaymentGateway, EmailSender, PushNotifier, EventPublisher.
        usecases/        API: CreatePaymentLink, GetPaymentStatus,
                         PublishPaymentCompleted. Worker: HandlePaymentCompleted,
                         NotifyOnPaymentCompleted, SendPaymentConfirmationEmail.
      infrastructure/    Adapters: stripe/ resend/ expo/ rabbitmq/ http/.
      payments.api.ts    Slice composition (API): outbound adapters + publisher
                         → inbound routers.
      payments.worker.ts Slice composition (worker): consumer + side effects.
    vehicle-recognition/ Claude-vision pre-fill of a vehicle from photos.
      domain/            RecognizedVehicleDraft.
      application/       port VehicleImageAnalyzer, usecase AnalyzeVehiclePhotos.
      infrastructure/    anthropic/ (Claude adapter) + http/ controller.
      vehicle-recognition.api.ts  Slice composition (API).
  composition/
    container.ts         API root: builds each slice, assembles the app.
    worker.ts            Worker root: starts each slice's consumers.
  index.ts               API entry point.
  worker.ts              Worker entry point.
```

Two processes share this code: the **API** (`index.ts`) serves HTTP and
*publishes* `payment.completed`; the **worker** (`worker.ts`) *consumes*
it and runs the side effects. They communicate only through RabbitMQ.

> **Why vertical slices, the dependency rules, and how to add a feature:**
> see [`docs/architecture.md`](docs/architecture.md).

### Payment side-effect bus (RabbitMQ)

- Topology lives in `features/payments/infrastructure/rabbitmq/topology.ts`
  (asserted idempotently by both processes): exchange `payments` (topic) →
  queue `payment.completed.q`; failures dead-letter to `payments.dlx` →
  `payment.completed.dlq` (parking lot).
- The webhook ACKs Stripe fast by only publishing; push + email happen in
  the worker with retry/dead-letter, so a provider outage no longer loses
  the notification (the old inline path swallowed those errors).
- All event data travels in the Stripe session metadata
  (`rentalId`, `customerEmail`, `customerName`, `amount`, `currency`,
  push fields) — the worker stays stateless, no DB.

> **Visual workflow, diagrams and a RabbitMQ primer:** see
> [`docs/payment-bus.md`](docs/payment-bus.md).

- No persistence layer here. Never add a database "to make this
  easier" — if a use case needs to remember something across requests,
  that's a sign the state belongs in the mobile app's SQLite (synced via
  a request param), not in this server.
- Business rules live in a slice's `domain/` and `application/` — never in a
  controller or an adapter. Provider SDK calls live only in that slice's
  `infrastructure/` adapter, behind a port interface, never inline in an
  HTTP handler.
- **Add a feature** → new folder under `features/`, with its own
  domain/application/infrastructure and a `*.api.ts` (and `*.worker.ts` if it
  consumes events) composition module wired in `composition/`.
- **Add an outbound dependency to a slice** → define a port in that slice's
  `application/ports/`, implement it under its `infrastructure/`, wire it in
  the slice's composition module.
- Slices must not import each other; promote anything genuinely shared to
  `shared/` (which never imports a slice).
- The Stripe / Resend / Anthropic secrets only ever exist here (loaded via
  `shared/config/env.ts`) — never send them to or accept them from the
  mobile app.

## Conventions / gotchas

- All monetary amounts arrive from the mobile app in major currency
  units (e.g. dollars, not cents). The `Money` value object
  (`features/payments/domain/Money.ts`) owns this rule — convert to the smallest
  currency unit (`Money.toMinorUnits()`, `Math.round(amount * 100)`) only
  at the Stripe API boundary, inside the Stripe adapter.
- `success_url`/`cancel_url` for Checkout Sessions point at this
  server's own static `/payment-success` / `/payment-cancelled` pages —
  there is no separate web app to redirect to.
- The `/webhooks/stripe` route verifies the Stripe signature
  (`STRIPE_WEBHOOK_SECRET`), then *publishes* a `payment.completed` event.
  If publishing fails it returns **500** so Stripe redelivers — with no DB,
  letting Stripe retry is how we avoid losing the event. It still does not
  persist anything. The "did it get paid" signal the mobile app polls is
  unchanged: `GET /payment-links/:sessionId/status`, which proxies
  `stripe.checkout.sessions.retrieve`.
- Worker delivery is **at-least-once**: a retry may re-run a side effect
  that already succeeded (e.g. a duplicate push). Keep side effects
  tolerant of that.

## Commands

- `docker compose -f apps/server/docker-compose.yml up -d` — start RabbitMQ
  (AMQP `:5672`, management UI `:15672`, guest/guest)
- `pnpm --filter server run dev` — start the API with hot reload
- `pnpm --filter server run worker` — start the worker with hot reload
- `pnpm --filter server run build` — typecheck + compile to `dist/`
- `pnpm --filter server exec tsc --noEmit` — typecheck only
