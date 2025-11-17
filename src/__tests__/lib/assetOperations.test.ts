/**
 * CRITICAL TESTS: Asset Operations - Financial Transaction Builders
 *
 * ⚠️  FINANCIAL RISK: These functions build blockchain transactions that
 * create, mint, transfer, and destroy tokens. Errors here can cause:
 * - Loss of funds (wrong amounts)
 * - Stuck assets (wrong transaction structure)
 * - Failed transactions (invalid parameters)
 *
 * Test Coverage:
 * - createAssetBatch: Correct payload, batch structure, optional mint
 * - mintTokens: Amount calculation with decimals
 * - transferTokens: Correct recipient and amount
 * - destroyAssetBatch: Correct 5-step sequence
 *
 * Priority: TIER 1 - Must test before any financial operations go to production
 */

import { describe, expect, it, vi } from 'vitest'
import { Binary } from 'polkadot-api'
import {
  createAssetBatch,
  mintTokens,
  transferTokens,
  destroyAssetBatch,
} from '@/lib/assetOperations'
import { createMockQfnApi } from '../support/mocks/polkadot-api'
import {
  buildCreateAssetParams,
  buildMintParams,
  buildTransferParams,
  buildDestroyAssetParams,
  TEST_ADDRESSES,
  HIGH_PRECISION_ASSET,
  ASSET_WITH_INITIAL_MINT,
} from '../support/factories/asset-params'

// Mock Binary.fromText since it's from polkadot-api
vi.mock('polkadot-api', async () => {
  const actual = await vi.importActual('polkadot-api')
  return {
    ...actual,
    Binary: {
      fromText: (text: string) => `Binary(${text})`,
    },
  }
})

// Mock MultiAddress since it's from descriptors
vi.mock('@polkadot-api/descriptors', () => ({
  MultiAddress: {
    Id: (address: string) => ({ type: 'Id', value: address }),
  },
}))

