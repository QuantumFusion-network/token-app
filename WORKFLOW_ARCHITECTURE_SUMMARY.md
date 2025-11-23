# Polkadot dApp Workflow - Executive Summary

## TL;DR

We've designed a **3-step workflow** that turns a wizard form into a working Polkadot dApp in ~5 minutes:

1. **Wizard** → User selects features (assets, NFTs, etc.) → Generates `wizard-config.json`
2. **Template Clone** → `npx degit` clones pre-built infrastructure (contexts, hooks, error handling)
3. **Claude Composer** → "Generate my app" → Claude creates feature-specific code following established patterns

**Cost per run**: ~$0.40 (60,000 tokens)  
**Time to working app**: 5-10 minutes  
**Code quality**: Follows `polkadot-api` best practices, fully typed, tested patterns

---

## Key Architectural Decisions

### 1. Template-First Approach ✅

**90% of code is pre-built, never generated:**
- Wallet connection & account management
- Blockchain connection with auto-reconnect
- Transaction lifecycle tracking (signing → finalized)
- Error handling & user-friendly messages
- Balance utilities (toPlanck, fromPlanck, formatting)
- TanStack Query setup with proper cache configs
- shadcn/ui component library

**Why this matters:**
- Saves ~60% tokens per run ($0.40 vs $1.50)
- Guarantees quality (tested, follows conventions)
- Consistency across all generated apps
- Users can't accidentally break core patterns

### 2. Skills-Based Knowledge Encoding ✅

**8 skills capture critical `polkadot-api` patterns:**
- `polkadot-api-transactions.md` - How to build transactions (Binary, MultiAddress, TypedApi)
- `polkadot-api-queries.md` - Query patterns with TanStack Query
- `polkadot-api-observables.md` - Transaction observables & lifecycle
- `asset-pallet-patterns.md` - Assets pallet specifics
- `batch-operations.md` - Utility.batch_all for atomic operations
- `balance-utilities.md` - toPlanck/fromPlanck usage
- `component-patterns.md` - React component structure
- `error-handling.md` - Transaction error patterns

**Why skills > documentation:**
- Skills loaded once (~15k tokens), reused infinitely
- Version controlled, updated independently
- Anthropic's Skills protocol for easy distribution
- Prevents common mistakes (using `@polkadot/api` instead of `polkadot-api`)

### 3. Feature-Level Configuration ✅

**Users configure what, not how:**
```json
{
  "features": {
    "assets": { "enabled": true, "operations": ["create", "mint", "transfer"] },
    "nfts": { "enabled": false },
    "governance": { "enabled": false }
  },
  "ui": { "layout": "sidebar" }
}
```

**Claude translates to implementation:**
- Reads config → Loads relevant skills → Generates components
- No need for users to know "use TanStack Query with 30s stale time"
- Junior devs get senior-level patterns automatically

---

## The Three Critical PAPI Patterns

These patterns **must** be in every skill to prevent confusion:

### ❌ Pattern 1: WRONG Package (Most Common Mistake)
```typescript
// ❌ NEVER use @polkadot/api
import { ApiPromise } from '@polkadot/api'
```

### ✅ Pattern 1: Correct Package
```typescript
// ✅ ALWAYS use polkadot-api
import { Binary, createClient, type TypedApi } from 'polkadot-api'
import { MultiAddress } from '@polkadot-api/descriptors'
```

### ✅ Pattern 2: MultiAddress & Binary
```typescript
// Addresses use MultiAddress.Id()
const recipient = MultiAddress.Id('5GrwvaEF...')

// Text uses Binary.fromText()
const name = Binary.fromText('My Token')

// Amounts use bigint (with toPlanck helper)
const amount = toPlanck('1.5', 18)  // 1500000000000000000n
```

### ✅ Pattern 3: Observable Pattern
```typescript
// Transactions return observables for progress tracking
const observable = api.tx.Assets.transfer({...}).signSubmitAndWatch(signer)

observable.subscribe({
  next: (event) => {
    if (event.type === 'finalized') {
      console.log('Done!')
    }
  },
  error: (err) => console.error(err)
})
```

---

## Workflow Visualization

