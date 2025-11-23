# polkadot-api Patterns Reference

> **Critical**: This document extracts patterns from the token app for encoding into workflow skills.  
> These patterns prevent the #1 mistake: using `@polkadot/api` instead of `polkadot-api`.

---

## Pattern 1: Package Imports ⚠️ MOST CRITICAL

### ✅ CORRECT: Use `polkadot-api`

```typescript
// Core imports from polkadot-api
import {
  Binary,
  createClient,
  type Transaction,
  type TxBroadcastEvent,
  type TxCallData,
  type TypedApi
} from 'polkadot-api'

// WebSocket provider
import { getWsProvider, WsEvent, type StatusChange } from 'polkadot-api/ws-provider'

// Chain-specific types (generated)
import { MultiAddress, type qfn } from '@polkadot-api/descriptors'

// Utils for type helpers
import { type PolkadotSigner } from '@polkadot-api/utils'
```

### ❌ WRONG: Don't use `@polkadot/api`

```typescript
// ❌ NEVER import these - completely different package!
import { ApiPromise } from '@polkadot/api'
import { WsProvider } from '@polkadot/rpc-provider'
import { u8aToHex } from '@polkadot/util'
```

**Why this matters:**
- `@polkadot/api` (PJS) and `polkadot-api` (PAPI) are **different libraries**
- Incompatible types, different patterns
- PJS is maintenance mode, PAPI is the future
- Most tutorials online use PJS (wrong for us)

**Validation rule:**
```bash
# Check codebase for forbidden imports
grep -r "@polkadot/api" src/
# Should return zero results
```

---

## Pattern 2: Client & API Setup

### ✅ CORRECT: Create client once, reuse TypedApi

```typescript
import { createClient } from 'polkadot-api'
import { getWsProvider } from 'polkadot-api/ws-provider'
import { qfn as chain } from '@polkadot-api/descriptors'

// Create provider with status monitoring
const provider = getWsProvider('wss://test.qfnetwork.xyz', {
  onStatusChanged: (status: StatusChange) => {
    console.log('Connection status:', status.type)
  }
})

// Create client (holds connection state)
const client = createClient(provider)

// Get TypedApi for type-safe chain interactions
const api = client.getTypedApi(chain)

// TypedApi type for function signatures
type QfnApi = TypedApi<typeof qfn>
```

**Key insights:**
- `createClient` returns connection manager
- `getTypedApi` returns typed interface to chain
- TypedApi includes: `api.tx.*`, `api.query.*`, `api.constants.*`
- Connection auto-reconnects, no manual management

**Used in:** `src/hooks/useConnectionStatus.ts`

---

## Pattern 3: TypedApi Usage

### ✅ CORRECT: Type function parameters with TypedApi

```typescript
import type { TypedApi } from 'polkadot-api'
import { qfn } from '@polkadot-api/descriptors'

type QfnApi = TypedApi<typeof qfn>

// Function accepts TypedApi for full type safety
function createAssetBatch(
  api: QfnApi,
  params: CreateAssetParams,
  signerAddress: string
) {
  // api.tx.Assets.* has full autocomplete + type checking
  return api.tx.Assets.create({
    id: params.assetId,
    admin: MultiAddress.Id(signerAddress),
    min_balance: params.minBalance
  })
}
```

**Why this matters:**
- TypeScript knows all pallets, extrinsics, and parameters
- Autocomplete shows available methods
- Compile-time errors for wrong types
- Descriptors generated via `papi` command from chain metadata

**Used in:** `src/lib/assetOperations.ts`

---

## Pattern 4: MultiAddress for Accounts

### ✅ CORRECT: Use MultiAddress.Id()