describe('createAssetBatch', () => {
  describe('Basic asset creation (no initial mint)', () => {
    it('creates batch_all transaction with create + metadata calls', () => {
      const api = createMockQfnApi()
      const params = buildCreateAssetParams()
      const signer = TEST_ADDRESSES.ALICE

      const tx = createAssetBatch(api, params, signer)

      // Should return Utility.batch_all transaction
      expect(tx.decodedCall.pallet).toBe('Utility')
      expect(tx.decodedCall.type).toBe('batch_all')

      // Should contain exactly 2 calls (create + metadata, no mint)
      const calls = tx.decodedCall.value.calls as any[]
      expect(calls).toHaveLength(2)

      // First call: Assets.create
      expect(calls[0].pallet).toBe('Assets')
      expect(calls[0].type).toBe('create')
      expect(calls[0].value.id).toBe(1000) // Parsed from '1000'
      expect(calls[0].value.admin).toEqual({ type: 'Id', value: signer })

      // Second call: Assets.set_metadata
      expect(calls[1].pallet).toBe('Assets')
      expect(calls[1].type).toBe('set_metadata')
      expect(calls[1].value.id).toBe(1000)
      expect(calls[1].value.name).toBe('Binary(Test USD Coin)')
      expect(calls[1].value.symbol).toBe('Binary(USDC)')
      expect(calls[1].value.decimals).toBe(6)
    })

    it('calculates minBalance correctly with decimals', () => {
      const api = createMockQfnApi()

      // 6 decimals: minBalance '1' = 1 * 10^6 = 1000000
      const params6 = buildCreateAssetParams({
        minBalance: '1',
        decimals: '6'
      })
      const tx6 = createAssetBatch(api, params6, TEST_ADDRESSES.ALICE)
      const calls6 = tx6.decodedCall.value.calls as any[]
      expect(calls6[0].value.min_balance).toBe(1000000n)

      // 18 decimals: minBalance '1' = 1 * 10^18
      const params18 = buildCreateAssetParams({
        minBalance: '1',
        decimals: '18'
      })
      const tx18 = createAssetBatch(api, params18, TEST_ADDRESSES.ALICE)
      const calls18 = tx18.decodedCall.value.calls as any[]
      expect(calls18[0].value.min_balance).toBe(1000000000000000000n)
    })

    it('handles fractional minBalance values', () => {
      const api = createMockQfnApi()

      // minBalance '0.5' with 6 decimals = 500000
      const params = buildCreateAssetParams({
        minBalance: '0.5',
        decimals: '6'
      })

      // Note: Current implementation doesn't handle decimal minBalance correctly
      // It does BigInt('0.5') which will throw
      // This test documents the bug - minBalance should be parsed like amounts
      expect(() => {
        createAssetBatch(api, params, TEST_ADDRESSES.ALICE)
      }).toThrow()
    })
  })

  describe('Asset creation with initial mint', () => {
    it('includes mint call when initialMintAmount > 0', () => {
      const api = createMockQfnApi()
      const params = buildCreateAssetParams({
        initialMintAmount: '1000',
        initialMintBeneficiary: TEST_ADDRESSES.ALICE,
      })

      const tx = createAssetBatch(api, params, TEST_ADDRESSES.ALICE)
      const calls = tx.decodedCall.value.calls as any[]

      // Should have 3 calls (create + metadata + mint)
      expect(calls).toHaveLength(3)

      // Third call: Assets.mint
      expect(calls[2].pallet).toBe('Assets')
      expect(calls[2].type).toBe('mint')
      expect(calls[2].value.id).toBe(1000)
      expect(calls[2].value.beneficiary).toEqual({
        type: 'Id',
        value: TEST_ADDRESSES.ALICE,
      })
      // 1000 * 10^6 (6 decimals) = 1000000000
      expect(calls[2].value.amount).toBe(1000000000n)
    })

    it('calculates initial mint amount with correct decimals', () => {
      const api = createMockQfnApi()

      // 18 decimals: 1000000 tokens
      const params = buildCreateAssetParams({
        decimals: '18',
        initialMintAmount: '1000000',
        initialMintBeneficiary: TEST_ADDRESSES.ALICE,
      })

      const tx = createAssetBatch(api, params, TEST_ADDRESSES.ALICE)
      const calls = tx.decodedCall.value.calls as any[]

      // 1000000 * 10^18
      expect(calls[2].value.amount).toBe(1000000000000000000000000n)
    })

    it('omits mint call when initialMintAmount is empty string', () => {
      const api = createMockQfnApi()
      const params = buildCreateAssetParams({
        initialMintAmount: '',
        initialMintBeneficiary: TEST_ADDRESSES.ALICE,
      })

      const tx = createAssetBatch(api, params, TEST_ADDRESSES.ALICE)
      const calls = tx.decodedCall.value.calls as any[]

      // Only 2 calls (no mint)
      expect(calls).toHaveLength(2)
    })

    it('omits mint call when initialMintAmount is "0"', () => {
      const api = createMockQfnApi()
      const params = buildCreateAssetParams({
        initialMintAmount: '0',
        initialMintBeneficiary: TEST_ADDRESSES.ALICE,
      })

      const tx = createAssetBatch(api, params, TEST_ADDRESSES.ALICE)
      const calls = tx.decodedCall.value.calls as any[]

      expect(calls).toHaveLength(2)
    })

    it('includes mint call for fractional initial amounts', () => {
      const api = createMockQfnApi()
      const params = buildCreateAssetParams({
        decimals: '6',
        initialMintAmount: '0.123456',
        initialMintBeneficiary: TEST_ADDRESSES.BOB,
      })

      const tx = createAssetBatch(api, params, TEST_ADDRESSES.ALICE)
      const calls = tx.decodedCall.value.calls as any[]

      expect(calls).toHaveLength(3)
      // 0.123456 * 10^6 = 123456
      expect(calls[2].value.amount).toBe(123456n)
    })
  })

  describe('Preset scenarios', () => {
    it('creates high-precision token correctly', () => {
      const api = createMockQfnApi()
      const tx = createAssetBatch(api, HIGH_PRECISION_ASSET, TEST_ADDRESSES.ALICE)
      const calls = tx.decodedCall.value.calls as any[]

      expect(calls[1].value.decimals).toBe(18)
      expect(calls[1].value.symbol).toBe('Binary(HPT)')
    })

    it('creates token with initial mint correctly', () => {
      const api = createMockQfnApi()
      const tx = createAssetBatch(api, ASSET_WITH_INITIAL_MINT, TEST_ADDRESSES.ALICE)
      const calls = tx.decodedCall.value.calls as any[]

      expect(calls).toHaveLength(3) // Has mint call
      expect(calls[2].value.amount).toBe(1000000000000000000n) // 1000000 * 10^12
    })
  })
})

