# Polkadot dApp Workflow Architecture - Phase 1 Analysis

## Executive Summary

After analyzing the token app codebase, I recommend a **minimal-configuration, example-driven workflow** that prioritizes:

1. **Template-first approach**: 90% of infrastructure is pre-built (wallet, connection, contexts, TanStack Query, error handling)
2. **Feature selection model**: Users select high-level features (Assets, NFTs, Governance); Claude generates specific components
3. **Skills over tools**: Encode `polkadot-api` patterns as reusable skills to minimize token usage
4. **3-step user journey**: Degit → Open in Composer → "Add asset management" → Done

**Key insight**: The template is already sophisticated. The workflow's job is to **add features** using established patterns, not recreate infrastructure. This means users spend ~50-200k tokens (vs 500k+ if regenerating contexts/hooks).

---

## Recommended Wizard JSON Schema

### Design Philosophy

The wizard should collect **feature-level selections**, not implementation details. End users shouldn't need to know about `useAssetMutation` or `TanStack Query` - they just want "asset management" or "governance".

### Proposed Schema (v1)

```json
{
  "schema_version": "1.0.0",
  "project": {
    "name": "my-polkadot-app",
    "description": "User-provided description (optional)"
  },
  "deployment": {
    "environment": "testnet",  // "testnet" | "mainnet" | "local"
    "network": {
      "name": "QF Network",  // Auto-set based on wizard flow, but customizable
      "wsUrl": "wss://test.qfnetwork.xyz",
      "decimals": 18,
      "symbol": "QF"
    }
  },
  "features": {
    "assets": {
      "enabled": true,
      "operations": ["create", "mint", "transfer", "destroy"],  // User can deselect specific ops
      "ui_style": "dashboard"  // "dashboard" | "minimal" | "embedded"
    },
    "nfts": {
      "enabled": false,
      "marketplace": false
    },
    "governance": {
      "enabled": false,
      "voting_mechanisms": []
    },
    "staking": {
      "enabled": false,
      "pool_staking": false
    }
  },
  "ui": {
    "theme": "dark",  // "dark" | "light" | "system"
    "layout": "sidebar",  // "sidebar" | "topnav" | "minimal"
    "branding": {
      "app_name": "My dApp",
      "show_network_name": true
    }
  },
  "advanced": {
    "typescript_strict": true,
    "error_boundaries": true,
    "analytics": false
  }
}
```

### Schema Rationale

**✅ Include:**
- **`deployment.environment`**: Changes network URLs, affects wallet connection patterns
- **`features.*`**: High-level toggles that map directly to code generation tasks
- **`features.assets.operations`**: Granular control without overwhelming users (smart defaults)
- **`ui.layout`**: Dramatically changes App.tsx structure
- **`ui.branding`**: Low-effort customization that users expect

**❌ Exclude (from wizard):**
- State management approach (always Context + TanStack Query per CLAUDE.md)
- Component library (always shadcn/ui)
- Build tool (always Vite)
- Testing framework (always Vitest)

**🔮 Future Extensions:**
```json
{
  "features": {
    "xcm": {
      "enabled": false,
      "target_chains": []
    },
    "multisig": {
      "enabled": false,
      "threshold": 2
    },
    "identity": {
      "enabled": false,
      "verification": false
    }
  }
}
```

---

## Template vs. Generated Boundary

### Pre-Built in Template (Never Generated)

These files exist and are **never modified** by the workflow:

#### Core Infrastructure
```
src/
├── contexts/
│   ├── WalletContext.tsx          ✅ Pre-built
│   ├── ConnectionContext.tsx      ✅ Pre-built
│   └── TransactionContext.tsx     ✅ Pre-built
├── hooks/
│   ├── useWallet.ts               ✅ Pre-built
│   ├── useConnectionStatus.ts     ✅ Pre-built
│   ├── useTransactionManager.ts   ✅ Pre-built
│   ├── useTransaction.ts          ✅ Pre-built
│   ├── useTransactionToasts.ts    ✅ Pre-built
│   ├── useAssetMutation.ts        ✅ Pre-built (reusable for any pallet)
│   └── use*Context.ts             ✅ Pre-built
├── lib/
│   ├── balance/                   ✅ Pre-built (toPlanck, fromPlanck, format)
│   ├── errorParsing.ts            ✅ Pre-built
│   ├── errorMessages.ts           ✅ Pre-built
│   ├── transactionErrors.ts       ✅ Pre-built
│   ├── queryClient.ts             ✅ Pre-built
│   ├── queryHelpers.ts            ✅ Pre-built
│   ├── toastConfigs.ts            ✅ Pre-built (type definitions)
│   ├── walletStorage.ts           ✅ Pre-built
│   └── utils.ts                   ✅ Pre-built
└── components/
    ├── ui/                         ✅ Pre-built (shadcn/ui components)
    ├── error-boundaries/           ✅ Pre-built
    ├── WalletConnector.tsx         ✅ Pre-built
    ├── AccountSelector.tsx         ✅ Pre-built
    ├── AccountDashboard.tsx        ✅ Pre-built
    ├── ConnectionBanner.tsx        ✅ Pre-built
    ├── TransactionReview.tsx       ✅ Pre-built (generic, data-driven)
    ├── TransactionFormFooter.tsx   ✅ Pre-built (reusable)
    ├── FeeDisplay.tsx              ✅ Pre-built
    └── MutationError.tsx           ✅ Pre-built
```

**Why this boundary?**
- These files are **blockchain-agnostic infrastructure**
- They follow patterns from CLAUDE.md that shouldn't be reinvented
- They're tested and work together as a system
- Regenerating them wastes tokens and risks introducing bugs

### Generated by Workflow (Feature-Specific)

Based on wizard selections, Claude generates:

#### Feature: `assets.enabled = true`
```
src/
├── lib/
│   └── assetOperations.ts         🔧 Generated (create, mint, transfer, destroy)
├── components/
│   ├── AssetList.tsx              🔧 Generated
│   ├── AssetCard.tsx              🔧 Generated
│   ├── AssetBalance.tsx           🔧 Generated
│   ├── CreateAsset.tsx            🔧 Generated (if in operations)
│   ├── MintTokens.tsx             🔧 Generated (if in operations)
│   ├── TransferTokens.tsx         🔧 Generated (if in operations)
│   └── DestroyAsset.tsx           🔧 Generated (if in operations)
└── hooks/
    ├── useNextAssetId.ts          🔧 Generated
    └── useFee.ts                  🔧 Generated (reusable, but Assets-specific initially)
```

#### Feature: `nfts.enabled = true` (future)
```
src/
├── lib/
│   └── nftOperations.ts           🔧 Generated
├── components/
│   ├── NftGallery.tsx             🔧 Generated
│   ├── NftMint.tsx                🔧 Generated
│   └── NftTransfer.tsx            🔧 Generated
└── hooks/
    └── useNftMetadata.ts          🔧 Generated
```

#### Always Generated/Modified
```
src/
├── App.tsx                        🔧 Modified (navigation, layout based on ui.layout)
└── main.tsx                       🔧 Modified (network config based on deployment)
```

**Why this boundary?**
- Feature-specific code depends on user selections
- These files follow established patterns from infrastructure
- Claude knows how to use `useAssetMutation`, just needs to generate the operation functions
- App.tsx layout varies significantly (sidebar vs topnav vs minimal)

---

## Workflow Asset Structure

### Optimal Mix for Cost Efficiency & Maintainability

Based on Anthropic best practices and token economics:

#### 1. Skills (Anthropic format) - **Primary knowledge source**

**What**: Reusable, versioned patterns that get loaded into Claude's context once

**Create these skills:**

```
skills/
├── polkadot-api-transactions.md     # How to build transactions, use Binary, MultiAddress
├── polkadot-api-queries.md          # Query patterns with TanStack Query
├── polkadot-api-observables.md      # Transaction observables, signSubmitAndWatch
├── asset-pallet-patterns.md         # Assets pallet specifics (create, mint, etc)
├── batch-operations.md              # Using Utility.batch_all
├── balance-utilities.md             # toPlanck, fromPlanck, formatBalance usage
├── component-patterns.md            # Form components following template style
└── error-handling.md                # Transaction error patterns
```

**Why skills?**
- Loaded once, referenced across multiple generations (cost: ~5k tokens per skill, reused infinitely)
- Version controlled, maintained separately from user code
- Can be updated when `polkadot-api` evolves without changing user projects
- Anthropic's Skills protocol makes them easily shareable

