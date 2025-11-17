/**
 * Test data factories for asset operation parameters
 *
 * Provides realistic, reusable test data with sensible defaults
 * and easy override patterns for specific test cases.
 */

import type {
  CreateAssetParams,
  MintParams,
  TransferParams,
  DestroyAssetParams,
} from '@/lib/assetOperations'

/**
 * Realistic Substrate account addresses (SS58 format)
 */
export const TEST_ADDRESSES = {
  ALICE: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  BOB: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
  CHARLIE: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
} as const

/**
 * Factory for CreateAssetParams
 *
 * @example
 * // Default USDC-like asset
 * const params = buildCreateAssetParams()
 *
 * @example
 * // Custom 18-decimal token with initial mint
 * const params = buildCreateAssetParams({
 *   decimals: '18',
 *   initialMintAmount: '1000000',
 * })
 */
export const buildCreateAssetParams = (
  overrides?: Partial<CreateAssetParams>
): CreateAssetParams => ({
  assetId: '1000',
  minBalance: '1',
  name: 'Test USD Coin',
  symbol: 'USDC',
  decimals: '6',
  initialMintAmount: '',
  initialMintBeneficiary: '',
  ...overrides,
})

/**
 * Factory for MintParams
 */
export const buildMintParams = (
  overrides?: Partial<MintParams>
): MintParams => ({
  assetId: '1000',
  recipient: TEST_ADDRESSES.BOB,
  amount: '1000',
  decimals: 6,
  ...overrides,
})

/**
 * Factory for TransferParams
 */
export const buildTransferParams = (
  overrides?: Partial<TransferParams>
): TransferParams => ({
  assetId: '1000',
  recipient: TEST_ADDRESSES.BOB,
  amount: '100',
  decimals: 6,
  ...overrides,
})

/**
 * Factory for DestroyAssetParams
 */
export const buildDestroyAssetParams = (
  overrides?: Partial<DestroyAssetParams>
): DestroyAssetParams => ({
  assetId: '1000',
  ...overrides,
})

/**
 * Preset: Create high-precision token (18 decimals)
 */
export const HIGH_PRECISION_ASSET = buildCreateAssetParams({
  assetId: '2000',
  name: 'High Precision Token',
  symbol: 'HPT',
  decimals: '18',
  minBalance: '1', // Note: Fractional minBalance not supported by current implementation
})

/**
 * Preset: Create token with initial mint
 */
export const ASSET_WITH_INITIAL_MINT = buildCreateAssetParams({
  assetId: '3000',
  name: 'Initial Mint Token',
  symbol: 'IMT',
  decimals: '12',
  initialMintAmount: '1000000',
  initialMintBeneficiary: TEST_ADDRESSES.ALICE,
})