describe('mintTokens', () => {
  it('creates mint transaction with correct parameters', () => {
    const api = createMockQfnApi()
    const params = buildMintParams()

    const tx = mintTokens(api, params)

    expect(tx.decodedCall.pallet).toBe('Assets')
    expect(tx.decodedCall.type).toBe('mint')
    expect(tx.decodedCall.value.id).toBe(1000)
    expect(tx.decodedCall.value.beneficiary).toEqual({
      type: 'Id',
      value: TEST_ADDRESSES.BOB,
    })
  })

  it('calculates amount correctly with 6 decimals', () => {
    const api = createMockQfnApi()
    const params = buildMintParams({
      amount: '1000', // 1000 USDC
      decimals: 6,
    })

    const tx = mintTokens(api, params)

    // 1000 * 10^6 = 1000000000
    expect(tx.decodedCall.value.amount).toBe(1000000000n)
  })

  it('calculates amount correctly with 18 decimals', () => {
    const api = createMockQfnApi()
    const params = buildMintParams({
      amount: '123.456789012345678', // Maximum precision
      decimals: 18,
    })

    const tx = mintTokens(api, params)

    // Note: parseUnits pads to 18 decimals, so '123.456789012345678' becomes
    // '123456789012345678' + '000' (padded to 18 total)
    // = 123.456789012345678000 * 10^18
    expect(tx.decodedCall.value.amount).toBe(123456789012345678000n)
  })

  it('handles fractional amounts correctly', () => {
    const api = createMockQfnApi()
    const params = buildMintParams({
      amount: '0.5',
      decimals: 6,
    })

    const tx = mintTokens(api, params)

    // 0.5 * 10^6 = 500000
    expect(tx.decodedCall.value.amount).toBe(500000n)
  })

  it('handles very small amounts', () => {
    const api = createMockQfnApi()
    const params = buildMintParams({
      amount: '0.000001', // Minimum for 6 decimals
      decimals: 6,
    })

    const tx = mintTokens(api, params)

    expect(tx.decodedCall.value.amount).toBe(1n)
  })

  it('handles large amounts without overflow', () => {
    const api = createMockQfnApi()
    const params = buildMintParams({
      amount: '1000000000', // 1 billion tokens
      decimals: 18,
    })

    const tx = mintTokens(api, params)

    // 1000000000 * 10^18
    expect(tx.decodedCall.value.amount).toBe(1000000000000000000000000000n)
  })
})

describe('transferTokens', () => {
  it('creates transfer transaction with correct parameters', () => {
    const api = createMockQfnApi()
    const params = buildTransferParams()

    const tx = transferTokens(api, params)

    expect(tx.decodedCall.pallet).toBe('Assets')
    expect(tx.decodedCall.type).toBe('transfer')
    expect(tx.decodedCall.value.id).toBe(1000)
    expect(tx.decodedCall.value.target).toEqual({
      type: 'Id',
      value: TEST_ADDRESSES.BOB,
    })
  })

  it('calculates transfer amount correctly with decimals', () => {
    const api = createMockQfnApi()
    const params = buildTransferParams({
      amount: '50.25',
      decimals: 6,
    })

    const tx = transferTokens(api, params)

    // 50.25 * 10^6 = 50250000
    expect(tx.decodedCall.value.amount).toBe(50250000n)
  })

  it('handles transfer to different recipient', () => {
    const api = createMockQfnApi()
    const params = buildTransferParams({
      recipient: TEST_ADDRESSES.CHARLIE,
    })

    const tx = transferTokens(api, params)

    expect(tx.decodedCall.value.target).toEqual({
      type: 'Id',
      value: TEST_ADDRESSES.CHARLIE,
    })
  })

  it('handles fractional transfer amounts', () => {
    const api = createMockQfnApi()
    const params = buildTransferParams({
      amount: '0.01', // 1 cent
      decimals: 6,
    })

    const tx = transferTokens(api, params)

    expect(tx.decodedCall.value.amount).toBe(10000n)
  })
})

