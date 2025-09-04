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
- **CreateAsset**: Form for creating new assets on Asset Hub
- **AssetList**: Displays user's assets with balances
- **MintTokens/TransferTokens**: Asset operations

### State Management

- **Wallet State**: Managed by `useWallet` hook, handles extension connection and account selection
- **Server State**: TanStack Query for blockchain data caching and synchronization
- **Query Client**: Configured with 30s stale time and 5min garbage collection

### Blockchain Integration

- **Connection**: WebSocket to `wss://polkadot-asset-hub-rpc.polkadot.io`
- **API**: Uses typed polkadot-api with Asset Hub descriptors
- **Transactions**: All operations use Asset Hub pallet calls (Assets.create, Assets.mint, etc.)
- **Signers**: Polkadot extension injected signers for transaction signing

### Utility Functions

- **format.ts**: Token amount formatting between raw units and decimal representation
- **transactions.ts**: Currently contains commented batch transaction utilities (not implemented)

## Development Notes

- Uses pnpm as package manager
- TypeScript strict mode enabled
- All components follow React 19 patterns
- Wallet connection is required for all operations
- Transaction status is handled through TanStack Query mutations
- Asset metadata includes name, symbol, and decimals stored on-chain