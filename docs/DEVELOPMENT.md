# Development Guide

## Environment Setup

### Prerequisites
- **Node.js**: v18 or higher
- **pnpm**: Package manager
- **Wallet**: A Polkadot-compatible wallet extension (e.g., Talisman, SubWallet)

### Installation

```bash
# 1. Clone the repository
git clone <repo-url>

# 2. Install dependencies
pnpm install

# 3. Generate Polkadot API descriptors
# This fetches chain metadata and generates type-safe bindings
pnpm papi
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start the development server (Vite) |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview the production build locally |
| `pnpm lint` | Fix linting issues (ESLint) |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run unit tests (Vitest) |
| `pnpm test:e2e` | Run end-to-end tests (Playwright) |

## Coding Standards

### TypeScript
- **Strict Typing**: Never use `any`. Use `unknown` or narrow types.
- **Type Safety**: Avoid type assertions (`as`). Let TypeScript infer or prove correctness.
- **Inference**: Do not manually type obvious variables (e.g., `const x = 5` is better than `const x: number = 5`).

### React Patterns
- **Components**: strictly presentational. Keep logic in hooks/lib.
- **Imports**: Use barrel files (`index.ts`) for clean imports (e.g., `import { ... } from '@/components'`).
- **Styling**: Tailwind CSS with `shadcn/ui` components. Use `cn()` for class merging.

## Blockchain Specifics

### Network Details
- **Network**: QF Network Testnet
- **Endpoint**: `wss://test.qfnetwork.xyz`
- **Faucet**: [https://faucet.qfnetwork.xyz](https://faucet.qfnetwork.xyz)
- **Native Token**: QF
- **Decimals**: 18 (Native QF). Note that created assets default to 12 decimals in the UI, but the system supports arbitrary precision.

### Polkadot API (PAPI)
- **Descriptors**: Located in `.papi/descriptors`.
- **Metadata**: Stored in `.papi/metadata`.
- **Regeneration**: Run `pnpm papi` if chain metadata changes.

## Utility Guides

### Balance Handling
The app uses `bigint` for all chain values (Planck) and `string` for UI inputs to avoid floating-point errors.

**Key Functions (`src/lib/balance/`):**

- **`toPlanck(value: string, decimals: number = 18): bigint`**
  Converts user input ("1.5") to chain units (1500000000000n).

- **`fromPlanck(value: bigint, decimals: number = 18, options?): string`**
  Converts chain units back to a human-readable string.
  Options: `{ fixed?: boolean }` (pad decimals)

- **`formatBalance(value: string, options?: FormatBalanceOptions): string`**
  Formats a string number for display (e.g., "1,234.56 QF").
  Options: `locale`, `symbol`, `displayDecimals`, `mode` ('floor'|'round'|'ceil').

## Testing

### Unit Tests (Vitest)
Located in `__tests__/`. Focus on business logic (`lib/`) and hooks.

```bash
pnpm test          # Run all
pnpm test:watch    # Watch mode
pnpm test:coverage # Coverage report
```

### E2E Tests (Playwright)
Located in `e2e/`. Tests full user flows against the testnet (or mock).

```bash
pnpm test:e2e      # Run headless
pnpm test:e2e:ui   # Open interactive UI
```