```
┌─────────────────────────────────────────────────────────┐
│  WIZARD (External Tool)                                 │
│  ┌───────────────────────────────────────────────────┐  │
│  │ Step 1: Project type → User-facing app           │  │
│  │ Step 2: Features → Assets (create, mint, transfer)│ │
│  │ Step 3: Environment → Testnet                     │  │
│  └───────────────────────────────────────────────────┘  │
│                                                         │
│  Output: wizard-config.json                             │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  TEMPLATE CLONE                                         │
│  $ npx degit user/polkadot-template my-app              │
│  $ cd my-app                                            │
│                                                         │
│  Template includes:                                     │
│  ✅ src/contexts/ (Wallet, Connection, Transaction)     │
│  ✅ src/hooks/ (useWallet, useTransaction, etc.)        │
│  ✅ src/lib/ (balance utils, error handling, TanStack)  │
│  ✅ src/components/ui/ (shadcn/ui components)           │
│  ✅ CLAUDE.md (conventions)                             │
│  ✅ .cursor/composer/skills/ (8 PAPI skills)            │
│  ✅ wizard-config.json (from wizard)                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  CLAUDE COMPOSER                                        │
│                                                         │
│  User: "Generate my app based on wizard-config.json"   │
│                                                         │
│  Claude Workflow:                                       │
│  1️⃣  Read wizard-config.json                            │
│  2️⃣  Load skills (polkadot-api-*, asset-pallet-*)       │
│  3️⃣  Generate lib/assetOperations.ts                    │
│  4️⃣  Generate CreateAsset.tsx, MintTokens.tsx, etc.     │
│  5️⃣  Update App.tsx with navigation                     │
│  6️⃣  Run validation scripts (imports, types, lints)     │
│  7️⃣  Output: "Ready! Run `pnpm install && pnpm dev`"    │
│                                                         │
│  Token usage: ~60,000 tokens (~$0.40)                   │
│  Time: ~2-3 minutes                                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  WORKING dAPP                                           │
│  $ pnpm install                                         │
│  $ pnpm papi        # Generate chain descriptors        │
│  $ pnpm dev         # Start dev server                  │
│                                                         │
│  ✅ Wallet connection works                             │
│  ✅ Asset creation, minting, transfer UI ready          │
│  ✅ Transaction lifecycle with progress toasts          │
│  ✅ Error handling with user-friendly messages          │
│  ✅ Fully typed with TypeScript                         │
│  ✅ Follows polkadot-api best practices                 │
└─────────────────────────────────────────────────────────┘
```

---

## Token Cost Comparison

| Approach | Context Loading | Code Gen | Total | Cost @ $3/$15 |
|----------|-----------------|----------|-------|---------------|
| **With Template** | 23.5k tokens | 36.5k tokens | **60k** | **$0.40** ✅ |
| Without Template | 80k tokens | 70k tokens | 150k | $1.50 ❌ |

**At scale (1,000 users, 3 runs each):**
- With template: **$1,200/year** ✅
- Without template: $4,500/year ❌

**Savings: 73% reduction**

---

## What Gets Generated

For a typical "assets" feature selection:

### Library Code (1 file)
```
src/lib/assetOperations.ts (~150 lines)
- createAssetBatch(api, params, signerAddress)
- mintTokens(api, params)
- transferTokens(api, params)
- destroyAssetBatch(api, params)
```

### Components (3-4 files)
```
src/components/CreateAsset.tsx (~250 lines)
src/components/MintTokens.tsx (~180 lines)
src/components/TransferTokens.tsx (~180 lines)
src/components/DestroyAsset.tsx (~150 lines) [if selected]
```

### Hooks (2 files)
```
src/hooks/useNextAssetId.ts (~30 lines)
src/hooks/useFee.ts (~40 lines)
```

### App Integration (1 file modified)
```
src/App.tsx (navigation items added)
```

**Total: ~6-8 files, ~900 lines of code**

All following:
- CLAUDE.md conventions (no `any`, no `useReducer`, barrel exports)
- `polkadot-api` patterns (Binary, MultiAddress, observables)
- Established architecture (useAssetMutation, TransactionContext)

---

## Extensibility: Adding New Features

**NFTs (future):**
```json
{ "features": { "nfts": { "enabled": true } } }
```

