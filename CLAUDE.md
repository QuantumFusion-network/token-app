# CLAUDE.md

QF Network Asset Manager - Context & Rules

## Documentation References
- **[Architecture](docs/ARCHITECTURE.md)**: State management, providers, transaction lifecycle.
- **[Development](docs/DEVELOPMENT.md)**: Setup, testing, balance utilities API.

## Code Quality Rules (Apply to Every Change)

**TypeScript:**
- **Strict**: No `any`, no `as` assertions. Use `unknown` and narrowing.
- **Inference**: Avoid redundant type definitions.
- **Types**: Prefer discriminated unions for state.

**State Management:**
- **UI**: `useState` only. NEVER `useReducer`.
- **Shared**: Context API (`src/contexts/`).
- **Server**: TanStack Query (`src/lib/query/`).
- **Logic**: Keep components presentational; use hooks (`src/hooks/`) and pure functions (`src/lib/`).

**Architecture:**
- **Exports**: Use barrel files (`index.ts`). Import from `@/lib`, `@/components`. Avoid `*` exports
- **Logic**: Business logic belongs in `lib/` (pure) or `hooks/` (React)

## Key Commands

```bash
pnpm dev          # Start development server
pnpm test         # Run unit tests (Vitest)
pnpm test:e2e     # Run E2E tests (Playwright)
pnpm lint         # Fix linting issues
pnpm typecheck    # Type check
```

Note: Polkadot API descriptors are automatically generated on `pnpm install` via postinstall hook.

## Project Structure

- `src/contexts/`: Global state providers (Wallet, Connection, Transaction)
- `src/hooks/`: Capability composition (useTransaction, useAssetMutation)
- `src/lib/`: Pure business logic (PAPI builders, balance utils, storage)
- `src/components/`:
  - `account/`: Wallet connection UI
  - `asset-management/`: Asset forms (Create/Mint/Transfer/Destroy)
  - `transaction-ui/`: Transaction feedback components

## Key Conventions

- **Network**: QF Network Testnet (`wss://test.qfnetwork.xyz`).
- **Decimals**: Native QF is 18. UI defaults created assets to 12.
- **Balance**: Use `toPlanck`/`fromPlanck` (import from `@/lib`) for all conversions
- **Toasts**: 30s duration (Sonner).
- **Queries**: 30s stale time, 5min GC.
