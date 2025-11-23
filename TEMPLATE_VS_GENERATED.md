# Template vs. Generated Code - Visual Breakdown

> This document shows **exactly** what exists in the template (never regenerated) vs. what Claude generates (per user config).

---

## File-by-File Breakdown

### ✅ Template Files (Pre-built, Never Modified)

```
/Users/myuser/my-polkadot-app/
├── 📁 .cursor/
│   └── 📁 composer/
│       └── 📁 skills/                               ✅ Pre-built (8 skills)
│           ├── polkadot-api-transactions.md
│           ├── polkadot-api-queries.md
│           ├── polkadot-api-observables.md
│           ├── asset-pallet-patterns.md
│           ├── batch-operations.md
│           ├── balance-utilities.md
│           ├── component-patterns.md
│           └── error-handling.md
│
├── 📁 src/
│   ├── 📁 contexts/                                 ✅ Pre-built (3 contexts)
│   │   ├── WalletContext.tsx                        ✅ 237 lines
│   │   ├── ConnectionContext.tsx                    ✅ 58 lines
│   │   ├── TransactionContext.tsx                   ✅ 318 lines
│   │   └── index.ts                                 ✅ Barrel export
│   │
│   ├── 📁 hooks/                                    ✅ Pre-built (11 hooks)
│   │   ├── useWallet.ts                             ✅ 118 lines (wallet logic)
│   │   ├── useWalletContext.ts                      ✅ 17 lines (context accessor)
│   │   ├── useConnectionStatus.ts                   ✅ 59 lines (PAPI client setup)
│   │   ├── useConnectionContext.ts                  ✅ 17 lines (context accessor)
│   │   ├── useTransactionManager.ts                 ✅ 178 lines (lifecycle manager)
│   │   ├── useTransaction.ts                        ✅ 74 lines (high-level API)
│   │   ├── useTransactionContext.ts                 ✅ 21 lines (context accessor)
│   │   ├── useTransactionToasts.ts                  ✅ 89 lines (toast observer)
│   │   ├── useAssetMutation.ts                      ✅ 58 lines (TanStack wrapper)
│   │   ├── useFee.ts                                🔧 Generated (but reusable)
│   │   ├── useNextAssetId.ts                        🔧 Generated (Assets-specific)
│   │   └── index.ts                                 🔧 Updated (barrel export)
│   │
│   ├── 📁 lib/                                      ✅ Pre-built utilities
│   │   ├── 📁 balance/                              ✅ Complete balance utilities
│   │   │   ├── toPlanck.ts                          ✅ 53 lines (+ 47 lines tests)
│   │   │   ├── fromPlanck.ts                        ✅ 38 lines (+ 36 lines tests)
│   │   │   ├── format.ts                            ✅ 89 lines (+ 112 lines tests)
│   │   │   ├── config.ts                            ✅ 22 lines (constants)
│   │   │   └── index.ts                             ✅ Barrel export
│   │   │
│   │   ├── errorParsing.ts                          ✅ 272 lines (type-safe parsing)
│   │   ├── errorMessages.ts                         ✅ 87 lines (error mappings)
│   │   ├── transactionErrors.ts                     ✅ 158 lines (error classes)
│   │   ├── queryClient.ts                           ✅ 21 lines (TanStack setup)
│   │   ├── queryHelpers.ts                          ✅ 15 lines (invalidation helpers)
│   │   ├── toastConfigs.ts                          ✅ 70 lines (type defs + examples)
│   │   ├── walletStorage.ts                         ✅ 42 lines (localStorage)
│   │   ├── utils.ts                                 ✅ 6 lines (cn helper)
│   │   ├── assetOperations.ts                       🔧 Generated (feature-specific)
│   │   └── index.ts                                 🔧 Updated (barrel export)
│   │
│   ├── 📁 components/
│   │   ├── 📁 ui/                                   ✅ Pre-built (9 shadcn components)
│   │   │   ├── button.tsx                           ✅ 56 lines
│   │   │   ├── card.tsx                             ✅ 77 lines
│   │   │   ├── input.tsx                            ✅ 25 lines
│   │   │   ├── label.tsx                            ✅ 25 lines
│   │   │   ├── select.tsx                           ✅ 149 lines
│   │   │   ├── badge.tsx                            ✅ 36 lines
│   │   │   ├── dropdown-menu.tsx                    ✅ 198 lines
│   │   │   ├── collapsible.tsx                      ✅ 9 lines
│   │   │   ├── sonner.tsx                           ✅ 31 lines
│   │   │   └── index.ts                             ✅ Barrel export
│   │   │
│   │   ├── 📁 error-boundaries/                     ✅ Pre-built (3 boundaries)
│   │   │   ├── AppErrorBoundary.tsx                 ✅ 64 lines
│   │   │   ├── FeatureErrorBoundary.tsx             ✅ 55 lines
│   │   │   ├── ComponentErrorBoundary.tsx           ✅ 52 lines
│   │   │   └── index.ts                             ✅ Barrel export
│   │   │
│   │   ├── WalletConnector.tsx                      ✅ 142 lines
│   │   ├── AccountSelector.tsx                      ✅ 98 lines
│   │   ├── AccountDashboard.tsx                     ✅ 87 lines
│   │   ├── ConnectionBanner.tsx                     ✅ 54 lines
│   │   ├── TransactionReview.tsx                    ✅ 67 lines (generic, data-driven)
│   │   ├── TransactionFormFooter.tsx                ✅ 48 lines (reusable)
│   │   ├── FeeDisplay.tsx                           ✅ 38 lines
│   │   ├── MutationError.tsx                        ✅ 23 lines
│   │   │
│   │   ├── CreateAsset.tsx                          🔧 Generated (if assets.operations includes 'create')
│   │   ├── MintTokens.tsx                           🔧 Generated (if assets.operations includes 'mint')
│   │   ├── TransferTokens.tsx                       🔧 Generated (if assets.operations includes 'transfer')
│   │   ├── DestroyAsset.tsx                         🔧 Generated (if assets.operations includes 'destroy')
│   │   ├── AssetList.tsx                            🔧 Generated (if assets.enabled)
│   │   ├── AssetCard.tsx                            🔧 Generated (if assets.enabled)
│   │   ├── AssetBalance.tsx                         🔧 Generated (if assets.enabled)
│   │   └── index.ts                                 🔧 Updated (barrel export)
│   │
│   ├── App.tsx                                      🔧 Modified (navigation based on features)
│   ├── main.tsx                                     🔧 Modified (network config)
│   ├── App.css                                      ✅ Pre-built
│   ├── index.css                                    ✅ Pre-built
│   └── vite-env.d.ts                                ✅ Pre-built
│
├── 📁 public/
│   └── qf-logo.svg                                  🔧 Replaced (user branding)
│
├── CLAUDE.md                                        ✅ Pre-built (with workflow section added)
├── README.md                                        🔧 Updated (project name, description)
├── package.json                                     ✅ Pre-built (all deps included)
├── tsconfig.json                                    ✅ Pre-built
├── vite.config.ts                                   ✅ Pre-built
├── vitest.config.ts                                 ✅ Pre-built
├── eslint.config.ts                                 ✅ Pre-built
├── components.json                                  ✅ Pre-built (shadcn config)
├── wizard-config.json                               🔧 Generated by wizard
└── polkadot-api.json                                🔧 Modified (network URL based on deployment)
```

