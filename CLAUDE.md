# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based web application for interacting with QF Network. It provides a user interface for managing assets including creating, minting, transferring, and viewing asset balances.

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: React hooks + TanStack Query for reading and mutating blockchain state
- **Blockchain Integration**: polkadot-api for connecting to QF Network
- **Wallet Integration**: QF Network extension injected signers
- **Styling**: Tailwind CSS v4 with theme CSS variables (App.css) using OKLCH color space, supports light/dark modes
- **UI Components**: Sonner for toast notifications, Lucide React for icons
- **Package Manager**: pnpm (specified in package.json)

## Development Commands

- `pnpm install` - Install dependencies (pnpm is the required package manager)
- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production (runs TypeScript compiler then Vite build)
- `pnpm lint` - Run ESLint
- `pnpm preview` - Preview production build locally
- `pnpm deploy` - Build and deploy to Cloudflare Pages via Wrangler
- `papi` - Regenerate polkadot-api descriptors (runs automatically on postinstall)

## Architecture

### Core Structure

```
src/
├── components/           # React components for different features
│   ├── error-boundaries/ # Error boundary components for graceful error handling
│   └── ui/              # Reusable UI components (shadcn/ui style)
├── contexts/            # React context providers
├── hooks/               # Custom React hooks
├── lib/                 # External service integrations and business logic
└── utils/               # Pure utility functions
```

### Key Components

- **App.tsx**: Main application with sidebar navigation and account selector header
- **WalletConnector**: Handles QF Network extension wallet connections and auto-reconnection
- **CreateAsset**: Form for creating new assets with batch transaction support (create + set metadata + optional mint)
- **AssetList**: Displays portfolio with asset cards showing balances and metadata
- **MintTokens/TransferTokens/DestroyAsset**: Asset operation components
- **Error Boundaries**: AppErrorBoundary, FeatureErrorBoundary, and ComponentErrorBoundary for graceful error handling at different levels

#### Component Design Philosophy

- **Dumb Components**: Components should be as presentational as possible with minimal business logic
- **Business Logic Separation**: All business logic should be abstracted into the `lib/` folder and custom React hooks
- **Pure Presentation**: Components focus on rendering UI based on props, delegating logic to hooks and utilities

### State Management

- **Wallet State**: Managed by `WalletContext` provider and `useWallet` hook with localStorage persistence for auto-reconnection
- **Transaction State**: Centralized `TransactionContext` tracks all active transactions with status updates
- **Server State**: TanStack Query for blockchain data caching and synchronization
- **Query Client**: Configured with 30s stale time and 5min garbage collection
- **Transaction Processing**: `useTransaction` hook integrates with TransactionContext for lifecycle management
- **Toast Notifications**: `useTransactionToasts` observes TransactionContext and displays toast notifications for all transaction state changes

### Blockchain Integration

- **Current Network**: QF Network testnet (`wss://test.qfnetwork.xyz`)
- **API**: Uses typed polkadot-api with QF Network descriptors from `.papi/descriptors`
- **Metadata**: Pre-generated chain metadata stored in `.papi/metadata/`
- **Transactions**: All operations use QF Network pallet calls (Assets.create, Assets.mint, etc.)
- **Signers**: QF Network extension injected signers for transaction signing

### Custom Hooks Architecture

- **useWallet**: Manages QF Network extension connection, account selection, and auto-reconnection from localStorage
- **useWalletContext**: Accesses wallet state from WalletContext provider
- **useTransaction**: Integrates with TransactionContext to execute and track transaction lifecycle
- **useTransactionToasts**: Observes transaction state changes and displays appropriate toast notifications

### Transaction Flow

The application uses a centralized transaction management system:

1. **Start**: Component calls `useTransaction().executeTransaction()` with transaction type and observable
2. **Track**: TransactionContext creates unique transaction ID and tracks it through these states:
   - **signing**: User signing in wallet extension
   - **broadcasting**: Transaction submitted to network (txHash available)
   - **inBlock**: Transaction included in a block
   - **finalized**: Transaction finalized with events
   - **error**: Transaction failed with error details
