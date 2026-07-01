# Architecture Decision Records (ADRs)

This folder records **decisions worth explaining** — the ones where the code
alone doesn't make the *why* obvious, where we deliberately diverged from a
pattern used elsewhere, or where a future reader might otherwise "fix" something
that was chosen on purpose.

An ADR is not documentation of *what* the code does (the code and `CLAUDE.md`
already cover that). It captures **the decision, the alternatives, and the
trade-off** so the reasoning survives the people who were in the room.

## When to write one

Write an ADR when a change involves any of:

- a **non-obvious trade-off** you'd want to defend later (performance vs.
  simplicity, safety vs. convenience),
- a **deliberate divergence** from an existing convention in the codebase,
- a choice that is **cheap to make now, expensive to reverse** later,
- something a reviewer or a future contributor is likely to question or undo.

Skip it for routine, self-evident changes — an ADR you'd never re-read is noise.

## Format

We keep them **lightweight and prose-first**, matching
[`0001`](0001-vehicle-photo-files-lazy-copy-at-save.md): a title stating the
decision, then a few paragraphs covering **what we chose, what we chose it over,
and the trade-off we accepted**. No mandatory template — clarity over ceremony.
If a record grows complex, structure it with *Context / Decision / Consequences*
headings, but don't pad a simple decision to fit a form.

Conventions:

- **One file per decision**, named `NNNN-kebab-case-title.md`, numbered
  sequentially (`0001`, `0002`, …). The number is an identity, not a ranking.
- The **title is the decision**, phrased as a statement — e.g. *"Vehicle photo
  files are copied to permanent storage lazily, at save"* — so the index reads as
  a list of choices.
- ADRs are **immutable once merged**. Don't rewrite history: if a later decision
  overrides an earlier one, add a new ADR and note that it supersedes the old.

## Adding an ADR

1. Copy the numbering: next unused `NNNN`.
2. Create `apps/mobile/docs/adr/NNNN-your-decision.md`.
3. State the decision in the title; explain the alternative and the trade-off.
4. Add a row to the index below.

## Index

| # | Decision | Area |
|---|---|---|
| [0001](0001-vehicle-photo-files-lazy-copy-at-save.md) | Vehicle photo files are copied to permanent storage lazily, at save | Fleet · file storage |