---

## Legend

| Icon | Meaning | Count | Total Lines |
|------|---------|-------|-------------|
| ✅ | **Pre-built in template** (never regenerated) | ~65 files | ~4,500 lines |
| 🔧 | **Generated by workflow** (based on wizard config) | ~10-15 files | ~1,200 lines |

---

## Size Comparison

### Template Infrastructure (Pre-built)

| Category | Files | Lines of Code | Purpose |
|----------|-------|---------------|---------|
| **Contexts** | 3 files | 613 lines | Wallet, Connection, Transaction state |
| **Core Hooks** | 8 files | 553 lines | Wallet, connection, transaction management |
| **Balance Utilities** | 4 files | 202 lines | toPlanck, fromPlanck, formatBalance |
| **Balance Tests** | 3 files | 195 lines | Unit tests for balance utilities |
| **Error Handling** | 3 files | 517 lines | Parsing, messages, error classes |
| **Query Utilities** | 2 files | 36 lines | TanStack Query setup |
| **Generic Components** | 8 files | 570 lines | Wallet, account, transaction UI |
| **UI Components** | 9 files | 606 lines | shadcn/ui (button, card, input, etc.) |
| **Error Boundaries** | 3 files | 171 lines | App, feature, component boundaries |
| **Config Files** | 8 files | ~300 lines | TypeScript, Vite, ESLint, etc. |
| **Documentation** | 1 file | 151 lines | CLAUDE.md conventions |
| **TOTAL** | **52 files** | **~3,914 lines** | **Core infrastructure** |

