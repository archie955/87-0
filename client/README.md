# client

React 19 + TypeScript frontend for 87-0, built with Vite.

## Setup

```bash
npm install
npm run dev
```

The dev server proxies `/api/*` to `http://localhost:8000` (see `vite.config.ts`), so it expects the backend (see `../server/README.md`) to already be running there.

## Tests

```bash
npx vitest run          # once
npx vitest               # watch mode
```

`testSetup.ts` mocks every network-touching service (`@/services/*`) and resets every Zustand store between tests. `tests/test-utils.tsx` exports a `render()` that wraps the same providers the real app tree does (`QueryClientProvider`, a router, `<Notification />`) - import `render`/`screen`/etc. from there rather than directly from `@testing-library/react` in new test files, or hooks that depend on those providers will throw.

## Linting, formatting, type checking

```bash
npx tsc -b --force        # type check
npx oxlint --type-aware   # lint
npx prettier . --write    # format
```

## Building the application locally

`tsconfig.app.json` and `tsconfig.node.json` are invoked by build. `tsconfig.json` is for development, and references the tests.

```bash
npm run build
```

## Project layout

- `src/pages/` - top-level routed views
- `src/components/` - everything else, including `components/ui/` (shadcn-generated primitives)
- `src/hooks/` - data-fetching hooks (React Query) and other reusable logic
- `src/stores/` - Zustand stores for client-only state (notifications, the login/register toggle, the ruleset preference)
- `src/services/` - the actual `axios` calls, one file per backend resource
- `src/types/` - shared TypeScript types, generally mirroring the backend's Pydantic schemas