```typescript
import { MultiAddress } from '@polkadot-api/descriptors'

// Wrap SS58 address strings with MultiAddress.Id()
const admin = MultiAddress.Id('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY')

api.tx.Assets.create({
  id: 1,
  admin: admin,  // Type: MultiAddress<SS58String, number>
  min_balance: 1000n
})

// Also used for recipients
const recipient = MultiAddress.Id(recipientAddress)

api.tx.Assets.transfer({
  id: 1,
  target: recipient,
  amount: 1000n
})
```

### ❌ WRONG: Passing string directly

```typescript
api.tx.Assets.create({
  admin: '5GrwvaEF...',  // ❌ Type error! Expected MultiAddress
  // ...
})
```

**Why this matters:**
- Substrate uses `MultiAddress` enum (supports different address formats)
- `MultiAddress.Id()` is most common variant (account address)
- Other variants: `Index`, `Raw`, `Address32`, `Address20`
- PAPI exposes this type correctly, PJS often hides it

**Used in:** `src/lib/assetOperations.ts` (all operations)

---

## Pattern 5: Binary for Text/Bytes

### ✅ CORRECT: Use Binary.fromText()

```typescript
import { Binary } from 'polkadot-api'

// Convert strings to byte arrays
api.tx.Assets.set_metadata({
  id: 1,
  name: Binary.fromText('My Token'),
  symbol: Binary.fromText('MTK'),
  decimals: 12
})

// Binary also supports hex and raw bytes
const hexData = Binary.fromHex('0x1234')
const rawData = Binary.fromBytes(new Uint8Array([1, 2, 3, 4]))
```

### ❌ WRONG: Passing string directly

```typescript
api.tx.Assets.set_metadata({
  name: 'My Token',  // ❌ Type error! Expected Binary
  // ...
})
```

**Why this matters:**
- Chain stores bytes, not strings
- `Binary` handles encoding/decoding
- Supports multiple formats (text, hex, bytes)
- Type-safe conversions

**Used in:** `src/lib/assetOperations.ts` (metadata operations)

---

## Pattern 6: BigInt for Amounts

### ✅ CORRECT: Use bigint with toPlanck helper

```typescript
import { toPlanck } from '@/lib/balance'

// User input is string
const userInput = '1.5'  // "1.5 tokens"

// Convert to Planck units (smallest denomination) as bigint
const amount = toPlanck(userInput, 18)  // 1500000000000000000n

api.tx.Assets.transfer({
  id: 1,
  target: MultiAddress.Id(recipient),
  amount: amount  // bigint (18 decimals)
})
```

### ❌ WRONG: Using numbers

```typescript
api.tx.Assets.transfer({
  amount: 1.5  // ❌ Type error! Also loses precision
})

api.tx.Assets.transfer({
  amount: 1500000000000000000  // ❌ Number, not bigint
})
```

**Why bigint?**
- JavaScript `number` is float64 (53-bit precision)
- Blockchain amounts exceed 53 bits (e.g., 10^18 for 18 decimals)
- BigInt provides arbitrary precision
- TypeScript enforces `bigint` type (note the `n` suffix)

**Helper functions:**
- `toPlanck(value: string, decimals: number): bigint` - User input → blockchain
- `fromPlanck(value: bigint, decimals: number): string` - Blockchain → display
- `formatBalance(value: string, options): string` - Add symbols, locale, rounding

**Used in:** `src/lib/assetOperations.ts`, `src/lib/balance/`

---

## Pattern 7: Transaction Building & Signing

### ✅ CORRECT: Observable pattern with signSubmitAndWatch