### Generated Feature Code (Assets Example)

| Category | Files | Lines of Code | Generated When |
|----------|-------|---------------|----------------|
| **Operations** | 1 file | 133 lines | `features.assets.enabled = true` |
| **Feature Hooks** | 2 files | 70 lines | `features.assets.enabled = true` |
| **List Components** | 3 files | 420 lines | `features.assets.enabled = true` |
| **Create Component** | 1 file | 272 lines | `operations: ["create"]` |
| **Mint Component** | 1 file | 190 lines | `operations: ["mint"]` |
| **Transfer Component** | 1 file | 185 lines | `operations: ["transfer"]` |
| **Destroy Component** | 1 file | 158 lines | `operations: ["destroy"]` |
| **App.tsx Update** | Modified | +80 lines | Always (navigation) |
| **TOTAL** | **9 files** | **~1,508 lines** | **Feature-specific** |

---

## What Changes Based on Wizard Config

### Scenario 1: Minimal Configuration
```json
{
  "features": {
    "assets": {
      "enabled": true,
      "operations": ["transfer"]  // Only transfer, no create/mint/destroy
    }
  },
  "ui": { "layout": "minimal" }
}
```

**Generated files:**
- ✅ `src/lib/assetOperations.ts` (only `transferTokens` function)
- ✅ `src/components/TransferTokens.tsx`
- ✅ `src/components/AssetList.tsx` (read-only, no actions)
- ✅ `src/hooks/useFee.ts`
- ✅ `src/App.tsx` (minimal layout, just transfer option)

**Total: 5 files, ~550 lines**

### Scenario 2: Full Asset Management
```json
{
  "features": {
    "assets": {
      "enabled": true,
      "operations": ["create", "mint", "transfer", "destroy"]
    }
  },
  "ui": { "layout": "sidebar" }
}
```

**Generated files:**
- ✅ `src/lib/assetOperations.ts` (all 4 functions)
- ✅ `src/components/CreateAsset.tsx`
- ✅ `src/components/MintTokens.tsx`
- ✅ `src/components/TransferTokens.tsx`
- ✅ `src/components/DestroyAsset.tsx`
- ✅ `src/components/AssetList.tsx`
- ✅ `src/components/AssetCard.tsx`
- ✅ `src/components/AssetBalance.tsx`
- ✅ `src/hooks/useNextAssetId.ts`
- ✅ `src/hooks/useFee.ts`
- ✅ `src/App.tsx` (sidebar layout, 5 navigation items)

**Total: 11 files, ~1,500 lines**

### Scenario 3: Multi-Feature (Future)
```json
{
  "features": {
    "assets": {
      "enabled": true,
      "operations": ["create", "mint", "transfer"]
    },
    "nfts": {
      "enabled": true,
      "marketplace": false
    },
    "governance": {
      "enabled": true,
      "voting_mechanisms": ["democracy"]
    }
  },
  "ui": { "layout": "sidebar" }
}
```

**Generated files:**
- ✅ Assets: 10 files (~1,300 lines)
- ✅ NFTs: 8 files (~1,100 lines)
- ✅ Governance: 6 files (~900 lines)
- ✅ `src/App.tsx` (integrated navigation for all features)

**Total: 25 files, ~3,300 lines**

---

## Code Reuse Analysis

### ✅ What Gets Reused Across Features

These components/hooks work with **any** Substrate pallet:

