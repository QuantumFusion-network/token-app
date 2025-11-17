/**
 * Test fixtures for QF Network assets
 *
 * These represent realistic asset data structures as returned by
 * the Assets pallet queries on QF Network testnet.
 */

import type {
  CreateAssetParams,
  MintParams,
  TransferParams,
  DestroyAssetParams,
} from '@/lib'
import { ALICE_ACCOUNT, BOB_ACCOUNT } from './accounts'

/**
 * Asset details from Assets.Asset query
 * Represents on-chain asset configuration
 */
export const USDC_ASSET_DETAILS = {
  accounts: 3,
  admin: ALICE_ACCOUNT.address,
  approvals: 0,
  deposit: 0n,
  freezer: ALICE_ACCOUNT.address,
  is_frozen: false,
  is_sufficient: false,
  issuer: ALICE_ACCOUNT.address,
  min_balance: 1000000n, // 1 USDC with 6 decimals
  owner: ALICE_ACCOUNT.address,
  status: 'Live',
  sufficients: 0,
  supply: 1000000000000n, // 1,000,000 USDC
}

export const TOKEN_ASSET_DETAILS = {
  accounts: 2,
  admin: ALICE_ACCOUNT.address,
  approvals: 0,
  deposit: 0n,
  freezer: ALICE_ACCOUNT.address,
  is_frozen: false,
  is_sufficient: false,
  issuer: ALICE_ACCOUNT.address,
  min_balance: 1000000000000000000n, // 1 TOKEN with 18 decimals
  owner: ALICE_ACCOUNT.address,
  status: 'Live',
  sufficients: 0,
  supply: 1000000000000000000000n, // 1,000 TOKEN
}

/**
 * Frozen asset (for destroy asset tests)
 */
export const FROZEN_ASSET_DETAILS = {
  ...USDC_ASSET_DETAILS,
  is_frozen: true,
  status: 'Freezing',
}

/**
 * Asset metadata from Assets.Metadata query
 */
export const USDC_METADATA = {
  decimals: 6,
  deposit: 0n,
  is_frozen: false,
  name: 'USD Coin',
  symbol: 'USDC',
}

export const TOKEN_METADATA = {
  decimals: 18,
  deposit: 0n,
  is_frozen: false,
  name: 'Test Token',
  symbol: 'TOKEN',
}

/**
 * Asset account balance from Assets.Account query
 * Represents user's balance of a specific asset
 */
export const ALICE_USDC_BALANCE = {
  balance: 100000000000n, // 100,000 USDC (6 decimals)
  extra: null,
  is_frozen: false,
  reason: 'Consumer',
  status: 'Liquid',
}

export const BOB_USDC_BALANCE = {
  balance: 50000000000n, // 50,000 USDC
  extra: null,
  is_frozen: false,
  reason: 'Consumer',
  status: 'Liquid',
}

export const ALICE_TOKEN_BALANCE = {
  balance: 500000000000000000000n, // 500 TOKEN (18 decimals)
  extra: null,
  is_frozen: false,
  reason: 'Consumer',
  status: 'Liquid',
}

/**
 * Zero balance (user doesn't hold this asset)
 */
export const ZERO_ASSET_BALANCE = {
  balance: 0n,
  extra: null,
  is_frozen: false,
  reason: 'Consumer',
  status: 'Liquid',
}

/**
 * Asset operation parameters for testing
 */

/**
 * Create USDC asset (6 decimals, common stablecoin pattern)
 */
export const CREATE_USDC_PARAMS: CreateAssetParams = {
  assetId: '1000',
  minBalance: '1', // 1 USDC minimum
  name: 'USD Coin',
  symbol: 'USDC',
  decimals: '6',
  initialMintAmount: '', // No initial mint
  initialMintBeneficiary: '',
}

/**
 * Create TOKEN asset with initial mint (18 decimals)
 */
export const CREATE_TOKEN_WITH_MINT_PARAMS: CreateAssetParams = {
  assetId: '1001',
  minBalance: '1', // 1 TOKEN minimum
  name: 'Test Token',
  symbol: 'TOKEN',
  decimals: '18',
  initialMintAmount: '1000', // Mint 1000 TOKEN initially
  initialMintBeneficiary: ALICE_ACCOUNT.address,
}

/**
 * Create asset with edge case values
 */
export const CREATE_HIGH_DECIMALS_PARAMS: CreateAssetParams = {
  assetId: '9999',
  minBalance: '0.000001', // Very small minimum
  name: 'High Precision Token',
  symbol: 'HPT',
  decimals: '18', // Maximum practical decimals
  initialMintAmount: '',
  initialMintBeneficiary: '',
}

/**
 * Mint 1000 USDC to Bob
 */
export const MINT_USDC_PARAMS: MintParams = {
  assetId: '1000',
  recipient: BOB_ACCOUNT.address,
  amount: '1000', // 1000 USDC
  decimals: 6,
}

/**
 * Mint with high precision (18 decimals)
 */
export const MINT_TOKEN_PARAMS: MintParams = {
  assetId: '1001',
  recipient: BOB_ACCOUNT.address,
  amount: '123.456789012345678901', // Maximum precision
  decimals: 18,
}

/**
 * Transfer 50 USDC from Alice to Bob
 */
export const TRANSFER_USDC_PARAMS: TransferParams = {
  assetId: '1000',
  recipient: BOB_ACCOUNT.address,
  amount: '50',
  decimals: 6,
}

/**
 * Transfer with fractional amount
 */
export const TRANSFER_FRACTIONAL_PARAMS: TransferParams = {
  assetId: '1001',
  recipient: BOB_ACCOUNT.address,
  amount: '0.123456789012345678', // Fractional transfer
  decimals: 18,
}

/**
 * Destroy USDC asset
 */
export const DESTROY_USDC_PARAMS: DestroyAssetParams = {
  assetId: '1000',
}

/**
 * Combined asset data (details + metadata) as returned by queries
 */
export const USDC_ASSET = {
  id: 1000,
  details: USDC_ASSET_DETAILS,
  metadata: USDC_METADATA,
}

export const TOKEN_ASSET = {
  id: 1001,
  details: TOKEN_ASSET_DETAILS,
  metadata: TOKEN_METADATA,
}

/**
 * All test assets for iteration
 */
export const TEST_ASSETS = [USDC_ASSET, TOKEN_ASSET]
