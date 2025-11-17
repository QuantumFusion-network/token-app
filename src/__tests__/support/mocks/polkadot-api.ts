/**
 * Mock factory for polkadot-api TypedApi
 *
 * Provides comprehensive mocks for testing blockchain operations without
 * actually connecting to a node. Focuses on transaction builders and
 * ensuring correct payload structures.
 *
 * Usage:
 * ```ts
 * const api = createMockQfnApi()
 * const tx = createAssetBatch(api, params, signerAddress)
 * expect(tx.decodedCall.type).toBe('batch_all')
 * ```
 */

import { vi } from 'vitest'
import type { TxCallData } from 'polkadot-api'

/**
 * Creates a mock transaction call data object
 */
export const createMockCallData = (
  pallet: string,
  method: string,
  value: Record<string, unknown> = {}
): TxCallData => ({
  type: method as TxCallData['type'],
  value,
  pallet,
})

/**
 * Creates a mock transaction builder
 * Returns an object with decodedCall property
 */
export const createMockTxBuilder = (callData: TxCallData) => ({
  decodedCall: callData,
  // Could add other tx methods if needed (signAndSubmit, etc.)
})

/**
 * Factory to create complete mocked QFN TypedApi
 *
 * This mock focuses on transaction builders (api.tx.*) since that's what
 * assetOperations.ts uses. Each method returns a mock tx builder with
 * the decodedCall captured for assertions.
 */
export const createMockQfnApi = () => {
  const api = {
    tx: {
      Assets: {
        create: vi.fn((params) =>
          createMockTxBuilder(createMockCallData('Assets', 'create', params))
        ),
        mint: vi.fn((params) =>
          createMockTxBuilder(createMockCallData('Assets', 'mint', params))
        ),
        transfer: vi.fn((params) =>
          createMockTxBuilder(createMockCallData('Assets', 'transfer', params))
        ),
        set_metadata: vi.fn((params) =>
          createMockTxBuilder(createMockCallData('Assets', 'set_metadata', params))
        ),
        freeze_asset: vi.fn((params) =>
          createMockTxBuilder(createMockCallData('Assets', 'freeze_asset', params))
        ),
        start_destroy: vi.fn((params) =>
          createMockTxBuilder(createMockCallData('Assets', 'start_destroy', params))
        ),
        destroy_accounts: vi.fn((params) =>
          createMockTxBuilder(createMockCallData('Assets', 'destroy_accounts', params))
        ),
        destroy_approvals: vi.fn((params) =>
          createMockTxBuilder(createMockCallData('Assets', 'destroy_approvals', params))
        ),
        finish_destroy: vi.fn((params) =>
          createMockTxBuilder(createMockCallData('Assets', 'finish_destroy', params))
        ),
      },
      Utility: {
        batch_all: vi.fn((params) =>
          createMockTxBuilder(createMockCallData('Utility', 'batch_all', params))
        ),
      },
    },
  }

  return api as unknown as ReturnType<typeof createMockQfnApi>
}