| File | Reused By | Why |
|------|-----------|-----|
| `useAssetMutation` | Assets, NFTs, Governance, Staking | Generic mutation wrapper |
| `useTransaction` | All features | Transaction execution API |
| `TransactionReview` | All features | Data-driven review UI |
| `TransactionFormFooter` | All features | Reusable footer with fee display |
| `FeeDisplay` | All features | Generic fee calculation display |
| `MutationError` | All features | Generic error display |
| `useTransactionToasts` | All features | Observes TransactionContext |
| Balance utilities | All features | toPlanck/fromPlanck work for any token |
| Error handling | All features | Works with any DispatchError |

**Key insight**: Infrastructure is pallet-agnostic. Only operation functions and form fields change.

### 🔧 What's Feature-Specific

These files are unique per feature:

| Feature | Feature-Specific Code | Reuses Infrastructure |
|---------|----------------------|----------------------|
| **Assets** | `assetOperations.ts` (4 functions)<br>Form components (4 files)<br>List/Card (3 files) | ✅ All contexts<br>✅ All hooks<br>✅ All UI components<br>✅ Error handling |
| **NFTs** (future) | `nftOperations.ts`<br>NFT forms<br>Gallery component | ✅ Same infrastructure |
| **Governance** (future) | `governanceOperations.ts`<br>Proposal forms<br>Voting UI | ✅ Same infrastructure |

**Pattern**: Each feature is ~1,200 lines of code, all following the same architecture.

---

## Token Cost Breakdown by File

### Context Loading (One-Time per Session)

| File | Size | Load Cost (Input) |
|------|------|-------------------|
| `CLAUDE.md` | 151 lines | 3,000 tokens |
| `wizard-config.json` | 30 lines | 500 tokens |
| Skills (3 loaded) | ~500 lines total | 15,000 tokens |
| Reference doc (1) | ~200 lines | 5,000 tokens |
| **Subtotal** | | **23,500 tokens** |

### Code Generation (Per File)

| File | Size | Gen Cost (Input + Output) |
|------|------|---------------------------|
| `assetOperations.ts` | 133 lines | 4,500 tokens |
| `CreateAsset.tsx` | 272 lines | 7,000 tokens |
| `MintTokens.tsx` | 190 lines | 6,000 tokens |
| `TransferTokens.tsx` | 185 lines | 6,000 tokens |
| `useNextAssetId.ts` | 30 lines | 1,800 tokens |
| `useFee.ts` | 40 lines | 1,800 tokens |
| `AssetList.tsx` | 150 lines | 5,000 tokens |
| `AssetCard.tsx` | 140 lines | 4,000 tokens |
| `AssetBalance.tsx` | 130 lines | 3,500 tokens |
| `App.tsx` update | 80 lines modified | 4,000 tokens |
| **Subtotal** | **1,350 lines** | **43,600 tokens** |

### Validation

| Step | Cost |
|------|------|
| Run scripts, parse output | 2,500 tokens |
| Fix errors (if any) | 2,500 tokens |
| **Subtotal** | **5,000 tokens** |

### **Total: ~72,100 tokens (~$0.50)**

---

## File Size Comparison: Template vs. Scratch

If we had to generate infrastructure from scratch (no template):

| Infrastructure File | Lines | Gen Cost |
|---------------------|-------|----------|
| `WalletContext.tsx` | 237 | 6,000 tokens |
| `ConnectionContext.tsx` | 58 | 3,000 tokens |
| `TransactionContext.tsx` | 318 | 10,000 tokens |
| `useWallet.ts` | 118 | 5,000 tokens |
| `useConnectionStatus.ts` | 59 | 3,000 tokens |
| `useTransactionManager.ts` | 178 | 8,000 tokens |
| `useTransaction.ts` | 74 | 4,000 tokens |
| `useAssetMutation.ts` | 58 | 3,000 tokens |
| Balance utilities (4 files) | 202 | 8,000 tokens |
| Error handling (3 files) | 517 | 15,000 tokens |
| Generic components (8 files) | 570 | 18,000 tokens |
| UI components (9 files) | 606 | 20,000 tokens |
| Error boundaries (3 files) | 171 | 6,000 tokens |
| **Infrastructure Total** | **3,166 lines** | **~109,000 tokens** |

