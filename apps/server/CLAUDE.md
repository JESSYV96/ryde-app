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

- No persistence layer here. Never add a database "to make this
  easier" — if a route needs to remember something across requests,
  that's a sign the state belongs in the mobile app's SQLite (synced via
  a request param), not in this server.
- Routes live in `src/routes/`, one file per resource. Provider calls
  (Stripe, Resend) live in `src/services/`, never inline in a route
  handler.
- The Stripe secret key and Resend API key only ever exist here — never
  send them to or accept them from the mobile app.

## Conventions / gotchas

- All monetary amounts arrive from the mobile app in major currency
  units (e.g. dollars, not cents) — convert to the smallest currency
  unit (`Math.round(amount * 100)`) only at the Stripe API boundary.
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
