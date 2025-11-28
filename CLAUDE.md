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
- `errors/` - Error handling utilities
  - `transactionErrors.ts` - Error type system and classes
  - `errorParsing.ts` - Type guards and safe parsers
  - `errorMessages.ts` - User-friendly error message mappings
- `query/` - TanStack Query setup
  - `queryClient.ts` - Query client configuration
  - `queryHelpers.ts` - Query invalidation helpers
- `storage/` - localStorage persistence
  - `walletStorage.ts` - Wallet connection persistence
  - `networkStorage.ts` - Network selection persistence
- `devSigner.ts` - Dev account utilities
- `utils.ts` - cn() for Tailwind class merging

**hooks/** - Custom React hooks (all exported via `hooks/index.ts`)

- `useTransaction.ts` - Execute transactions with lifecycle tracking
- `useTransactionToasts.ts` - Display transaction notifications
- `useAssetMutation.ts` - Wrapper for asset mutations with TanStack Query
- `useFee.ts` - Calculate transaction fees
- `useNextAssetId.ts` - Get next available asset ID (waits for connection)

**contexts/** - React Context providers and access hooks (exported via `contexts/index.ts`)

- `WalletContext.tsx` - Wallet state provider
- `ConnectionContext.tsx` - Connection state provider
- `TransactionContext.tsx` - Transaction state provider
- `useWalletContext.ts` - Access wallet state
- `useConnectionContext.ts` - Access connection state and API client
- `useTransactionContext.ts` - Access transaction state
- `internal/` - Implementation hooks (NOT exported, used only by providers)
  - `useWallet.ts` - Core wallet connection logic
  - `useConnectionStatus.ts` - Creates polkadot-api client, manages connection
  - `useTransactionManager.ts` - Transaction lifecycle manager

**components/** - UI components (all exported via `components/index.ts`)

- `account/` - Wallet and account management UI
  - `WalletConnector.tsx` - Wallet connection UI
  - `AccountSelector.tsx` - Account selection dropdown
  - `AccountDashboard.tsx` - Account balance and info
  - `NetworkSelector.tsx` - Network selection dropdown
- `asset-management/` - Asset-related components (scales to future features like multisig/, governance/)
  - `display/` - Read-only asset viewing
    - `AssetList.tsx` - List of assets with filters
    - `AssetCard.tsx` - Individual asset card
    - `AssetBalance.tsx` - Display asset balance for account
  - `forms/` - Asset mutation forms
    - `CreateAsset.tsx` - Create asset form
    - `MintTokens.tsx` - Mint tokens form
    - `TransferTokens.tsx` - Transfer tokens form
    - `DestroyAsset.tsx` - Destroy asset form
  - `toastConfigs.ts` - Toast messages for asset operations
- `transaction-ui/` - Shared transaction presentation
  - `TransactionReview.tsx` - Review transaction before signing
  - `TransactionFormFooter.tsx` - Common form footer with fee display
  - `FeeDisplay.tsx` - Display transaction fee
  - `MutationError.tsx` - Display mutation errors
- `error-boundaries/` - Error boundary components
  - `AppErrorBoundary.tsx` - Top-level error boundary
  - `FeatureErrorBoundary.tsx` - Feature-level error boundary
  - `ComponentErrorBoundary.tsx` - Component-level error boundary
- `ui/` - Design system primitives (shadcn/ui)

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
import { formatBalance, fromPlanck, toPlanck } from '@/lib'
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

## ARCHITECTURE LAYERS

The codebase follows type-based organization with clear separation of concerns:

**contexts/** - State management providers and their access hooks

- `*Context.tsx` - React Context providers (wrap app in main.tsx)
- `use*Context.ts` - Consumer hooks for accessing context state
- `internal/` - Implementation hooks used only by providers (NOT exported)

**hooks/** - Composition hooks that combine contexts with business logic

- `useTransaction` - Composes TransactionContext for easy TX execution
- `useAssetMutation` - Composes wallet + transaction + TanStack Query
- `useNextAssetId` - Queries chain for next asset ID (enabled only when connected)
- These are "how to do things," contexts are "what state exists"

**lib/** - Pure functions with zero React dependencies

- `assetOperations.ts` - polkadot-api transaction builders
- `balance/` - Number conversion and formatting
- `query/queryHelpers.ts` - Query invalidation (uses refetchQueries for nextAssetId)
- Error handling utilities

**components/** - UI components organized by domain

- `ui/` - Design system primitives (shadcn)
- `error-boundaries/` - Error boundary hierarchy
- Feature components grouped by purpose (account/, asset-management/, transaction-ui/)
- Forms disable submit button until transaction is ready (!transaction check)
