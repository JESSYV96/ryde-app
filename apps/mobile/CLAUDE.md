# Project

This project is quote generator for independant car rental company.

## Tech stack

- React native + Expo + Typescript
- Expo-router
- Zustand
- expo-print (HTML/CSS template -> PDF) 
- expo-sharing (OS share sheet)
- expo/ui fall back to plain React Native components
- expo-sqlite
- expo-camera
- expo-file-system
- tanstack/react-form
- tanstack/react-query
- i18n FR / ENG
- dayjs 
 

## Architecture

- MVVM
- organized by business feature (bounded context), not by technical layer
- Atomic design
- Follow ubiquitous language: name each feature/bounded with business term, not the entity
- Respect DRY principle, ask me before take a decision

```
src/
  app/                      
  features/
    example/
      model/               
      view/                 
      viewmodel/            
      services/             
      repository/           
  shared/
    ui/                     
      components/             
      design-system/             
    persistence/            
    utils/
  store/
```

## Coding style

- MUST use arrow functions over default functions
- MUST use type only for models otherwise use interface 
- DON'T wrap a single return value in an object/interface
- Types MUST in /types folder
- Define a type in the context that owns it, even if structurally identical
  to another type elsewhere — don't reuse a shared/cross-feature type as a
  stand-in for a feature-local concept.
- SHOULD init value over let then empty
- Every `useXViewModel` MUST export `interface UseXViewModelResult extends
  ReturnType<typeof useXViewModel> {}` right after the hook — gives the
  hook's return shape a discoverable name (hover/autocomplete) without
  manually duplicating field types (e.g. TanStack Form's generics), and it
  stays in sync automatically since it's derived from the hook itself.
 

## Commands

- `npx expo start` — start the dev server
- `npx tsc --noEmit` — typecheck
- `npx eslint .` — lint
- `npm test` — run tests (once a test setup is added)

## Conventions / gotchas

- DON'T import `@react-navigation/*` directly — SDK 56's expo-router no
  longer supports that in app code; use `expo-router` exports.
- DON'T use `@expo/ui`'s `DateTimePicker` (`@expo/ui/community/datetime-picker`)
  — on Android it serializes the local date as a fake UTC instant
  (`toISOString()`) before handing it to the native picker, causing a
  date shift near local midnight in negative-UTC-offset timezones, with
  no prop available to fix it. `DateField` uses
  `@react-native-community/datetimepicker` instead, on both platforms.
- DON'T use `@tanstack/zod-form-adapter` — deprecated; pass zod schemas
  straight to TanStack Form's Standard-Schema-aware validators.
- Keep `src/app/` route files thin — they should just compose a feature's
  View + ViewModel, not contain logic.
- SHOULD use promise async/await over promise then/catch
- MUST use Typescript strict, DON'T use any
- MUST Use tanstack form
- NEVER query SQLite directly from a viewmodel or component.
- Before falling back to plain React Native for a missing `@expo/ui`
  component, check in this order: (1) `@expo/ui`'s universal package (root
  import — e.g. `Host`, `Button`, `List`, `ListItem`, `FieldGroup`,
  `TextInput`, `Picker`, `Slider`, `Checkbox`, `Switch`, `BottomSheet`,
  `Collapsible`), (2) the platform-specific packages
  (`@expo/ui/swift-ui` for iOS, `@expo/ui/jetpack-compose` for Android) for
  a component not in the universal set. Only write a plain RN component
  once none of those have a fit. Prefer composing an existing primitive
  (e.g. `List`/`ListItem` for a tappable row of content) over inventing a
  custom plain-RN container that duplicates one.
- MUST create object as const type when exhautive list
- Before implementing a fix or explanation based on assumed library/runtime
  behavior (e.g. a test warning, a library's internal scheduling), verify it
  against the official docs (Context7) first — state whether the docs confirm
  or contradict the assumption before writing the fix, instead of presenting
  a guess as fact.
  
