---
name: create-screen
description: Create a new screen following MVVM architecture
---

## Where logic goes
- **View**: rendering only. No business logic, no direct repository/service calls.
- **ViewModel**: a hook that owns local UI state, calls services/repositories,
  exposes data + actions to the View. This is where TanStack Form instances
  are created and wired to zod schemas.
- **Service**: stateless-ish helpers a viewmodel calls (PDF generation, photo
  file management). Not React hooks themselves.
- **Repository**: the only thing allowed to touch expo-sqlite. Defined as an
  interface in the feature's `repository/` folder; the local SQLite
  implementation is swapped later for a remote/TanStack-Query-backed one
  without the viewmodel changing.

## Naming conventions
- Views: PascalCase, suffix `View`
- Viewmodels: hook, suffix `ViewModel`
- Models: `rental.types.ts` (types), `rental.schema.ts` (zod schemas)
- Repositories: `RentalRepository.ts` (interface), `SqliteRentalRepository.ts` (impl)
- Routes (`src/app/`): expo-router file conventions (`_layout.tsx`, `[id].tsx`, etc.)
- keep route files thin: import a feature's top-level View + ViewModel and render.

## Rules
- Form's built-in Standard Schema support (pass the zod schema directly to
  `validators.onChange` / `onBlur` etc., — do NOT add `@tanstack/zod-form-adapter`
  it is deprecated).

## State management: what goes where

- **TanStack Form**: all form field state + validation for the rental intake
  form (and any other multi-field form). Don't duplicate form field values
  into Zustand or component state.
- **Local component/hook state** (`useState` inside a viewmodel): UI-only,
  ephemeral state scoped to one screen/flow (e.g. "which photo is selected",
  "is the camera open").
- **Zustand**: state that needs to be shared across features/screens or
  outlive a single screen's mount — e.g. the in-progress rental draft while
  navigating between the form, camera, and PDF-preview screens; app-wide
  settings. Keep stores small and feature-scoped where possible (avoid one
  giant global store).
- **TanStack Query** is reserved for once a backend exists — not wired in
  yet. Do not put server-shaped cached data in Zustand in the meantime; when
  a backend is added, that's what TanStack Query is for, not a Zustand
  workaround.

When creating a screen:

1. Create screen component and use Screen Wrapper
2. Create ViewModel hook
3. Create Zustand store if needed
4. Create Zustand store if needed
5. Create tests by following testing rules
6. Use expo-ui components
7. Use tokens, don't hard code