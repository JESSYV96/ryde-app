# Architecture Decision Records (ADRs)

This folder records **decisions worth explaining** — the ones where the code
alone doesn't make the *why* obvious, where we deliberately diverged from a
common pattern, or where a future reader might otherwise "fix" something that was
chosen on purpose.

An ADR is not documentation of *what* the code does (the code, `CLAUDE.md`, and
the deep-dive docs already cover that). It captures **the decision, the
alternatives, and the trade-off** so the reasoning survives the people who were
in the room.

The narrative deep-dives in [`../architecture.md`](../architecture.md) and
[`../payment-bus.md`](../payment-bus.md) explain *how the system works today*;
the ADRs here freeze *why we decided it that way* at a point in time.

## When to write one

Write an ADR when a change involves any of:

- a **non-obvious trade-off** you'd want to defend later (reliability vs.
  simplicity, statelessness vs. convenience),
- a **deliberate divergence** from a common/expected pattern,
- a choice that is **cheap to make now, expensive to reverse** later (e.g.
  introducing — or refusing — a datastore),
- something a reviewer or a future contributor is likely to question or undo.

Skip it for routine, self-evident changes — an ADR you'd never re-read is noise.

## Format

We keep them **lightweight and prose-first**: a title stating the decision, then
a few paragraphs covering **what we chose, what we chose it over, and the
trade-off we accepted**. No mandatory template — clarity over ceremony. If a
record grows complex, structure it with *Context / Decision / Consequences*
headings, but don't pad a simple decision to fit a form.

Conventions:

- **One file per decision**, named `NNNN-kebab-case-title.md`, numbered
  sequentially (`0001`, `0002`, …). The number is an identity, not a ranking.
- The **title is the decision**, phrased as a statement — so the index reads as a
  list of choices.
- ADRs are **immutable once merged**. Don't rewrite history: if a later decision
  overrides an earlier one, add a new ADR and note that it supersedes the old.

## Adding an ADR

1. Take the next unused `NNNN`.
2. Create `apps/server/docs/adr/NNNN-your-decision.md`.
3. State the decision in the title; explain the alternative and the trade-off.
4. Add a row to the index below.

## Index

| # | Decision | Area |
|---|---|---|
| [0001](0001-vertical-slices-over-horizontal-layers.md) | Organize by vertical slice, hexagonal inside each, over horizontal layers | Whole server |
| [0002](0002-no-database-stripe-is-source-of-truth.md) | No database — Stripe is the source of truth for payment state | Payments · state |
| [0003](0003-async-side-effect-bus-over-inline-webhook.md) | Fan payment side effects out through RabbitMQ instead of running them inline in the webhook | Payments · reliability |