```typescript
import type { Transaction, TxBroadcastEvent } from 'polkadot-api'
import type { PolkadotSigner } from '@polkadot-api/utils'

// 1. Build transaction (returns Transaction object)
const transaction: Transaction<object, string, string, unknown> = 
  api.tx.Assets.transfer({
    id: 1,
    target: MultiAddress.Id(recipient),
    amount: 1000n
  })

// 2. Sign, submit, and watch for events
const observable = transaction.signSubmitAndWatch(polkadotSigner)

// 3. Subscribe to lifecycle events
observable.subscribe({
  next: (event: TxBroadcastEvent) => {
    switch (event.type) {
      case 'broadcasted':
        console.log('Transaction submitted, hash:', event.txHash)
        break
      case 'txBestBlocksState':
        console.log('Transaction in block:', event.block.hash)
        if (event.found.success) {
          console.log('Transaction successful!')
        } else {
          console.error('Transaction failed:', event.found.dispatchError)
        }
        break
      case 'finalized':
        console.log('Transaction finalized in block:', event.block.hash)
        break
    }
  },
  error: (error: Error) => {
    console.error('Transaction error:', error)
  }
})
```

### ❌ WRONG: Fire-and-forget

```typescript
// ❌ No progress tracking, no finalization check
await transaction.signAndSubmit(signer)
```

**Why observable pattern?**
- Blockchain transactions take 6-12 seconds
- Multiple stages: signing → broadcasting → in block → finalized
- Users need progress feedback (UX)
- Can detect failures at each stage
- Can show different toasts: "Signing...", "In block...", "Finalized!"

**Event types:**
- `broadcasted` - Transaction sent to network
- `txBestBlocksState` - Transaction included in a block (check `event.found.success`)
- `finalized` - Block is finalized (irreversible)

**Used in:** `src/hooks/useTransaction.ts`, `src/hooks/useTransactionManager.ts`

---

## Pattern 8: Batch Operations

### ✅ CORRECT: Use Utility.batch_all with decodedCall

```typescript
import type { TxCallData } from 'polkadot-api'

// Build individual transaction calls
const call1 = api.tx.Assets.create({ /* ... */ }).decodedCall
const call2 = api.tx.Assets.set_metadata({ /* ... */ }).decodedCall
const call3 = api.tx.Assets.mint({ /* ... */ }).decodedCall

// Combine into batch (all succeed or all fail)
const calls: TxCallData[] = [call1, call2, call3]

const batchTransaction = api.tx.Utility.batch_all({ calls })

// Sign and submit as single transaction
const observable = batchTransaction.signSubmitAndWatch(signer)
```

### ❌ WRONG: Missing decodedCall

```typescript
const calls = [
  api.tx.Assets.create({ /* ... */ }),  // ❌ Wrong type (Transaction, not TxCallData)
  // ...
]
```

**Why batch_all?**
- Atomicity: All calls succeed or all fail (single transaction)
- Cheaper fees: One signature, one transaction
- Common for multi-step operations (create asset + set metadata + mint)

**Batch variants:**
- `batch_all`: All succeed or entire batch fails (recommended)
- `batch`: Best effort, some can fail
- `force_batch`: Like batch but continues even if some fail

**Used in:** `src/lib/assetOperations.ts` (createAssetBatch, destroyAssetBatch)

---

## Pattern 9: Query Patterns with TanStack Query

### ✅ CORRECT: Chain queries with connection status

```typescript
import { useQuery } from '@tanstack/react-query'
import { useConnectionContext } from '@/hooks'

function useAssetInfo(assetId: number) {
  const { isConnected, api } = useConnectionContext()
  
  return useQuery({
    queryKey: ['asset', assetId],
    queryFn: async () => {
      // Query returns runtime type
      const assetInfo = await api.query.Assets.Asset.getValue(assetId)
      
      if (!assetInfo) {
        throw new Error('Asset not found')
      }
      
      return {
        supply: assetInfo.supply,
        accounts: assetInfo.accounts,
        owner: assetInfo.owner,
        // ... other fields from runtime
      }
    },
    enabled: isConnected && assetId !== null,
    staleTime: 30_000,   // 30s (from CLAUDE.md)
    gcTime: 5 * 60_000   // 5min (from CLAUDE.md)
  })
}
```