**Example: `polkadot-api-transactions.md`**
```markdown
# Polkadot API Transaction Patterns

## Overview
This skill covers transaction construction patterns using `polkadot-api` (NOT `@polkadot/api`).

## Critical: Import from `polkadot-api`, not `@polkadot/api`
```typescript
// ✅ Correct
import { Binary, createClient, type TypedApi } from 'polkadot-api'
import { MultiAddress } from '@polkadot-api/descriptors'

// ❌ NEVER use
import { ApiPromise } from '@polkadot/api'  // Wrong package!
```

## Pattern: Simple Transaction
[...examples from assetOperations.ts...]

## Pattern: Batch Transactions
[...batch_all examples...]

## Pattern: Using Binary for Text
[...Binary.fromText examples...]
```

#### 2. Reference Documents - **Complete code examples**

**What**: Full, working implementations that Claude can copy-adapt

**Create these documents:**

```
docs/
├── reference-implementations/
│   ├── CreateAsset-component.md     # Full CreateAsset.tsx with annotations
│   ├── assetOperations-lib.md       # Full assetOperations.ts with annotations
│   └── App-layouts.md               # 3 versions: sidebar, topnav, minimal
└── architecture/
    ├── state-management.md          # How contexts work together
    ├── transaction-lifecycle.md     # Full flow diagram + code
    └── query-patterns.md            # TanStack Query patterns used
```

**Why documents?**
- Show complete, working code (not just patterns)
- Include architectural context that skills don't cover
- Can include multiple examples (3 layout variants in one doc)
- Cost: ~10-20k tokens per doc when used

#### 3. Dynamic Prompts - **Generated from wizard JSON**

**What**: Specific, sequential instructions generated from user selections

**How it works:**
```javascript
// Pseudo-code for prompt generation
function generatePrompts(wizardConfig) {
  const prompts = []
  
  if (wizardConfig.features.assets.enabled) {
    prompts.push({
      order: 1,
      prompt: `Generate asset management feature:
- Operations: ${wizardConfig.features.assets.operations.join(', ')}
- Reference: CreateAsset-component.md
- Use skills: polkadot-api-transactions, asset-pallet-patterns
- Generate: lib/assetOperations.ts, components/CreateAsset.tsx, etc.`
    })
  }
  
  prompts.push({
    order: 99,
    prompt: `Update App.tsx:
- Layout: ${wizardConfig.ui.layout}
- Reference: App-layouts.md
- Include navigation for: ${enabledFeatures.join(', ')}`
  })
  
  return prompts
}
```

**Why dynamic prompts?**
- Tailored to exact user selections
- Sequences tasks logically (operations → components → App.tsx)
- Includes relevant skills and docs only
- Cost: 0 tokens (generated locally, sent to Claude)

#### 4. Memory File (CLAUDE.md) - **Project context**

**What**: Already exists in template, stays in every project

**Why it's critical:**
- Single source of truth for conventions
- Claude reads it automatically on every invocation
- Prevents drift from established patterns
- Cost: ~3k tokens per invocation (but essential)

**Updates needed:**
- Add section on "How This Template Works" for end users
- Add section on "Adding New Features" with examples

#### 5. Validation Scripts - **Quality gates**

**What**: Executable scripts that verify correctness

**Create these scripts:**

```bash
scripts/
├── validate-imports.ts       # Check for @polkadot/api (forbidden), ensure polkadot-api
├── validate-types.ts         # Check for 'any', type assertions
├── validate-exports.ts       # Ensure barrel files are updated
└── test-connection.ts        # Verify network connection in generated code
```

**Why scripts?**
- Catch common mistakes automatically
- Run via terminal tool, instant feedback
- Enforce CLAUDE.md rules programmatically
- Cost: ~2k tokens to execute + parse output

**Example: `validate-imports.ts`**
```typescript
import { glob } from 'glob'
import { readFileSync } from 'fs'

const files = await glob('src/**/*.{ts,tsx}')
const errors = []

for (const file of files) {
  const content = readFileSync(file, 'utf-8')
  
  if (content.includes('@polkadot/api')) {
    errors.push(`${file}: Uses @polkadot/api (should use polkadot-api)`)
  }
  
  if (content.includes(': any')) {
    errors.push(`${file}: Contains 'any' type`)
  }
}

if (errors.length > 0) {
  console.error('Validation failed:')
  errors.forEach(e => console.error(`  - ${e}`))
  process.exit(1)
}
```