**Comparison:**
- **With template**: 72k tokens ($0.50) ✅
- **Without template**: 109k + 43k = 152k tokens ($1.30) ❌

**Savings: 53% reduction in cost, 100% increase in quality (tested infrastructure)**

---

## Example: Side-by-Side File Content

### Pre-built: `useAssetMutation.ts` ✅

```typescript
import type { Transaction } from 'polkadot-api'
import type { ToastConfig } from '@/lib/toastConfigs'
import { useMutation } from '@tanstack/react-query'
import { useTransaction } from './useTransaction'
import { useWalletContext } from './useWalletContext'

interface AssetMutationConfig<TParams> {
  params: TParams
  operationFn: (params: TParams) => Transaction<object, string, string, unknown>
  toastConfig: ToastConfig<TParams>
  onSuccess?: () => void | Promise<void>
  transactionKey: string
  isValid?: (params: TParams) => boolean
}

export const useAssetMutation = <TParams>({
  params,
  operationFn,
  toastConfig,
  onSuccess,
  transactionKey,
  isValid,
}: AssetMutationConfig<TParams>) => {
  const { selectedAccount } = useWalletContext()
  const { executeTransaction } = useTransaction<TParams>(toastConfig)

  const transaction =
    selectedAccount && (!isValid || isValid(params))
      ? operationFn(params)
      : null

  const mutation = useMutation({
    mutationFn: async () => {
      if (!selectedAccount || !transaction) {
        throw new Error('No account selected or transaction not available')
      }

      const observable = transaction.signSubmitAndWatch(
        selectedAccount.polkadotSigner
      )
      await executeTransaction(transactionKey, observable, params)
    },
    onSuccess: async () => {
      if (onSuccess) {
        await onSuccess()
      }
    },
  })

  return {
    mutation,
    transaction,
  }
}
```

**Status**: ✅ Exists in template, never regenerated  
**Reusability**: Works with Assets, NFTs, Governance, any pallet  
**Why pre-built**: Complex logic, tested, follows best practices

---

### Generated: `assetOperations.ts` 🔧

```typescript
import { Binary, type TxCallData, type TypedApi } from 'polkadot-api'
import { MultiAddress, type qfn } from '@polkadot-api/descriptors'
import { toPlanck } from './balance'

type QfnApi = TypedApi<typeof qfn>

export interface MintParams {
  assetId: string
  recipient: string
  amount: string
  decimals: number
}

export const mintTokens = (api: QfnApi, params: MintParams) => {
  const assetId = parseInt(params.assetId)
  const amount = toPlanck(params.amount, params.decimals)

  return api.tx.Assets.mint({
    id: assetId,
    beneficiary: MultiAddress.Id(params.recipient),
    amount,
  })
}
```

**Status**: 🔧 Generated by Claude based on:
- Skills: `polkadot-api-transactions.md`, `asset-pallet-patterns.md`
- Config: `features.assets.operations: ["mint"]`
- Reference: `assetOperations-lib.md`

**Why generated**: Feature-specific, depends on user selections

---

## Directory Structure Visualization

### Before Generation (Fresh Template Clone)

```
my-polkadot-app/
├── src/
│   ├── contexts/        ✅ 3 files (complete)
│   ├── hooks/           ✅ 8 files (complete) + 2 empty slots
│   ├── lib/
│   │   ├── balance/     ✅ Complete (4 files)
│   │   ├── error*.ts    ✅ Complete (3 files)
│   │   ├── query*.ts    ✅ Complete (2 files)
│   │   ├── utils.ts     ✅ Complete
│   │   └── index.ts     ✅ Exports pre-built utilities
│   ├── components/
│   │   ├── ui/          ✅ Complete (9 components)
│   │   ├── error-boundaries/ ✅ Complete (3 boundaries)
│   │   ├── Wallet*.tsx  ✅ Complete (2 files)
│   │   ├── Account*.tsx ✅ Complete (2 files)
│   │   ├── Transaction*.tsx ✅ Complete (3 files)
│   │   ├── Connection*.tsx ✅ Complete (1 file)
│   │   └── index.ts     ✅ Exports pre-built components
│   ├── App.tsx          ✅ Minimal starter (no features)
│   └── main.tsx         ✅ Basic setup
└── .cursor/
    └── composer/
        └── skills/      ✅ 8 PAPI skills
```