**Key patterns:**
- Check `isConnected` before querying (via `enabled` flag)
- Use `getValue()` for single values (returns `T | undefined`)
- Use `getEntries()` for multiple values (returns iterator)
- TanStack Query handles caching, refetching, error states
- Standard stale/gc times from CLAUDE.md conventions

**Query methods:**
- `api.query.Pallet.Storage.getValue(key)` - Single value
- `api.query.Pallet.Storage.getEntries()` - All entries
- `api.query.Pallet.Storage.watchValue(key, callback)` - Subscribe to changes

**Used in:** `src/hooks/useNextAssetId.ts`, components for fetching balances

---

## Pattern 10: Error Handling

### ✅ CORRECT: Parse dispatch errors

```typescript
import { InvalidTxError } from 'polkadot-api'

// Dispatch error structure
interface DispatchError {
  type: 'Module'
  value: {
    type: string  // Pallet name (e.g., "Assets")
    value: {
      type: string  // Error name (e.g., "InsufficientBalance")
    }
  }
}

function parseDispatchError(error: unknown): { pallet: string; errorName: string } | null {
  if (typeof error !== 'object' || error === null) return null
  
  const e = error as DispatchError
  
  if (e.type === 'Module') {
    return {
      pallet: e.value.type,
      errorName: e.value.value.type
    }
  }
  
  return null
}

// Usage in transaction observable
observable.subscribe({
  next: (event) => {
    if (event.type === 'txBestBlocksState' && !event.found.success) {
      const parsed = parseDispatchError(event.found.dispatchError)
      if (parsed) {
        console.error(`${parsed.pallet}.${parsed.errorName}`)
        // Map to user-friendly message
      }
    }
  }
})
```

**Common error types:**
- `DispatchError` (Module) - Runtime errors (e.g., `Assets.InsufficientBalance`)
- `InvalidTxError` - Transaction validation errors (e.g., insufficient fees)
- User rejection - "Cancelled" in error message

**Error mapping:**
```typescript
const errorMessages: Record<string, Record<string, string>> = {
  'Assets': {
    'InsufficientBalance': 'Insufficient balance to complete this operation',
    'NoPermission': 'You do not have permission to perform this action',
    'Unknown': 'Asset not found'
  },
  'Token': {
    'BelowMinimum': 'Amount is below the minimum balance requirement',
    'Frozen': 'Asset is frozen'
  }
}
```

**Used in:** `src/lib/errorParsing.ts`, `src/lib/errorMessages.ts`

---

## Pattern 11: Balance Utilities

### ✅ CORRECT: Use toPlanck/fromPlanck/formatBalance

```typescript
import { toPlanck, fromPlanck, formatBalance } from '@/lib/balance'

// 1. User input to blockchain (toPlanck)
const userInput = '1.5'  // User types "1.5"
const decimals = 18
const planck = toPlanck(userInput, decimals)
// Result: 1500000000000000000n (bigint)

// 2. Blockchain to display (fromPlanck)
const onChainValue = 1500000000000000000n
const readable = fromPlanck(onChainValue, 18)
// Result: "1.5" (string)

// 3. Format for display (formatBalance)
const formatted = formatBalance(readable, {
  symbol: 'QF',
  displayDecimals: 2,
  locale: 'en-US',
  roundingMode: 'round'
})
// Result: "1.50 QF"
```

**Why separate functions?**
- `toPlanck` - Handles decimals, returns bigint (for transactions)
- `fromPlanck` - Inverse, returns plain string (for display)
- `formatBalance` - Adds locale, symbols, rounding (for UI)

**Error handling:**
```typescript
// toPlanck validates input
toPlanck('abc', 18)  // Throws: "Invalid numeric input"
toPlanck('1.5', -1)  // Throws: "Decimals must be non-negative"
toPlanck('1.5', 19)  // Throws: "Decimals exceed maximum 18"
```

**Used in:** All components with amount inputs, balance displays

---

## Pattern 12: TypedApi Types for Parameters

### ✅ CORRECT: Extract types from operations