#### 6. Custom MCPs - **Optional, for advanced use cases**

**Recommendation**: **NOT needed for v1**

**Why skip MCPs initially?**
- Additional complexity for end users (need to install MCP)
- Skill-based approach covers 95% of use cases
- Can add later if needed (e.g., "Deploy to Vercel" MCP)

**Future candidates:**
- Substrate Chain Info MCP (query live chain metadata)
- PAPI Descriptor Generator MCP (auto-generate descriptors for custom chains)
- Multi-chain Config MCP (manage multiple network configs)

---

## Step-by-Step User Journey

### The 3-Step Flow (Target: 5-10 minutes)

```
┌─────────────────────────────────────────────────────────────┐
│ Step 1: Wizard (External Tool)                              │
├─────────────────────────────────────────────────────────────┤
│ User selects:                                               │
│ - Project type: User-facing app                            │
│ - Features: Manage assets (create, mint, transfer)         │
│ - Environment: Testnet                                      │
│ - Layout: Sidebar                                           │
│                                                             │
│ Output: wizard-config.json                                  │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 2: Template Clone                                      │
├─────────────────────────────────────────────────────────────┤
│ $ npx degit user/polkadot-template my-app                  │
│ $ cd my-app                                                 │
│                                                             │
│ Template includes:                                          │
│ ✅ All infrastructure (contexts, hooks, lib, ui)            │
│ ✅ CLAUDE.md with conventions                               │
│ ✅ wizard-config.json (from wizard)                         │
│ ✅ package.json, vite.config.ts, etc.                       │
│ ✅ .cursor/composer/ with skills and docs                   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Step 3: Claude Composer                                     │
├─────────────────────────────────────────────────────────────┤
│ User opens Cursor → Composer → Types:                       │
│                                                             │
│ "Generate my app based on wizard-config.json"              │
│                                                             │
│ Claude workflow:                                            │
│ 1. Read wizard-config.json                                  │
│ 2. Load relevant skills (polkadot-api-*, asset-pallet-*)   │
│ 3. Generate lib/assetOperations.ts                         │
│ 4. Generate feature components (CreateAsset, etc.)         │
│ 5. Update App.tsx with sidebar navigation                  │
│ 6. Run validation scripts                                   │
│ 7. Output: "Your app is ready! Run `pnpm install && pnpm dev`" │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Result: Working dApp                                        │
├─────────────────────────────────────────────────────────────┤
│ User runs:                                                  │
│ $ pnpm install                                              │
│ $ pnpm papi         # Generate descriptors                  │
│ $ pnpm dev          # Start dev server                      │
│                                                             │
│ ✅ Asset management UI ready                                │
│ ✅ Wallet connection works                                  │
│ ✅ All patterns from CLAUDE.md followed                     │
└─────────────────────────────────────────────────────────────┘
```

### Alternative: Iterative Approach

If user wants to add features later:

```
User in Composer: "Add NFT minting capability"

Claude workflow:
1. Read wizard-config.json (features.nfts.enabled = false)
2. Update config: features.nfts.enabled = true
3. Load skills: polkadot-api-transactions, nft-pallet-patterns
4. Generate lib/nftOperations.ts
5. Generate components/NftMint.tsx
6. Update App.tsx navigation
7. Run validation
```

---

## Critical PAPI Patterns to Encode

### Pattern 1: Package Imports - **MOST COMMON MISTAKE**

```typescript
// ✅ CORRECT - Always use polkadot-api
import { Binary, createClient, type TypedApi, type Transaction } from 'polkadot-api'
import { getWsProvider } from 'polkadot-api/ws-provider'
import { MultiAddress } from '@polkadot-api/descriptors'  // Generated types

// ❌ WRONG - NEVER use @polkadot/api
import { ApiPromise } from '@polkadot/api'
import { WsProvider } from '@polkadot/rpc-provider'
```

**Why this matters:**
- `@polkadot/api` and `polkadot-api` are **completely different** packages
- Different APIs, different types, incompatible
- Beginners often default to `@polkadot/api` (more Google results)
- Must be in **every skill** as a warning

