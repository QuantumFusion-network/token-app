/**
 * Mock factory for polkadot-api client
 *
 * Provides flexible, composable mocks for the polkadot-api TypedApi.
 * Each mock can be customized per test while maintaining type safety.
 *
 * Usage:
 * ```ts
 * const api = createMockApi({
 *   query: {
 *     Assets: {
 *       Asset: {
 *         getEntries: vi.fn().mockResolvedValue([...]),
 *       },
 *     },
 *   },
 * })
 * ```
 */

import { vi } from 'vitest'
import type { TxCallData } from 'polkadot-api'

/**
 * Mock transaction call data
 * Represents the result of api.tx.Pallet.method().decodedCall
 */
export const createMockTxCallData = (
  overrides?: Partial<TxCallData>
): TxCallData => ({
  pallet: 'Assets',
  value: {},
  type: 'create' as TxCallData['type'],
  ...overrides,
})

/**
 * Mock transaction builder
 * Simulates api.tx.Pallet.method() which returns { decodedCall, ... }
 */
export const createMockTxBuilder = (callData?: Partial<TxCallData>) => ({
  decodedCall: createMockTxCallData(callData),
  // Add other tx methods if needed (signAndSubmit, etc.)
})

/**
 * Complete mock for Assets pallet transactions
 */
export const createMockAssetsTx = () => ({
  create: vi.fn(() =>
    createMockTxBuilder({ pallet: 'Assets', type: 'create' })
  ),
  mint: vi.fn(() => createMockTxBuilder({ pallet: 'Assets', type: 'mint' })),
  transfer: vi.fn(() =>
    createMockTxBuilder({ pallet: 'Assets', type: 'transfer' })
  ),
  freeze_asset: vi.fn(() =>
    createMockTxBuilder({ pallet: 'Assets', type: 'freeze_asset' })
  ),
  start_destroy: vi.fn(() =>
    createMockTxBuilder({ pallet: 'Assets', type: 'start_destroy' })
  ),
  destroy_accounts: vi.fn(() =>
    createMockTxBuilder({ pallet: 'Assets', type: 'destroy_accounts' })
  ),
  destroy_approvals: vi.fn(() =>
    createMockTxBuilder({ pallet: 'Assets', type: 'destroy_approvals' })
  ),
  finish_destroy: vi.fn(() =>
    createMockTxBuilder({ pallet: 'Assets', type: 'finish_destroy' })
  ),
  set_metadata: vi.fn(() =>
    createMockTxBuilder({ pallet: 'Assets', type: 'set_metadata' })
  ),
})

/**
 * Complete mock for Utility pallet transactions
 */
export const createMockUtilityTx = () => ({
  batch_all: vi.fn(() =>
    createMockTxBuilder({ pallet: 'Utility', type: 'batch_all' })
  ),
  batch: vi.fn(() =>
    createMockTxBuilder({ pallet: 'Utility', type: 'batch' })
  ),
})

/**
 * Complete mock for Assets pallet queries
 */
export const createMockAssetsQuery = () => ({
  Asset: {
    getEntries: vi.fn().mockResolvedValue([]),
    getValue: vi.fn().mockResolvedValue(undefined),
  },
  Metadata: {
    getValue: vi.fn().mockResolvedValue(undefined),
  },
  Account: {
    getEntries: vi.fn().mockResolvedValue([]),
    getValue: vi.fn().mockResolvedValue(undefined),
  },
})

/**
 * Complete mock for System pallet queries
 */
export const createMockSystemQuery = () => ({
  Account: {
    getValue: vi.fn().mockResolvedValue(undefined),
  },
})

/**
 * Factory to create a complete mocked polkadot-api client
 *
 * @param overrides - Partial overrides for specific API methods
 * @returns Mocked TypedApi instance
 *
 * @example
 * // Mock with custom asset query response
 * const api = createMockApi({
 *   query: {
 *     Assets: {
 *       Asset: {
 *         getEntries: vi.fn().mockResolvedValue([USDC_ASSET]),
 *       },
 *     },
 *   },
 * })
 */
export const createMockApi = (overrides?: {
  query?: {
    Assets?: Partial<ReturnType<typeof createMockAssetsQuery>>
    System?: Partial<ReturnType<typeof createMockSystemQuery>>
  }
  tx?: {
    Assets?: Partial<ReturnType<typeof createMockAssetsTx>>
    Utility?: Partial<ReturnType<typeof createMockUtilityTx>>
  }
}) => {
  const defaultQuery = {
    Assets: createMockAssetsQuery(),
    System: createMockSystemQuery(),
  }

  const defaultTx = {
    Assets: createMockAssetsTx(),
    Utility: createMockUtilityTx(),
  }

  return {
    query: {
      ...defaultQuery,
      ...(overrides?.query || {}),
      Assets: {
        ...defaultQuery.Assets,
        ...(overrides?.query?.Assets || {}),
      },
      System: {
        ...defaultQuery.System,
        ...(overrides?.query?.System || {}),
      },
    },
    tx: {
      ...defaultTx,
      ...(overrides?.tx || {}),
      Assets: {
        ...defaultTx.Assets,
        ...(overrides?.tx?.Assets || {}),
      },
      Utility: {
        ...defaultTx.Utility,
        ...(overrides?.tx?.Utility || {}),
      },
    },
  }
}