describe('destroyAssetBatch', () => {
  it('creates batch_all with 5 sequential destroy calls', () => {
    const api = createMockQfnApi()
    const params = buildDestroyAssetParams()

    const tx = destroyAssetBatch(api, params)

    // Should return Utility.batch_all transaction
    expect(tx.decodedCall.pallet).toBe('Utility')
    expect(tx.decodedCall.type).toBe('batch_all')

    // Should contain exactly 5 calls in correct order
    const calls = tx.decodedCall.value.calls as any[]
    expect(calls).toHaveLength(5)
  })

  it('follows correct destruction sequence', () => {
    const api = createMockQfnApi()
    const params = buildDestroyAssetParams({ assetId: '1000' })

    const tx = destroyAssetBatch(api, params)
    const calls = tx.decodedCall.value.calls as any[]

    // Step 1: freeze_asset
    expect(calls[0].pallet).toBe('Assets')
    expect(calls[0].type).toBe('freeze_asset')
    expect(calls[0].value.id).toBe(1000)

    // Step 2: start_destroy
    expect(calls[1].pallet).toBe('Assets')
    expect(calls[1].type).toBe('start_destroy')
    expect(calls[1].value.id).toBe(1000)

    // Step 3: destroy_approvals
    expect(calls[2].pallet).toBe('Assets')
    expect(calls[2].type).toBe('destroy_approvals')
    expect(calls[2].value.id).toBe(1000)

    // Step 4: destroy_accounts
    expect(calls[3].pallet).toBe('Assets')
    expect(calls[3].type).toBe('destroy_accounts')
    expect(calls[3].value.id).toBe(1000)

    // Step 5: finish_destroy
    expect(calls[4].pallet).toBe('Assets')
    expect(calls[4].type).toBe('finish_destroy')
    expect(calls[4].value.id).toBe(1000)
  })

  it('parses assetId correctly for different values', () => {
    const api = createMockQfnApi()

    const tx1 = destroyAssetBatch(api, buildDestroyAssetParams({ assetId: '999' }))
    const calls1 = tx1.decodedCall.value.calls as any[]
    expect(calls1[0].value.id).toBe(999)

    const tx2 = destroyAssetBatch(api, buildDestroyAssetParams({ assetId: '5000' }))
    const calls2 = tx2.decodedCall.value.calls as any[]
    expect(calls2[0].value.id).toBe(5000)
  })
})

describe('Edge cases and error scenarios', () => {
  describe('Invalid inputs', () => {
    it('handles empty assetId string', () => {
      const api = createMockQfnApi()
      const params = buildCreateAssetParams({ assetId: '' })

      // parseInt('') returns NaN
      const tx = createAssetBatch(api, params, TEST_ADDRESSES.ALICE)
      const calls = tx.decodedCall.value.calls as any[]

      expect(isNaN(calls[0].value.id)).toBe(true)
    })

    it('handles non-numeric assetId', () => {
      const api = createMockQfnApi()
      const params = buildMintParams({ assetId: 'invalid' })

      const tx = mintTokens(api, params)

      expect(isNaN(tx.decodedCall.value.id)).toBe(true)
    })
  })

  describe('Precision boundaries', () => {
    it('handles maximum safe integer', () => {
      const api = createMockQfnApi()
      const params = buildMintParams({
        amount: '9007199254740991', // Number.MAX_SAFE_INTEGER
        decimals: 0,
      })

      const tx = mintTokens(api, params)

      expect(tx.decodedCall.value.amount).toBe(9007199254740991n)
    })

    it('handles amounts beyond JavaScript number precision', () => {
      const api = createMockQfnApi()
      const params = buildMintParams({
        amount: '999999999999999999999999', // Way beyond Number.MAX_SAFE_INTEGER
        decimals: 18,
      })

      const tx = mintTokens(api, params)

      // BigInt handles this correctly
      expect(tx.decodedCall.value.amount).toBe(999999999999999999999999000000000000000000n)
    })
  })
})