### Pattern 2: TypedApi from Descriptors

```typescript
import { qfn } from '@polkadot-api/descriptors'
import type { TypedApi } from 'polkadot-api'

type QfnApi = TypedApi<typeof qfn>

// Now TypeScript knows all pallets, calls, and storage
function createAsset(api: QfnApi, params: CreateAssetParams) {
  return api.tx.Assets.create({  // Fully typed!
    id: params.assetId,
    admin: MultiAddress.Id(params.adminAddress),
    min_balance: params.minBalance
  })
}
```

**Why this matters:**
- Type safety for all chain interactions
- Autocomplete for pallet names, methods
- Compile-time errors for wrong parameters

### Pattern 3: MultiAddress Usage

```typescript
import { MultiAddress } from '@polkadot-api/descriptors'

// ✅ CORRECT - Use MultiAddress.Id()
const recipient = MultiAddress.Id('5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY')

api.tx.Assets.mint({
  id: 1,
  beneficiary: recipient,  // MultiAddress<SS58String, number>
  amount: 1000n
})

// ❌ WRONG - Passing string directly
api.tx.Assets.mint({
  beneficiary: '5GrwvaEF...',  // Type error!
  // ...
})
```

**Why this matters:**
- Substrate uses `MultiAddress` enum for flexibility
- `polkadot-api` exposes this correctly
- Common source of type errors

### Pattern 4: Binary for Text/Bytes

```typescript
import { Binary } from 'polkadot-api'

// ✅ CORRECT - Use Binary.fromText()
api.tx.Assets.set_metadata({
  id: 1,
  name: Binary.fromText('My Token'),
  symbol: Binary.fromText('MTK'),
  decimals: 12
})

// ❌ WRONG - Passing string directly
api.tx.Assets.set_metadata({
  name: 'My Token',  // Type error!
  // ...
})
```

**Why this matters:**
- Chain expects byte arrays, not strings
- `Binary` provides conversion utilities
- Essential for metadata, names, etc.

### Pattern 5: BigInt for Amounts (with toPlanck)

```typescript
import { toPlanck } from '@/lib'

// ✅ CORRECT - Convert user input to Planck units
const userInput = '1.5'  // User types "1.5 tokens"
const amount = toPlanck(userInput, 18)  // 1500000000000000000n

api.tx.Assets.transfer({
  id: 1,
  target: MultiAddress.Id(recipient),
  amount: amount  // bigint
})

// ❌ WRONG - Using numbers or strings
api.tx.Assets.transfer({
  amount: 1.5  // Type error + precision loss!
})
```

**Why this matters:**
- Blockchain uses smallest units (Planck, satoshi, wei)
- JavaScript numbers lose precision beyond 53 bits
- Must use `bigint` for all on-chain amounts

### Pattern 6: Transaction Observable Pattern

```typescript
// ✅ CORRECT - Use signSubmitAndWatch
const transaction = api.tx.Assets.transfer({ /* ... */ })

const observable = transaction.signSubmitAndWatch(polkadotSigner)

observable.subscribe({
  next: (event) => {
    if (event.type === 'txBestBlocksState') {
      console.log('Transaction in block:', event.block.hash)
    }
    if (event.type === 'finalized') {
      console.log('Transaction finalized!')
    }
  },
  error: (error) => {
    console.error('Transaction failed:', error)
  }
})

// ❌ WRONG - Using async/await without observables
await transaction.signAndSend(signer)  // No progress tracking!
```

**Why this matters:**
- Blockchain transactions have multiple stages
- Observable pattern provides progress updates
- Essential for good UX (toasts, loading states)

### Pattern 7: Batch Operations

```typescript
import type { TxCallData } from 'polkadot-api'

// ✅ CORRECT - Use Utility.batch_all with decodedCall
const calls: TxCallData[] = [
  api.tx.Assets.create({ /* ... */ }).decodedCall,
  api.tx.Assets.set_metadata({ /* ... */ }).decodedCall,
  api.tx.Assets.mint({ /* ... */ }).decodedCall
]

return api.tx.Utility.batch_all({ calls })

// ❌ WRONG - Missing decodedCall
const calls = [
  api.tx.Assets.create({ /* ... */ }),  // Wrong type!
  // ...
]
```

