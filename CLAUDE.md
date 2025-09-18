# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React-based web application for interacting with Polkadot's Asset Hub parachain. It provides a user interface for managing assets including creating, minting, transferring, and viewing asset balances.

## Tech Stack

- **Frontend**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: React hooks + TanStack Query for server state
- **Blockchain Integration**: polkadot-api for connecting to Asset Hub
- **Wallet Integration**: Polkadot extension injected signers
- **Styling**: Tailwind CSS classes (inline)
- **UI Components**: Sonner for toast notifications, Lucide React for icons
- **Package Manager**: pnpm (specified in package.json)

## Development Commands

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production (runs TypeScript compiler then Vite build)
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build locally

## Architecture

### Core Structure

```
src/
├── components/     # React components for different features
├── hooks/         # Custom React hooks
├── lib/           # External service integrations
└── utils/         # Pure utility functions
```

### Key Components

- **App.tsx**: Main application with tab-based navigation (Assets, Create, Mint, Transfer)
- **WalletConnector**: Handles Polkadot extension wallet connections
- **CreateAsset**: Form for creating new assets on Asset Hub (supports both batch and sequential transactions)
- **CreateAssetBatch.tsx**: Original batch transaction implementation for asset creation
- **AssetList**: Displays on-chain assets with balances
- **MintTokens/TransferTokens**: Asset operations

#### Component Design Philosophy

- **Dumb Components**: Components should be as presentational as possible with minimal business logic
- **Business Logic Separation**: All business logic should be abstracted into the `lib/` folder and custom React hooks
- **Pure Presentation**: Components focus on rendering UI based on props, delegating logic to hooks and utilities

### State Management

- **Wallet State**: Managed by `useWallet` hook, handles extension connection and account selection
- **Server State**: TanStack Query for blockchain data caching and synchronization
- **Query Client**: Configured with 30s stale time and 5min garbage collection
- **Transaction Status**: `useTransactionStatus` hook tracks blockchain transaction lifecycle
- **Toast Notifications**: `useTransactionToasts` provides user feedback during transactions

### Blockchain Integration

- **Current Network**: Paseo Asset Hub testnet (`wss://asset-hub-paseo-rpc.n.dwellir.com`)
- **Alternative**: Polkadot Asset Hub mainnet (commented out in polkadot.ts)
- **API**: Uses typed polkadot-api with Asset Hub descriptors from `.papi/descriptors`
- **Metadata**: Pre-generated chain metadata stored in `.papi/metadata/`
- **Transactions**: All operations use Asset Hub pallet calls (Assets.create, Assets.mint, etc.)
- **Signers**: Polkadot extension injected signers for transaction signing

### Custom Hooks Architecture

- **useWallet**: Manages Polkadot extension connection, account selection, and wallet state
- **useWalletContext**: Context provider for wallet state across components
- **useTransactionStatus**: Tracks transaction lifecycle states (signing → broadcasting → inBlock → finalized)
- **useTransactionToasts**: Handles user notifications during transaction processing

### Transaction Flow

1. **Signing**: User signs transaction in wallet extension
2. **Broadcasting**: Transaction submitted to network
3. **In Block**: Transaction included in a block
4. **Finalized**: Transaction finalized and permanent

### Utility Functions

- **format.ts**: Token amount formatting between raw units and decimal representation
  - `formatUnits(value: bigint, decimals: number)`: Convert raw units to human-readable format
  - `parseUnits(value: string, decimals: number)`: Convert decimal input to blockchain units

### Polkadot-API Integration

- **Descriptors**: Auto-generated TypeScript types for Asset Hub pallets
- **Configuration**: `.papi/polkadot-api.json` defines supported chains (Polkadot & Paseo Asset Hub)
- **Type Safety**: Full type safety for all blockchain interactions through generated descriptors

## Development Notes

- Uses pnpm as package manager (version 10.15.1+)
- TypeScript strict mode enabled
- All components follow React 19 patterns
- Wallet connection is required for all operations
- Transaction lifecycle handled through TanStack Query mutations
- Asset metadata includes name, symbol, and decimals stored on-chain
- Toast notifications use Sonner library for user feedback
- The app supports both mainnet and testnet Asset Hub connections

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
