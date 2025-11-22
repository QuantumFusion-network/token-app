# CLAUDE.md

QF Network asset management app - React 19 + TypeScript + polkadot-api

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
- All exports go through barrel files (`index.ts`) - import from `@/lib`, `@/hooks`, `@/components`

## STATE MANAGEMENT ARCHITECTURE

**Wallet State:** `WalletContext` + `useWallet` hook
- Extension connection, account selection, auto-reconnect
- Persists to localStorage via `walletStorage.ts`
- Access via `useWalletContext()`

**Connection State:** `ConnectionContext` + `useConnectionStatus` hook
- Creates polkadot-api client (NO separate chain.ts file)
- Connection status, auto-reconnect with query invalidation
- Access via `useConnectionContext()`

**Transaction State:** `TransactionContext` + `useTransactionManager` hook
- Tracks lifecycle: idle → signing → broadcasting → inBlock → finalized/error
- `useTransaction` hook for executing transactions
- `useTransactionToasts` observes state and displays notifications
- Access via `useTransactionContext()`

**Server State:** TanStack Query (30s stale, 5min GC)
- Asset data, balances, metadata
- Auto-invalidation on connection changes

## KEY FILE LOCATIONS

**lib/** - Business logic and utilities (all exported via `lib/index.ts`)
- `assetOperations.ts` - createAssetBatch, mintTokens, transferTokens, destroyAssetBatch
- `balance/` - Balance formatting and conversion utilities
  - `toPlanck.ts` - Convert human-readable to Planck units (bigint)
  - `fromPlanck.ts` - Convert Planck units to human-readable string
  - `format.ts` - formatBalance with locale, rounding, symbol support
  - `config.ts` - Balance constants and error codes
- `utils.ts` - cn() for Tailwind class merging
- `walletStorage.ts` - localStorage persistence for wallet connection
- `toastConfigs.ts` - Transaction toast configurations
- `queryClient.ts` / `queryHelpers.ts` - TanStack Query setup and helpers
- `errorParsing.ts` / `errorMessages.ts` / `transactionErrors.ts` - Error handling

**hooks/** - Custom React hooks (all exported via `hooks/index.ts`)
- `useConnectionStatus.ts` - Creates polkadot-api client, manages connection
- `useConnectionContext.ts` - Access connection state and API client
- `useWallet.ts` - Core wallet connection logic
- `useWalletContext.ts` - Access wallet state
- `useTransactionManager.ts` - Internal transaction lifecycle manager (used by TransactionProvider)
- `useTransaction.ts` - Execute transactions with lifecycle tracking
- `useTransactionContext.ts` - Access transaction state
- `useTransactionToasts.ts` - Display transaction notifications
- `useAssetMutation.ts` - Wrapper for asset mutations with TanStack Query
- `useFee.ts` - Calculate transaction fees
- `useNextAssetId.ts` - Get next available asset ID

**contexts/** - React Context providers (exported via `contexts/index.ts`)
- `WalletContext.tsx` - Wallet state provider (uses `useWallet`)
- `ConnectionContext.tsx` - Connection state provider (uses `useConnectionStatus`)
- `TransactionContext.tsx` - Transaction state provider (uses `useTransactionManager`)

**components/** - UI components (all exported via `components/index.ts`)
- `WalletConnector.tsx` - Wallet connection UI
- `AccountSelector.tsx` - Account selection dropdown
- `AccountDashboard.tsx` - Account balance and info
- `AssetList.tsx` - List of assets
- `AssetCard.tsx` - Individual asset card
- `AssetBalance.tsx` - Display asset balance for account
- `CreateAsset.tsx` - Create asset form
- `MintTokens.tsx` - Mint tokens form
- `TransferTokens.tsx` - Transfer tokens form
- `DestroyAsset.tsx` - Destroy asset form
- `TransactionReview.tsx` - Review transaction before signing
- `TransactionFormFooter.tsx` - Common form footer with fee display
- `FeeDisplay.tsx` - Display transaction fee
- `ConnectionBanner.tsx` - Connection status banner
- `MutationError.tsx` - Display mutation errors
- `error-boundaries/` - Error boundary components
  - `AppErrorBoundary.tsx` - Top-level error boundary
  - `FeatureErrorBoundary.tsx` - Feature-level error boundary
  - `ComponentErrorBoundary.tsx` - Component-level error boundary

## TRANSACTION FLOW

1. Component uses `useAssetMutation` hook with operation function and params
2. On mutation trigger, `useTransaction().executeTransaction()` is called
3. TransactionManager tracks lifecycle: idle → signing → broadcasting → inBlock → finalized
4. `useTransactionToasts` observes transaction state and displays notifications
5. Cleanup after 500ms, queries invalidated on success

## BALANCE UTILITIES

**Conversion:**
- `toPlanck(value: string, decimals: number): bigint` - Convert "1.5" to 1500000000000000000n
- `fromPlanck(value: bigint, decimals?: number): string` - Convert 1500000000000000000n to "1.5"

**Formatting:**
- `formatBalance(value: string, options?: FormatBalanceOptions): string`
  - Options: `symbol`, `displayDecimals`, `locale`, `roundingMode`
  - Handles locale-specific formatting (commas, periods)
  - Supports rounding modes: 'round', 'floor', 'ceil', 'trunc'
  - Example: `formatBalance("1234.5678", { symbol: "QF", displayDecimals: 2 })` → "1,234.57 QF"

**Import from main barrel:**
```ts
import { toPlanck, fromPlanck, formatBalance } from '@/lib'
```

## BLOCKCHAIN SPECIFICS

**Network:** QF Network testnet `wss://test.qfnetwork.xyz`
**Native Token:** QF (18 decimals)

**Asset Operations:**
- Create: Assets.create + set_metadata + optional mint
- Destroy: freeze_asset → start_destroy → destroy_approvals → destroy_accounts → finish_destroy
- All batch operations use `Utility.batch_all` pallet for atomicity

**polkadot-api:**
- Descriptors in `.papi/descriptors` (auto-generated via `papi` command)
- Metadata in `.papi/metadata/*.scale` files
- Client created in `useConnectionStatus` hook and provided via ConnectionContext
- TypedApi imported from descriptors for type-safe transactions

## PROJECT CONVENTIONS

- Toast duration: 30s (Sonner)
- TanStack Query: 30s stale time, 5min garbage collection
- Wallet auto-reconnects on page load if previously connected
- Error boundaries at app/feature/component levels
- All exports through barrel files for clean imports
- Balance decimals: Default 12, QF native is 18
- Query refetch: 10s for balances, 5min stale time for metadata