**Why this matters:**
- Batch operations are atomic (all succeed or all fail)
- Must extract `.decodedCall` for type compatibility
- Critical for multi-step operations (create asset + set metadata)

### Pattern 8: TanStack Query Integration

```typescript
import { useQuery } from '@tanstack/react-query'
import { useConnectionContext } from '@/hooks'

// ✅ CORRECT - Chain query to connection status
function useAssetInfo(assetId: number) {
  const { isConnected, api } = useConnectionContext()
  
  return useQuery({
    queryKey: ['asset', assetId],
    queryFn: async () => {
      const info = await api.query.Assets.Asset.getValue(assetId)
      return info
    },
    enabled: isConnected && assetId !== null,
    staleTime: 30_000,  // 30s from CLAUDE.md conventions
    gcTime: 5 * 60_000  // 5min from CLAUDE.md conventions
  })
}
```

**Why this matters:**
- Queries should respect connection status
- Use established stale/gc times from CLAUDE.md
- Proper `enabled` flag prevents errors

---

## Dynamic Prompt Strategy

### Prompt Generation Algorithm

```javascript
class WorkflowPromptGenerator {
  constructor(wizardConfig, skills, docs) {
    this.config = wizardConfig
    this.skills = skills
    this.docs = docs
  }
  
  generate() {
    const tasks = []
    
    // Task 1: Validate environment
    tasks.push({
      order: 0,
      type: 'validation',
      prompt: this.validateEnvironment()
    })
    
    // Task 2-N: Generate features
    if (this.config.features.assets.enabled) {
      tasks.push(...this.generateAssetTasks())
    }
    
    if (this.config.features.nfts.enabled) {
      tasks.push(...this.generateNftTasks())
    }
    
    // Task N+1: Update App.tsx
    tasks.push({
      order: 90,
      type: 'integration',
      prompt: this.generateAppUpdate()
    })
    
    // Task N+2: Validation
    tasks.push({
      order: 99,
      type: 'validation',
      prompt: this.generateValidation()
    })
    
    return tasks.sort((a, b) => a.order - b.order)
  }
  
  generateAssetTasks() {
    const operations = this.config.features.assets.operations
    
    return [
      {
        order: 10,
        type: 'library',
        prompt: `
Generate src/lib/assetOperations.ts for QF Network.

**Required operations**: ${operations.join(', ')}

**Network configuration**:
- Chain: ${this.config.deployment.network.name}
- Decimals: ${this.config.deployment.network.decimals}

**Skills to use**:
- polkadot-api-transactions.md
- asset-pallet-patterns.md
- batch-operations.md

**Reference implementation**: assetOperations-lib.md

**Requirements**:
1. Import TypedApi from polkadot-api (NOT @polkadot/api)
2. Use MultiAddress.Id() for addresses
3. Use Binary.fromText() for text metadata
4. Use toPlanck() from @/lib for amount conversion
5. Batch create + metadata + optional mint
6. Export typed interfaces for each operation

**Output**: Create src/lib/assetOperations.ts
        `.trim()
      },
      {
        order: 20,
        type: 'hooks',
        prompt: `
Generate supporting hooks for asset operations:

**Hooks needed**:
- src/hooks/useNextAssetId.ts (query next available asset ID)
- src/hooks/useFee.ts (calculate transaction fees)

**Skills to use**:
- polkadot-api-queries.md

**Requirements**:
1. Use TanStack Query with staleTime: 30000, gcTime: 300000
2. Check isConnected before querying
3. Export typed returns

**Output**: Create both hook files
        `.trim()
      },
      ...operations.map((op, idx) => ({
        order: 30 + idx,
        type: 'component',
        prompt: this.generateComponentPrompt(op)
      }))
    ]
  }
  
  generateComponentPrompt(operation) {
    const componentMap = {
      'create': 'CreateAsset',
      'mint': 'MintTokens',
      'transfer': 'TransferTokens',
      'destroy': 'DestroyAsset'
    }
    
    const componentName = componentMap[operation]
    
    return `
Generate src/components/${componentName}.tsx

**Skills to use**:
- component-patterns.md
- polkadot-api-transactions.md

