# Development Guide

This guide covers development workflows, coding standards, and testing procedures. For initial setup and installation, please refer to the [README](../README.md#installation).

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server (Vite) |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build locally |
| `pnpm lint` | Fix linting issues (ESLint) |
| `pnpm lint:check` | Check for linting issues without fixing |
| `pnpm format` | Format code with Prettier |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:e2e` | Run end-to-end tests (Playwright) |
| `pnpm deploy` | Build and deploy to Cloudflare Workers |

## Coding Standards

### TypeScript

- **Strict Typing**: Never use `any`. Use `unknown` or narrow types.
- **Type Safety**: Avoid type assertions (`as`). Let TypeScript infer or prove correctness.
- **Inference**: Do not manually type obvious variables (e.g., `const x = 5` is better than `const x: number = 5`).

### React Patterns

- **Components**: Strictly presentational. Keep logic in hooks/lib.
- **Imports**: Use barrel files (`index.ts`) for clean imports (e.g., `import { ... } from '@/components'`).
- **Styling**: Tailwind CSS with `shadcn/ui` components. Use `cn()` for class merging.

## Blockchain Specifics

### Network Details

- **Network**: QF Network Testnet
- **Endpoint**: `wss://test.qfnetwork.xyz`
- **Native Token**: QF
- **Decimals**: 18 (Native QF). Note that created assets default to 12 decimals in the UI, but the system supports arbitrary precision.

### Polkadot API (PAPI)

- **Descriptors**: Located in `.papi/descriptors`
- **Metadata**: Stored in `.papi/metadata`
- **Regeneration**: Descriptors are automatically generated on `pnpm install`. To regenerate manually, run `pnpm exec papi` or delete `.papi/` and reinstall.

## Utility Guides

### Balance Handling

The app uses `bigint` for all chain values (Planck) and `string` for UI inputs to avoid floating-point errors.

**Key Functions** (import from `@/lib`):

- **`toPlanck(value: string, decimals: number = 18): bigint`**
  Converts user input ("1.5") to chain units (1500000000000n).

- **`fromPlanck(value: bigint, decimals: number = 18, options?): string`**
  Converts chain units back to a human-readable string.
  Options: `{ fixed?: boolean }` (pad decimals).

- **`formatBalance(value: string, options?: FormatBalanceOptions): string`**
  Formats a string number for display (e.g., "1,234.56 QF").
  Options: `locale`, `symbol`, `displayDecimals`, `mode` ('floor'|'round'|'ceil').

## Testing

### Unit Tests (Vitest)

Located in `src/__tests__/`. Focus on business logic (`lib/`) and hooks.

```bash
pnpm test          # Run all tests
pnpm test:watch    # Watch mode
pnpm test:ui       # Interactive UI
pnpm test:coverage # Coverage report
```

### E2E Tests (Playwright)

Located in `e2e/`. Tests full user flows against the testnet.

```bash
pnpm test:e2e         # Run headless
pnpm test:e2e:ui      # Interactive UI
pnpm test:e2e:headed  # Run with browser visible
```