3. **Notify**: `useTransactionToasts` observes state changes and displays appropriate toasts
4. **Complete**: Transaction cleaned up after 500ms delay to allow final toast display

### Context Architecture

- **WalletContext**: Provides wallet state (extension, accounts, selectedAccount, connection status) to entire app
- **TransactionContext**: Centralized transaction state manager
  - Tracks multiple concurrent transactions with unique IDs
  - Provides transaction lifecycle methods (start, track, complete)
  - Stores transaction details and toast configurations
  - Handles transaction subscriptions and cleanup

### Utility Functions

- **format.ts**: Token amount formatting between raw units and decimal representation
  - `formatUnits(value: bigint, decimals: number)`: Convert raw units to human-readable format
  - `parseUnits(value: string, decimals: number)`: Convert decimal input to blockchain units
- **walletStorage.ts**: localStorage utilities for persisting wallet connection state (extension name and selected account address)

### Business Logic Layer (`lib/` folder)

- **chain.ts**: Creates and exports the polkadot-api client and typed API instance for QF Network
- **assetOperations.ts**: Pure business logic functions for blockchain operations
  - `createAssetBatch()`: Batch transaction for create + set metadata + optional mint
  - `mintTokens()`: Mint tokens to a beneficiary
  - `transferTokens()`: Transfer tokens between accounts
  - `destroyAssetBatch()`: Complete asset destruction sequence (freeze → start_destroy → destroy_approvals → destroy_accounts → finish_destroy)
- **toastConfigs.ts**: Toast configuration objects for different transaction types
- **queryClient.ts**: TanStack Query client configuration
- **queryHelpers.ts**: Helper functions for query invalidation

### QF Network Integration

- **Descriptors**: Auto-generated TypeScript types for QF Network pallets via `papi` command
- **Configuration**: `.papi/polkadot-api.json` defines supported chains (dot_asset_hub, paseo_asset_hub, qfn)
- **Metadata**: Pre-generated `.scale` files in `.papi/metadata/` for offline type generation
- **Type Safety**: Full type safety for all blockchain interactions through generated descriptors

## Development Notes

- Uses pnpm as package manager (version 10.15.1+)
- TypeScript strict mode enabled
- All components follow React 19 patterns (no React imports needed for components)
- Wallet connection persists across sessions via localStorage
- Auto-reconnection attempts on page load if previous connection exists
- Transaction lifecycle centrally managed through TransactionContext
- All asset operations use batch transactions via `Utility.batch_all` pallet
- Asset metadata (name, symbol, decimals) stored on-chain
- Toast notifications use Sonner library with 30s duration
- The app connects to QF Network testnet at `wss://test.qfnetwork.xyz`
- Error boundaries provide graceful degradation at app, feature, and component levels

#### TypeScript Best Practices

- **No Any Types**: Never use `any` - use `unknown` if type is truly unknown and narrow it down
- **Narrow Types**: Define types as narrowly as possible using literal types and discriminated unions
- **Type Inference**: Leverage TypeScript's inference capabilities - avoid redundant type annotations
- **Minimal Definitions**: Keep type definitions concise, let TypeScript infer from implementation
- **Const Assertions**: Use `as const` for literal values to get the narrowest possible type
- **Discriminated Unions**: Prefer tagged unions over optional properties for mutually exclusive states
- **Generic Constraints**: Use generic type parameters with constraints rather than broad types
- **Avoid Type Assertions**: Let the type system prove correctness instead of using `as` casts

#### Functional Programming Principles

- **Pure Functions First**: Always prefer pure functions over stateful operations
- **Immutability**: Treat all data as immutable, use spread operators and array methods that return new instances
- **Function Composition**: Build complex operations by composing simple, reusable functions
- **Avoid Side Effects**: Isolate side effects to dedicated hooks and effect handlers
- **Declarative Over Imperative**: Write code that describes what should happen, not how
- **Higher-Order Functions**: Leverage map, filter, reduce over loops for data transformations
- **Early Returns**: Use guard clauses and early returns for cleaner, more readable code
- **Derived State**: Calculate values from existing state rather than storing redundant state
- **No Mutations**: Never mutate objects or arrays directly, always return new references
