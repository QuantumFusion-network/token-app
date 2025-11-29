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
- **Exports**: Use barrel files (`index.ts`). Import from `@/lib`, `@/components`;avoid * exports
- **Logic**: Business logic belongs in `lib/` (pure) or `hooks/` (React).

## Key Commands

```bash
pnpm dev          # Start server
pnpm papi         # Generate Polkadot API descriptors
pnpm test         # Unit tests (Vitest)
pnpm test:e2e     # E2E tests (Playwright)
pnpm lint         # Lint check
```

## Project Structure

- `src/contexts/`: Global state (Wallet, Connection, Transaction).
- `src/hooks/`: Capabilities (Transactions, Asset Mutations).
- `src/lib/`: Pure logic (PAPI builders, Balance utils, Storage).
- `src/components/`:
  - `account/`: Wallet connection.
  - `asset-management/`: Create/Mint/Burn forms.
  - `transaction-ui/`: Transaction feedback.

## Key Conventions

- **Network**: QF Network Testnet (`wss://test.qfnetwork.xyz`).
- **Decimals**: Native QF is 18. UI defaults created assets to 12.
- **Balance**: Use `toPlanck`/`fromPlanck` (in `@/lib`) for all conversions.
- **Toasts**: 30s duration (Sonner).
- **Queries**: 30s stale time, 5min GC.