```typescript
import type { TypedApi } from 'polkadot-api'
import { qfn } from '@polkadot-api/descriptors'

type QfnApi = TypedApi<typeof qfn>

// Define parameter interfaces
export interface CreateAssetParams {
  assetId: string      // User input (converted to number)
  minBalance: string   // User input (converted to bigint via toPlanck)
  name: string
  symbol: string
  decimals: string     // User input (converted to number)
  initialMintAmount: string  // Optional, converted to bigint
  initialMintBeneficiary: string  // SS58 address
}

// Function uses params and converts to correct types
export const createAssetBatch = (
  api: QfnApi,
  params: CreateAssetParams,
  signerAddress: string
) => {
  // Convert user inputs to blockchain types
  const assetId = parseInt(params.assetId)
  const minBalance = toPlanck(params.minBalance, parseInt(params.decimals))
  
  return api.tx.Assets.create({
    id: assetId,  // number
    admin: MultiAddress.Id(signerAddress),  // MultiAddress
    min_balance: minBalance  // bigint
  })
}
```

**Why this pattern?**
- Forms work with strings (user input)
- Blockchain requires specific types (number, bigint, MultiAddress)
- Conversion happens in operation functions
- Type-safe all the way through

**Used in:** `src/lib/assetOperations.ts` (all operation interfaces)

---

## Pattern 13: Descriptor Generation

### ✅ CORRECT: Generate descriptors from chain metadata

```bash
# Install polkadot-api CLI
pnpm add -D polkadot-api

# Generate descriptors (reads polkadot-api.json config)
pnpm papi
```

**What this generates:**
```
.papi/
├── descriptors/
│   └── index.d.ts    # TypedApi types for your chain
└── metadata/
    └── qfn.scale     # Chain metadata snapshot
```

**polkadot-api.json config:**
```json
{
  "version": "0.0.1",
  "chains": {
    "qfn": {
      "wsUrl": "wss://test.qfnetwork.xyz",
      "metadata": ".papi/metadata/qfn.scale"
    }
  }
}
```

**Usage in code:**
```typescript
import { qfn } from '@polkadot-api/descriptors'
import type { TypedApi } from 'polkadot-api'

type QfnApi = TypedApi<typeof qfn>
// Now QfnApi knows about all pallets, extrinsics, queries from QF Network
```

**When to regenerate:**
- Chain runtime upgrade (new pallets, changed types)
- Switching networks (testnet → mainnet)
- Custom chain development

**Used in:** `package.json` (`postinstall` script), `src/hooks/useConnectionStatus.ts`

---

## Pattern 14: Context Integration

### ✅ CORRECT: Three-context architecture

```typescript
// 1. WalletContext - Manages wallet connection
const { 
  selectedAccount,        // Current account
  availableAccounts,      // All accounts
  connect,                // Connect to wallet
  disconnect              // Disconnect
} = useWalletContext()

// 2. ConnectionContext - Manages chain connection
const {
  api,                    // TypedApi instance
  isConnected,            // Connection status
  isReconnecting          // Reconnection in progress
} = useConnectionContext()

// 3. TransactionContext - Manages transaction lifecycle
const {
  startTransaction,       // Begin transaction
  trackTransaction,       // Monitor observable
  completeTransaction,    // Clean up
  transactions            // All active transactions
} = useTransactionContext()

// High-level hook combines all three
const { executeTransaction } = useTransaction(toastConfig)

// Usage
await executeTransaction('mint', observable, params)
```

**Why three contexts?**
- **Separation of concerns**: Wallet ≠ Chain ≠ Transaction
- **Independent testing**: Mock each context separately
- **Selective subscriptions**: Components only subscribe to what they need
- **Avoid prop drilling**: Deep components access directly

**Context hierarchy in App:**
```tsx
<WalletProvider>
  <ConnectionProvider>
    <TransactionProvider>
      <App />
    </TransactionProvider>
  </ConnectionProvider>
</WalletProvider>
```