Claude workflow:
1. Load skills: `nft-pallet-patterns.md`
2. Generate: `lib/nftOperations.ts`, `components/NftMint.tsx`, etc.
3. Update: App.tsx navigation
4. Uses same infrastructure: `useAssetMutation`, `useTransaction`, error handling

**Governance (future):**
```json
{ "features": { "governance": { "enabled": true } } }
```

Claude workflow:
1. Load skills: `governance-pallet-patterns.md`
2. Generate: `lib/governanceOperations.ts`, `components/CreateProposal.tsx`, etc.
3. Same patterns, different pallet

**This is the power of the template**: Infrastructure handles ANY Substrate pallet interaction.

---

## Quality Guarantees

### Validation Scripts Ensure:
1. ✅ No `@polkadot/api` imports (only `polkadot-api`)
2. ✅ No `any` types
3. ✅ No type assertions (`as`)
4. ✅ Barrel exports updated (`index.ts` files)
5. ✅ TypeScript passes strict mode
6. ✅ ESLint passes
7. ✅ Tests pass (if template includes tests)

### CLAUDE.md Conventions Enforce:
- Context + TanStack Query (never Redux/Zustand)
- `useState` (never `useReducer`)
- Pure functions, early returns
- Error boundaries at 3 levels
- Proper balance handling (toPlanck/fromPlanck)

---

## Next Steps: Phase 2

Upon approval of Phase 1 architecture, we'll create:

### 1. Skills (8 files)
Format: Anthropic Skills protocol  
Location: `.cursor/composer/skills/`  
Content: PAPI patterns with do's/don'ts

### 2. Reference Docs (4 files)
- Full annotated CreateAsset.tsx
- Full annotated assetOperations.ts
- 3 App.tsx layout variants
- Transaction lifecycle diagram

### 3. Validation Scripts (4 files)
- `validate-imports.ts`
- `validate-types.ts`
- `validate-exports.ts`
- `test-connection.ts`

### 4. Dynamic Prompt Generator
JavaScript implementation that reads `wizard-config.json` and outputs sequential prompts for Claude.

### 5. Updated CLAUDE.md
New sections for end users on how to use the template and add features.

---

## Questions for Stakeholders

1. **Wizard granularity**: Should users select individual operations (`["create", "mint"]`) or just features (`assets: true`)?

2. **Layout variants**: Support all 3 (sidebar, topnav, minimal) in v1, or start with sidebar only?

3. **Network config**: Predefined list (QF, Polkadot, Kusama) or allow custom network URLs?

4. **Skills distribution**: Bundle in template repo or separate npm package?

5. **Target audience**: Optimize for React devs new to blockchain, or blockchain devs new to React, or both?

---

## Success Metrics

After Phase 2 + Phase 3 implementation, measure:

- ⏱️ **Time to working dApp**: Target < 10 minutes
- 💰 **Cost per run**: Target < $0.50
- ✅ **Code quality**: 100% validation pass rate
- 🐛 **Bug rate**: < 5% users report issues
- 🔄 **Iteration speed**: Adding features < 5 minutes
- 📚 **Skill reuse**: Skills loaded in 80%+ of sessions

---

## Competitive Analysis

| Approach | Setup Time | Code Quality | Extensibility | Learning Curve |
|----------|-----------|--------------|---------------|----------------|
| **Our Template + Skills** | 5-10 min | High (enforced patterns) | High (add skills) | Low (wizard-driven) |
| Create from scratch | 2-4 hours | Variable | Medium | Steep (PAPI docs) |
| Fork example repo | 30-60 min | Medium (no guidance) | Low (one-off) | Medium |
| Use outdated @polkadot/api | 1-2 hours | Low (deprecated) | Low | Steep (wrong docs) |

**Our advantage**: Combines speed of templates with quality of guided workflows.

---

## Conclusion

This workflow architecture delivers:

✅ **Speed**: 5-10 minute setup  
✅ **Cost**: $0.40/run (73% cheaper than generating from scratch)  
✅ **Quality**: Enforced best practices via skills + validation  
✅ **Scalability**: Skills maintained separately, updated once  
✅ **Extensibility**: Add features = add skills (NFTs, governance, etc.)  

**The key insight**: The template is the product. The workflow just activates features.

Ready for Phase 2 implementation.

