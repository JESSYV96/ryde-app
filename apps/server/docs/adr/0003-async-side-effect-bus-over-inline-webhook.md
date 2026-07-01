# Fan payment side effects out through RabbitMQ instead of running them inline in the webhook

When a Stripe payment completes, two side effects follow: a push notification to
the company and a confirmation email to the customer. The Stripe webhook no longer
runs them itself. It **verifies the signature, publishes a `payment.completed`
event to RabbitMQ, and ACKs Stripe immediately**; a separate **worker** consumes
the event and runs the side effects with retries and a dead-letter queue. If
publishing fails, the webhook returns **500** so Stripe redelivers — with no
database ([ADR 0002](0002-no-database-stripe-is-source-of-truth.md)), Stripe's
own retry is the safety net. Topology and guarantees are detailed in
[`../payment-bus.md`](../payment-bus.md).

We chose this over the previous design, where the webhook ran both side effects
**inline and synchronously and swallowed any error**. That older path had two
faults: a transient Expo or Resend outage meant a **silently lost** notification
with no retry, and slow provider calls held the webhook open, risking Stripe
timeouts and redelivery of work that had partly run. Decoupling the fast ACK from
the slow side effects fixes both: Stripe is answered in milliseconds, and the
side effects get real retry semantics with a dead-letter parking lot for
inspection and replay instead of vanishing.

The trade-offs we accept: an added moving part (a RabbitMQ broker and a second
process to run and monitor), and **at-least-once delivery** — a retry can re-run a
side effect that already succeeded, so a customer might get a duplicate push.
Side effects must therefore be tolerant of being run more than once. We judged
reliability (never losing a paid-customer notification) worth the operational cost
and the idempotency discipline. RabbitMQ here is strictly a **transport, not a
datastore**, which keeps this consistent with ADR 0002.