**Total: 52 files, ~3,900 lines**

### After Generation (Assets Feature Added)

```
my-polkadot-app/
├── src/
│   ├── contexts/        ✅ 3 files (unchanged)
│   ├── hooks/           ✅ 8 files + 🔧 2 new files (useFee, useNextAssetId)
│   ├── lib/
│   │   ├── balance/     ✅ Complete (unchanged)
│   │   ├── error*.ts    ✅ Complete (unchanged)
│   │   ├── 🔧 assetOperations.ts  (new)
│   │   └── 🔧 index.ts  (updated exports)
│   ├── components/
│   │   ├── ui/          ✅ Complete (unchanged)
│   │   ├── error-boundaries/ ✅ Complete (unchanged)
│   │   ├── Wallet*.tsx  ✅ Complete (unchanged)
│   │   ├── 🔧 CreateAsset.tsx  (new)
│   │   ├── 🔧 MintTokens.tsx   (new)
│   │   ├── 🔧 TransferTokens.tsx (new)
│   │   ├── 🔧 DestroyAsset.tsx (new)
│   │   ├── 🔧 AssetList.tsx    (new)
│   │   ├── 🔧 AssetCard.tsx    (new)
│   │   ├── 🔧 AssetBalance.tsx (new)
│   │   └── 🔧 index.ts  (updated exports)
│   ├── 🔧 App.tsx       (modified: navigation added)
│   └── ✅ main.tsx      (unchanged or network config updated)
└── .cursor/
    └── composer/
        └── skills/      ✅ 8 PAPI skills (unchanged)
```

**Total: 62 files, ~5,400 lines**  
**Change: +10 files, +1,500 lines**

---

## Key Takeaways

### 1. **80/20 Rule in Action**
- 80% of code (infrastructure) is pre-built ✅
- 20% of code (features) is generated 🔧
- Results in 53% cost savings

### 2. **Quality > Speed for Infrastructure**
- Contexts, hooks, error handling are complex
- Pre-built = tested, follows best practices
- Never regenerate = no regression risk

### 3. **Customization Where It Matters**
- Feature code varies per user needs
- Form fields, operations, UI specific to use case
- Generated from established patterns

### 4. **Reusability is Built-In**
- `useAssetMutation` works for any pallet
- Generic components (TransactionReview, etc.) used everywhere
- Add NFTs? Just generate new operations, reuse infrastructure

### 5. **Scaling is Predictable**
- Each feature ≈ 1,200-1,500 lines
- Each feature ≈ 40-50k tokens
- 3 features ≈ 150k tokens total (with 23k context loading)

---

## Validation: What Gets Checked

### Pre-built Files (Template)
- ✅ Already passed validation (tests, lints)
- ✅ Never checked again (waste of tokens)

### Generated Files
- 🔧 Check imports (no `@polkadot/api`)
- 🔧 Check types (no `any`, no `as`)
- 🔧 Check exports (barrel files updated)
- 🔧 Run TypeScript compiler
- 🔧 Run ESLint
- 🔧 Run tests (if applicable)

**Validation cost: ~5k tokens (worth it to catch mistakes early)**

---

## Conclusion: The Template is the Product

The template contains 3,900 lines of **battle-tested infrastructure**.  
The workflow adds 1,200-1,500 lines of **feature-specific code** per feature.

**This is not a code generator. It's a feature activator.**

Users get:
- ✅ Senior-level architecture (contexts, error handling, type safety)
- ✅ Best-practice PAPI patterns (Binary, MultiAddress, observables)
- ✅ Production-ready infrastructure (tested, documented, maintainable)
- ✅ Customized features (based on their selections)

All in ~5 minutes, for ~$0.50.

That's the power of template-first + skills-based workflows.

