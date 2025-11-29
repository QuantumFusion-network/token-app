# QF Network Asset Manager

A modern React 19 application for managing assets on the QF Network testnet. Built with TypeScript, polkadot-api, and Shadcn UI.

## Features

- **Wallet Connection**: Seamless integration with Polkadot-compatible wallets (Talisman, SubWallet).
- **Asset Management**: Create, mint, transfer, and destroy fungible assets.
- **Real-time Tracking**: Live updates for asset balances and transaction statuses.
- **Robust Transactions**: Full lifecycle tracking (Signing → Finalized) with toast notifications.
- **Type Safety**: End-to-end type safety with TypeScript and Polkadot API descriptors.

## Tech Stack

- **Framework**: React 19, Vite
- **Language**: TypeScript
- **Blockchain**: polkadot-api (PAPI)
- **State**: TanStack Query (Server), Context API (Client)
- **Styling**: Tailwind CSS, shadcn/ui
- **Testing**: Vitest, Playwright

## Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- Browser wallet extension

### Installation

```bash
pnpm install
pnpm papi    # Generate chain descriptors
pnpm dev     # Start local server
```

The app will run at `http://localhost:5173`.

## Documentation

- **[Architecture Guide](docs/ARCHITECTURE.md)**: State management, transaction flows, and code structure.
- **[Development Guide](docs/DEVELOPMENT.md)**: Setup, coding standards, and testing details.

## Network Information

- **Network**: QF Network Testnet (`wss://test.qfnetwork.xyz`)
- **Faucet**: [faucet.qfnetwork.xyz](https://faucet.qfnetwork.xyz)
- **Native Token**: QF (18 decimals)

## License

MIT
