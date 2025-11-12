# CLAUDE.md

Quantum Fusion Network (QFN) asset management app - React 19 + TypeScript + polkadot-api

## CODE QUALITY RULES (Apply to Every Change)

**State Management:**
- NEVER use `useReducer` - use `useState` or context
- Component state with `useState`, shared state via Context
- Server state via TanStack Query only

**TypeScript:**
- NEVER use `any` - use `unknown` and narrow types
- NEVER use type assertions (`as`) - let types prove correctness
- NEVER create redundant type definitions - leverage inference
- Prefer narrow types (literals, discriminated unions) over broad types

**Architecture:**
- Components are presentational - minimal logic
- Business logic in `lib/` folder and custom hooks
- Pure functions, immutability, early returns

## STATE MANAGEMENT ARCHITECTURE

**Wallet State:** `WalletContext` + `useWallet` hook
- Extension connection, account selection, auto-reconnect
- Persists to localStorage

**Connection State:** `ConnectionContext` + `useConnectionStatus` hook
- Creates polkadot-api client (NO separate chain.ts file)
- Connection status, auto-reconnect with query invalidation

**Transaction State:** `TransactionContext` + `useTransaction` hook
- Tracks: signing → broadcasting → inBlock → finalized/error
- `useTransactionToasts` observes and displays notifications

**Server State:** TanStack Query (30s stale, 5min GC)

## KEY FILE LOCATIONS

**lib/** - Business logic and utilities
- `assetOperations.ts` - createAssetBatch, mintTokens, transferTokens, destroyAssetBatch
- `utils.ts` - formatUnits, parseUnits, formatFee, cn
- `walletStorage.ts` - localStorage persistence
- `toastConfigs.ts` - Transaction toast configs
- `queryClient.ts` / `queryHelpers.ts` - TanStack Query setup
- `errorParsing.ts` / `errorMessages.ts` / `transactionErrors.ts` - Error handling

**hooks/** - Custom React hooks
- `useConnectionStatus` - Creates polkadot-api client, connection state
- `useWallet` - Wallet connection, account selection
- `useTransaction` - Execute and track transaction lifecycle
- `useTransactionToasts` - Display transaction notifications

**contexts/** - React Context providers
- `WalletContext` - Wallet state provider
- `ConnectionContext` - Connection status and API client
- `TransactionContext` - Transaction state manager

## TRANSACTION FLOW

1. Component calls `useTransaction().executeTransaction()`
2. TransactionContext tracks lifecycle through states
3. `useTransactionToasts` displays notifications
4. Cleanup after 500ms

## BLOCKCHAIN SPECIFICS

**Network:** QF Network testnet `wss://test.qfnetwork.xyz`

**polkadot-api:**
- Descriptors in `.papi/descriptors` (auto-generated via `papi` command)
- Metadata in `.papi/metadata/*.scale` files
- Client created in `useConnectionStatus` hook

## PROJECT CONVENTIONS

- Toast duration: 30s (Sonner)
- TanStack Query: 30s stale time, 5min garbage collection
- Wallet auto-reconnects on page load
- Error boundaries at app/feature/component levels