**Used in:** `src/contexts/`, all components

---

## Pattern 15: Asset Mutation Hook

### ✅ CORRECT: Reusable mutation pattern

```typescript
import { useAssetMutation } from '@/hooks'
import { createAssetBatch, createAssetToasts } from '@/lib'

function MyComponent() {
  const { api } = useConnectionContext()
  const { selectedAccount } = useWalletContext()
  const queryClient = useQueryClient()
  
  const { mutation, transaction } = useAssetMutation<CreateAssetParams>({
    params: formData,
    operationFn: (params) => createAssetBatch(api, params, selectedAccount!.address),
    toastConfig: createAssetToasts,
    transactionKey: 'createAsset',
    isValid: (params) => params.name !== '' && params.symbol !== '',
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['assets'] })
    }
  })
  
  return <button onClick={() => mutation.mutate()}>Create Asset</button>
}
```

**What useAssetMutation does:**
1. Builds transaction from current params
2. Validates params (optional)
3. Wraps in TanStack Query mutation
4. Executes via `useTransaction` hook
5. Tracks lifecycle (signing → finalized)
6. Shows toasts automatically
7. Invalidates queries on success

**Why this pattern?**
- **Reusable**: Same hook for create, mint, transfer, destroy
- **Type-safe**: Generic `<TParams>` for operation-specific types
- **Declarative**: Components just call `mutation.mutate()`
- **Integrated**: Transaction toasts, query invalidation automatic

**Used in:** All operation components (CreateAsset, MintTokens, etc.)

---

## Anti-Patterns to Avoid

### ❌ Anti-Pattern 1: Mixing PJS and PAPI

```typescript
// ❌ NEVER mix packages
import { ApiPromise } from '@polkadot/api'
import { createClient } from 'polkadot-api'

const pjsApi = await ApiPromise.create(/* ... */)
const papiClient = createClient(/* ... */)
// These are incompatible!
```

### ❌ Anti-Pattern 2: Manual reconnection logic

```typescript
// ❌ Don't handle reconnection manually
if (!isConnected) {
  await client.reconnect()  // polkadot-api handles this automatically
}
```

### ❌ Anti-Pattern 3: Using `any` for types

```typescript
// ❌ Never use any
const result: any = await api.query.Assets.Asset.getValue(1)

// ✅ Let TypeScript infer or use proper types
const result = await api.query.Assets.Asset.getValue(1)
// result is properly typed from descriptors
```

### ❌ Anti-Pattern 4: String concatenation for amounts

```typescript
// ❌ Don't manipulate bigints as strings
const amount = BigInt(value + '000000000000000000')

// ✅ Use toPlanck helper
const amount = toPlanck(value, 18)
```

### ❌ Anti-Pattern 5: Not checking connection status

```typescript
// ❌ Querying without checking connection
const balance = await api.query.System.Account.getValue(address)

// ✅ Always check isConnected
const { isConnected, api } = useConnectionContext()
if (isConnected) {
  const balance = await api.query.System.Account.getValue(address)
}
```

---

## Testing Patterns

### ✅ CORRECT: Mock polkadot-api objects

```typescript
import { describe, it, expect, vi } from 'vitest'

describe('assetOperations', () => {
  it('creates asset with correct parameters', () => {
    // Mock TypedApi
    const mockApi = {
      tx: {
        Assets: {
          create: vi.fn((params) => ({
            decodedCall: { callData: 'mock' }
          }))
        },
        Utility: {
          batch_all: vi.fn((calls) => ({
            signSubmitAndWatch: vi.fn()
          }))
        }
      }
    } as unknown as QfnApi
    
    const params: CreateAssetParams = {
      assetId: '1',
      name: 'Test',
      symbol: 'TST',
      decimals: '12',
      minBalance: '1',
      initialMintAmount: '',
      initialMintBeneficiary: ''
    }
    
    const result = createAssetBatch(mockApi, params, 'address')
    
    expect(mockApi.tx.Assets.create).toHaveBeenCalledWith({
      id: 1,
      admin: MultiAddress.Id('address'),
      min_balance: expect.any(BigInt)
    })
  })
})
```

