# QF Network Asset Manager

A React 19 application for managing assets on the QF Network testnet. Built with TypeScript, polkadot-api, and modern React patterns.

## Features

- **Wallet Connection**: Connect to Polkadot-compatible wallets (Talisman, SubWallet, etc.)
- **Asset Management**: Create, mint, transfer, and destroy fungible assets
- **Real-time Balance Tracking**: Live updates of asset balances and metadata
- **Transaction Lifecycle**: Full visibility into transaction status from signing to finalization
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages

## Tech Stack

- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety throughout
- **polkadot-api (PAPI)** - Type-safe Polkadot blockchain interactions
- **TanStack Query** - Server state management with caching
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible component library
- **Vite** - Fast build tooling
- **Vitest** - Unit testing

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- A Polkadot-compatible wallet extension

### Installation

```bash
# Install dependencies
pnpm install

# Generate polkadot-api descriptors
pnpm papi

# Start development server
pnpm dev
```

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm lint         # Run ESLint
pnpm lint:check   # Check linting without fixing
pnpm typecheck    # Run TypeScript type checking
pnpm test         # Run tests with Vitest
```

## Project Structure

```
src/
├── components/       # UI components (exported via barrel)
│   ├── ui/          # shadcn/ui components
│   └── error-boundaries/  # Error boundary components
├── contexts/        # React Context providers
│   ├── WalletContext.tsx
│   ├── ConnectionContext.tsx
│   └── TransactionContext.tsx
├── hooks/           # Custom React hooks (exported via barrel)
│   ├── useWallet.ts
│   ├── useConnectionStatus.ts
│   ├── useTransaction.ts
│   └── ...
├── lib/             # Business logic and utilities (exported via barrel)
│   ├── balance/     # Balance conversion and formatting
│   ├── assetOperations.ts
│   ├── errorParsing.ts
│   └── ...
└── __tests__/       # Test files
```

## Architecture Highlights

### State Management

- **Wallet State**: Context-based wallet connection and account management
- **Connection State**: Polkadot API client with auto-reconnect
- **Transaction State**: Lifecycle tracking for all blockchain transactions
- **Server State**: TanStack Query for asset data and balances

### Balance Utilities

The app includes robust utilities for working with blockchain token amounts:

```ts
import { toPlanck, fromPlanck, formatBalance } from '@/lib'

// Convert user input to Planck units (smallest denomination)
const amount = toPlanck("1.5", 18) // 1500000000000000000n

// Convert Planck units to human-readable
const readable = fromPlanck(1500000000000000000n, 18) // "1.5"

// Format with localization and symbols
const formatted = formatBalance("1234.5678", {
  symbol: "QF",
  displayDecimals: 2,
  locale: "en-US"
}) // "1,234.57 QF"
```

### Transaction Flow

1. User interacts with form component
2. Component uses `useAssetMutation` hook
3. Transaction lifecycle tracked: signing → broadcasting → inBlock → finalized
4. Real-time toast notifications for each stage
5. Automatic query invalidation on success

## Testing

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Network Configuration

- **Testnet**: QF Network (`wss://test.qfnetwork.xyz`)
- **Native Token**: QF (18 decimals)
- **Faucet**: https://faucet.qfnetwork.xyz

## Documentation

See [CLAUDE.md](./CLAUDE.md) for detailed architectural documentation, coding conventions, and development guidelines.

## License

MIT