**Reference implementation**: CreateAsset-component.md

**Requirements**:
1. Use useAssetMutation hook with ${operation}${operation === 'create' ? 'AssetBatch' : ''} operation
2. Include TransactionReview, TransactionFormFooter, FeeDisplay
3. Wrap in FeatureErrorBoundary
4. Form validation with helpful error messages
5. Reset form on success

**Output**: Create src/components/${componentName}.tsx
    `.trim()
  }
  
  generateAppUpdate() {
    const layout = this.config.ui.layout
    const features = Object.entries(this.config.features)
      .filter(([_, config]) => config.enabled)
      .map(([name, _]) => name)
    
    return `
Update src/App.tsx for ${layout} layout with ${features.join(', ')} features.

**Reference implementation**: App-layouts.md (see "${layout}" variant)

**Requirements**:
1. Import all generated feature components
2. Create navigation items for enabled features
3. Implement ${layout} layout structure
4. Keep WalletConnector, AccountSelector, ConnectionBanner unchanged
5. Use branding config: "${this.config.ui.branding.app_name}"

**Output**: Update src/App.tsx
    `.trim()
  }
  
  generateValidation() {
    return `
Run validation scripts to ensure code quality:

1. Run: pnpm run typecheck
2. Run: pnpm run lint:check  
3. Run: node scripts/validate-imports.ts
4. Run: node scripts/validate-exports.ts

If any validation fails, fix the issues before completing.

**Output**: Report validation results
    `.trim()
  }
}
```

### Single-Shot vs. Multi-Turn Strategy

**Recommendation: Hybrid approach**

```
Turn 1 (Single Prompt):
"Generate complete asset management feature based on wizard-config.json.
Include: lib/assetOperations.ts, all components, hooks, and updated App.tsx.
Follow CLAUDE.md conventions. Use skills: polkadot-api-*, asset-pallet-*."

Claude generates ~8-12 files in one go.

Turn 2 (Auto-triggered if errors):
"Run validation. If there are errors, fix them."

Turn 3 (Only if user requests):
"Add [additional feature]" (iterative improvement)
```

**Why single-shot first?**
- Users want results fast (1 prompt vs 10)
- Claude Sonnet 4 can handle 10-12 file generations reliably
- Reduces back-and-forth token costs
- Validation as safety net catches issues

---

## Token Cost Analysis

### Per-Workflow-Run Estimate

**Assumptions:**
- User selects: Assets feature (create, mint, transfer)
- Sidebar layout
- Template already cloned (infrastructure exists)

**Token Breakdown:**

| Phase | Description | Input Tokens | Output Tokens | Total |
|-------|-------------|--------------|---------------|-------|
| **Context Loading** | | | | |
| CLAUDE.md | Read project conventions | 3,000 | 0 | 3,000 |
| wizard-config.json | Read user selections | 500 | 0 | 500 |
| Skills (3x) | Load PAPI, assets, batch patterns | 15,000 | 0 | 15,000 |
| Reference doc (1x) | Load CreateAsset example | 5,000 | 0 | 5,000 |
| **Subtotal: Context** | | **23,500** | **0** | **23,500** |
| | | | | |
| **Code Generation** | | | | |
| assetOperations.ts | Generate library functions | 2,000 | 2,500 | 4,500 |
| CreateAsset.tsx | Generate form component | 3,000 | 4,000 | 7,000 |
| MintTokens.tsx | Generate form component | 2,500 | 3,500 | 6,000 |
| TransferTokens.tsx | Generate form component | 2,500 | 3,500 | 6,000 |
| useNextAssetId.ts | Generate hook | 1,000 | 800 | 1,800 |
| useFee.ts | Generate hook | 1,000 | 800 | 1,800 |
| App.tsx update | Modify navigation | 2,000 | 2,000 | 4,000 |
| **Subtotal: Generation** | | **14,000** | **17,100** | **31,100** |
| | | | | |
| **Validation** | | | | |
| Run scripts | Execute + parse output | 2,000 | 500 | 2,500 |
| Fix errors (if any) | Minor corrections | 1,500 | 1,000 | 2,500 |
| **Subtotal: Validation** | | **3,500** | **1,500** | **5,000** |
| | | | | |
| **TOTAL** | | **41,000** | **18,600** | **~60,000** |

