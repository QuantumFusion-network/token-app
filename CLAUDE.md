# CLAUDE.md

AI context file for QF Network Asset Manager. See full docs in [README](README.md), [Architecture](docs/ARCHITECTURE.md), and [Development](docs/DEVELOPMENT.md).

## Code Quality Rules

**TypeScript:**
- No `any`, no `as` assertions. Use `unknown` and narrowing.
- Let TypeScript infer types; avoid redundant annotations.
- Prefer discriminated unions for state.

**State Management:**
- **UI state**: `useState` only. NEVER `useReducer`.
- **Shared state**: Context API (`src/contexts/`).
- **Server state**: TanStack Query (`src/lib/query/`).
- Keep components presentational; logic goes in hooks or pure functions.

**Architecture:**
- Use barrel files (`index.ts`). Import from `@/lib`, `@/components`.
- Business logic: `lib/` (pure) or `hooks/` (React).
- Balance conversions: always use `toPlanck`/`fromPlanck` from `@/lib`.

## Quick Reference

See [Development Guide](docs/DEVELOPMENT.md#available-scripts) for all available commands.

## Project Structure

See [Architecture Guide](docs/ARCHITECTURE.md#key-directories) for detailed structure.

## Key Conventions

- **Decimals**: Native QF is 18. UI defaults created assets to 12.
- **Balance**: Use `toPlanck`/`fromPlanck` (import from `@/lib`) for all conversions.
- **Toasts**: 30s duration (Sonner).
- **Queries**: 30s stale time, 5min GC.
