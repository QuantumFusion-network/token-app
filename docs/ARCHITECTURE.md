# Architecture Documentation

## Overview

The application follows a layered architecture using React 19, TypeScript, and Polkadot API (PAPI). It emphasizes strict separation of concerns between state management, business logic, and UI presentation.

## Architecture Layers

### 1. State Management (Contexts)
Located in `src/contexts/`. These provide the "source of truth" for global state.

- **WalletContext**: Manages wallet extension connection, account selection, and persistence.
- **ConnectionContext**: Manages the Polkadot API client and connection status (auto-reconnect).
- **TransactionContext**: Tracks the lifecycle of blockchain transactions (idle → signing → finalized).

### 2. Composition (Hooks)
Located in `src/hooks/`. These combine contexts with business logic to provide "capabilities".

- **useTransaction**: Exposes `executeTransaction` to run chain interactions with lifecycle tracking.
- **useAssetMutation**: Wraps asset operations with TanStack Query invalidation and toast notifications.
- **useNextAssetId**: Specialized hook that queries the chain for the next available asset ID.

### 3. Business Logic (Lib)
Located in `src/lib/`. Pure functions with **zero React dependencies**.

- **assetOperations.ts**: Polkadot API transaction builders.
- **balance/**: Utilities for converting and formatting token amounts (Planck ↔ Decimal).
- **storage/**: LocalStorage persistence wrappers.
- **query/**: TanStack Query configuration and invalidation helpers.

### 4. Presentation (Components)
Located in `src/components/`. UI components organized by domain.

- **ui/**: Reusable design system primitives (shadcn/ui).
- **feature/**: Domain-specific components (`account/`, `asset-management/`).
- **error-boundaries/**: Hierarchical error handling (App → Feature → Component).

## State Management Strategy

| State Type | Solution | Policy |
|------------|----------|--------|
| **Wallet** | `WalletContext` | Persisted to localStorage; syncs with extension |
| **Connection** | `ConnectionContext` | Auto-reconnects; provides API client |
| **Transaction** | `TransactionContext` | Ephemeral; tracks specific operation status |
| **Server Data** | TanStack Query | Stale: 30s, GC: 5min; auto-invalidates on mutations |
| **UI State** | `useState` | Local to components; avoided for shared state |

**Rule**: Never use `useReducer`. Use `useState` for local logic or Context for shared state.

## Transaction Flow

The application implements a robust transaction lifecycle manager:

1. **Trigger**: Component calls `mutate` from `useAssetMutation`.
2. **Execution**: `useTransaction().executeTransaction()` is invoked with the builder.
3. **Lifecycle Tracking**:
   - `Idle`: Ready state.
   - `Signing`: Waiting for user signature in wallet.
   - `Broadcasting`: Submitted to network.
   - `InBlock`: Included in a block (temporary success).
   - `Finalized`: Irreversible success (triggers query invalidation).
4. **Feedback**: `useTransactionToasts` observes state changes and displays distinct notifications for each stage.
5. **Cleanup**: State resets after a delay or on dismissal.

## Key Directories

```
src/
├── contexts/        # State providers
├── hooks/           # logic composition
├── lib/             # Pure business logic
├── components/      # UI components
│   ├── account/     # Wallet UI
│   ├── asset-management/ # Asset forms/displays
│   └── transaction-ui/   # Shared transaction feedback
└── __tests__/       # Tests
```

