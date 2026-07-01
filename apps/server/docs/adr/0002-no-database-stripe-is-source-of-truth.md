# No database — Stripe is the source of truth for payment state

This server persists **nothing**. It has no database, and it never adds one "to
make a use case easier." Stripe holds the authoritative payment state; the mobile
app holds everything else in its own on-device SQLite. Every field a later step
needs — `rentalId`, `customerEmail`, `customerName`, `amount`, `currency`, push
fields — travels **in the Stripe session metadata**, so the webhook and worker can
act on a completed payment without looking anything up. Status polling
(`GET /payment-links/:id/status`) proxies `stripe.checkout.sessions.retrieve`
rather than reading a local record.

We chose statelessness over a datastore because the only durable state here is
payment state, and Stripe already owns it authoritatively — duplicating it into a
local DB would buy us a second source of truth to keep in sync, plus migrations,
backups, and consistency bugs, for no capability we lack. Passing context through
session metadata keeps each process a pure function of its input, which makes the
two processes (API and worker) trivially horizontally scalable and the whole
service cheap to deploy.

The trade-off is real and deliberate: if a feature seems to *need* to remember
something across requests, that is a **design signal**, not a reason to add a
database — the state almost always belongs in the mobile app's SQLite (synced via
a request param), not here. This constraint is also what makes
[ADR 0003](0003-async-side-effect-bus-over-inline-webhook.md) lean on Stripe's
webhook retry as its safety net instead of an outbox table. Anyone tempted to add
persistence should treat it as an architecture decision requiring a new ADR that
supersedes this one, not a local convenience.
