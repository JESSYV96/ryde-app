---
name: testing 
description: Add test for business logic
---

## Testing pattern

- MUST follow AAA (Arrange-Act-Assert) pattern

## Testing viewmodels (TanStack Query hooks)

Viewmodels take an optional `deps` param defaulting to the real repository
singleton(s) (DIP — see repository `*Interface` types), so tests inject a
fake repository instead of `jest.mock`.

1. Build a fake repository object implementing the relevant
   `*RepositoryInterface` inline in the test — implement only the methods
   the test exercises; have the rest `throw new Error('not implemented')`.
2. Wrap the hook in a `QueryClientProvider` (`new QueryClient({
   defaultOptions: { queries: { retry: false } } })`) — any viewmodel
   using `useQuery`/`useMutation` needs that context; `renderHook` alone
   doesn't provide it. This needs JSX, so the file MUST be `.test.tsx`,
   not `.test.ts`.
3. `@testing-library/react-native`'s `renderHook` returns a `Promise`
   (unlike `@testing-library/react`'s sync version) — always `await
   renderHook(...)`.
4. After rendering, `await waitFor(() => expect(result.current.isLoading).toBe(false))`
   before asserting on query-derived data.
5. Any state-updating call made directly on `result.current` (i.e. not
   through a simulated user event) must be `await act(() =>
   result.current.someHandler(...))`. This library's `act` always returns
   a `Promise`, even for a synchronous callback — omitting `await` lets
   the next assertion run before the update flushes, silently dropping it
   (and can leak into the next test).