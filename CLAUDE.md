# Monorepo

pnpm workspace with two apps. Each has its own `CLAUDE.md` for
app-specific tech stack, architecture, and conventions — read it before
working inside that app.

```
apps/
  mobile/   — the Expo car-rental app (see apps/mobile/CLAUDE.md)
  server/   — Stripe payment-link backend (see apps/server/CLAUDE.md)
```

## Cross-app conventions

- Run commands scoped to one app via pnpm filters from the repo root,
  e.g. `pnpm --filter mobile run start`, `pnpm --filter server run dev`.
- `pnpm install` at the repo root installs for all apps (single
  `pnpm-lock.yaml` at the root — do not add per-app lockfiles).
- The mobile app never talks to Stripe/Resend directly — it only calls
  `apps/server`'s HTTP API. No payment-provider secret key may live in
  `apps/mobile`.
- Ask before making cross-cutting architecture decisions (new app, new
  shared package, new external service) — same rule as each app's own
  CLAUDE.md.