**Used in:** `src/__tests__/lib/assetOperations.test.ts`

---

## Quick Reference: Common Operations

| Operation | Pattern | Key Types |
|-----------|---------|-----------|
| **Import packages** | `from 'polkadot-api'` | Binary, createClient, TypedApi |
| **Create client** | `createClient(getWsProvider(url))` | Client, TypedApi |
| **Get typed API** | `client.getTypedApi(chain)` | TypedApi<typeof chain> |
| **Build transaction** | `api.tx.Pallet.method(params)` | Transaction<...> |
| **Sign & watch** | `tx.signSubmitAndWatch(signer)` | Observable<TxBroadcastEvent> |
| **Use address** | `MultiAddress.Id(address)` | MultiAddress<SS58String, number> |
| **Use text** | `Binary.fromText(str)` | Binary |
| **Use amount** | `toPlanck(str, decimals)` | bigint |
| **Batch calls** | `api.tx.Utility.batch_all({ calls })` | TxCallData[] |
| **Query storage** | `api.query.Pallet.Storage.getValue(key)` | Promise<T \| undefined> |
| **Parse error** | Check `event.found.dispatchError` | DispatchError |

---

## Resources for Skill Development

### Official Documentation
- **polkadot-api docs**: https://papi.how
- **Substrate docs**: https://docs.substrate.io

### Example Code
- This codebase: See `src/lib/assetOperations.ts`, `src/hooks/useTransaction.ts`
- Official examples: https://github.com/polkadot-api/polkadot-api/tree/main/examples

### Key Differences from PJS
| Concept | @polkadot/api (PJS) | polkadot-api (PAPI) |
|---------|---------------------|---------------------|
| Import | `@polkadot/api` | `polkadot-api` |
| Client | `ApiPromise.create()` | `createClient(provider).getTypedApi()` |
| Types | Generated `.d.ts` files | TypedApi from descriptors |
| Transactions | `api.tx.*.signAndSend()` | `api.tx.*.signSubmitAndWatch()` |
| Queries | `api.query.*()` | `api.query.*.getValue()` |
| Accounts | String (implicit) | `MultiAddress.Id()` (explicit) |
| Text | String (implicit) | `Binary.fromText()` (explicit) |
| Amounts | `number` or `BN` | `bigint` only |

---

## Checklist for New Operations

When creating a new blockchain operation, ensure:

- [ ] Import from `polkadot-api`, NOT `@polkadot/api`
- [ ] Function accepts `TypedApi<typeof chain>` as first parameter
- [ ] Addresses use `MultiAddress.Id()`
- [ ] Text/metadata uses `Binary.fromText()`
- [ ] Amounts use `toPlanck()` to convert to `bigint`
- [ ] Multi-step operations use `Utility.batch_all` with `.decodedCall`
- [ ] Transaction uses `.signSubmitAndWatch()` for observable
- [ ] Observable subscribed in `useTransaction` hook
- [ ] Toast config defined in `src/lib/toastConfigs.ts`
- [ ] Query invalidation on success
- [ ] Error handling with dispatch error parsing
- [ ] TypeScript types (no `any`, no type assertions)
- [ ] Unit tests with mocked API

---

**This reference document should be broken into individual skills for the workflow.**

Each pattern becomes a section in the relevant skill file:
- Patterns 1-3 → `polkadot-api-transactions.md` skill
- Patterns 7-8 → `polkadot-api-observables.md` skill
- Pattern 9 → `polkadot-api-queries.md` skill
- Pattern 11 → `balance-utilities.md` skill
- Etc.