**Cost at $3/M input, $15/M output:**
- Input: 41,000 × $3/1M = $0.12
- Output: 18,600 × $15/1M = $0.28
- **Total: ~$0.40 per run** ✅

### Comparison: Without Template

If we had to generate contexts, hooks, lib utilities:

| What | Template (Exists) | From Scratch |
|------|-------------------|--------------|
| WalletContext + useWallet | 0 tokens | ~8,000 tokens |
| ConnectionContext + useConnectionStatus | 0 tokens | ~6,000 tokens |
| TransactionContext + useTransactionManager | 0 tokens | ~12,000 tokens |
| Balance utilities (toPlanck, etc) | 0 tokens | ~5,000 tokens |
| Error handling (parsing, etc) | 0 tokens | ~7,000 tokens |
| TanStack Query setup | 0 tokens | ~3,000 tokens |
| shadcn/ui components | 0 tokens | ~15,000 tokens |
| **Infrastructure Total** | **0** | **~56,000** |
| Feature generation (assets) | 31,100 tokens | 31,100 tokens |
| **GRAND TOTAL** | **~60,000** | **~150,000** |

**Savings: ~60% reduction by using template** ✅

### Cost at Scale

If 1,000 users run the workflow:
- **With template**: 1,000 × $0.40 = **$400**
- **Without template**: 1,000 × $1.50 = **$1,500**

**Annual cost (users run 3x each for iterations):**
- **With template**: 3,000 × $0.40 = **$1,200/year** ✅

---

## Next Steps for Phase 2

Once this Phase 1 analysis is approved, I'll proceed to create:

### 1. Complete Wizard JSON Schema Specification
- Full JSON schema with descriptions
- Validation rules
- Examples for each feature type
- Migration guide for future schema versions

### 2. Skill Definitions (8 skills)
- `polkadot-api-transactions.md`
- `polkadot-api-queries.md`
- `polkadot-api-observables.md`
- `asset-pallet-patterns.md`
- `batch-operations.md`
- `balance-utilities.md`
- `component-patterns.md`
- `error-handling.md`

Each following Anthropic Skills format with:
- Overview
- Critical patterns (Do's and Don'ts)
- Code examples
- Common mistakes section

### 3. Reference Implementation Documents
- `CreateAsset-component.md` (full annotated component)
- `assetOperations-lib.md` (full annotated library)
- `App-layouts.md` (3 layout variants)
- `transaction-lifecycle.md` (flow diagram + code)

### 4. Validation Scripts
- `validate-imports.ts` (check for forbidden packages)
- `validate-types.ts` (check for any, assertions)
- `validate-exports.ts` (check barrel files)
- `test-connection.ts` (verify network config)

### 5. Dynamic Prompt Templates
- JavaScript/TypeScript implementation of WorkflowPromptGenerator
- Unit tests for prompt generation
- Examples for each feature type

### 6. Updated CLAUDE.md Sections
- "How This Template Works" (for end users)
- "Adding New Features" (iterative workflow)
- "Workflow Integration" (how Skills are used)

---

## Questions for Review

Before proceeding to Phase 2, please confirm:

1. **Wizard schema granularity**: Is `features.assets.operations[]` the right level, or should users just toggle "assets" on/off?

2. **Layout variants**: Should we support 3 layouts (sidebar, topnav, minimal) or start with just sidebar?

3. **Skills location**: Should skills be in the template repo (`.cursor/composer/skills/`) or separate package?

4. **Validation strictness**: Should validation failures block completion, or just warn?

5. **Future features priority**: Which should we design for first after assets: NFTs, governance, or staking?

6. **Network configuration**: Should wizard collect custom network details, or predefined list (QF Network, Polkadot, Kusama)?

---

## Conclusion

This workflow architecture optimizes for:

✅ **Minimal user effort** (3 steps, ~5 minutes)  
✅ **Low token cost** ($0.40 per run vs $1.50 without template)  
✅ **High code quality** (follows CLAUDE.md, validated automatically)  
✅ **Extensibility** (new features = new skills + docs)  
✅ **Maintainability** (skills updated independently of user code)  

The key insight: **The template is the product**. The workflow just "activates" features that follow established patterns.

Ready to proceed to Phase 2 implementation specifications.

