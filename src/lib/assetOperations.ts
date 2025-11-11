import type { TypedApi, SS58String } from 'polkadot-api'
import { Binary } from 'polkadot-api'
import type { qfn } from '@polkadot-api/descriptors'
import { MultiAddress } from '@polkadot-api/descriptors'

/**
 * Asset operation parameters
 */
export interface CreateAssetParams {
  assetId: number
  admin: SS58String
  minBalance: bigint
}

export interface MintTokensParams {
  assetId: number
  beneficiary: SS58String
  amount: bigint
}

export interface TransferTokensParams {
  assetId: number
  target: SS58String
  amount: bigint
}

export interface DestroyAssetParams {
  assetId: number
}

/**
 * Creates a new asset (token) on the chain
 * @param api - Typed Polkadot API
 * @param params - Asset creation parameters
 * @returns Transaction ready to be signed and submitted
 */
export function createAssetBatch(
  api: TypedApi<typeof qfn>,
  params: CreateAssetParams,
) {
  const { assetId, admin, minBalance } = params

  // Create MultiAddress for admin
  const adminAddress = MultiAddress.Id(admin)

  // Convert strings to Binary (Uint8Array encoded strings)
  const nameBytes = Binary.fromText(`Asset ${assetId}`)
  const symbolBytes = Binary.fromText(`AST${assetId}`)

  // Create asset and set metadata in a batch transaction
  return api.tx.Utility.batch_all({
    calls: [
      // Create the asset
      api.tx.Assets.create({
        id: assetId,
        admin: adminAddress,
        min_balance: minBalance,
      }).decodedCall,
      // Set asset metadata (name, symbol, decimals)
      api.tx.Assets.set_metadata({
        id: assetId,
        name: nameBytes,
        symbol: symbolBytes,
        decimals: 10,
      }).decodedCall,
    ],
  })
}

/**
 * Mints tokens for a specific asset
 * @param api - Typed Polkadot API
 * @param params - Minting parameters
 * @returns Transaction ready to be signed and submitted
 */
export function mintTokens(
  api: TypedApi<typeof qfn>,
  params: MintTokensParams,
) {
  const { assetId, beneficiary, amount } = params

  return api.tx.Assets.mint({
    id: assetId,
    beneficiary: MultiAddress.Id(beneficiary),
    amount,
  })
}

/**
 * Transfers tokens from sender to target
 * @param api - Typed Polkadot API
 * @param params - Transfer parameters
 * @returns Transaction ready to be signed and submitted
 */
export function transferTokens(
  api: TypedApi<typeof qfn>,
  params: TransferTokensParams,
) {
  const { assetId, target, amount } = params

  return api.tx.Assets.transfer({
    id: assetId,
    target: MultiAddress.Id(target),
    amount,
  })
}

/**
 * Destroys an asset (requires all tokens to be burned first)
 * @param api - Typed Polkadot API
 * @param params - Destroy parameters
 * @returns Transaction ready to be signed and submitted
 */
export function destroyAssetBatch(
  api: TypedApi<typeof qfn>,
  params: DestroyAssetParams,
) {
  const { assetId } = params

  // Destroy asset in multiple steps via batch
  return api.tx.Utility.batch_all({
    calls: [
      // Start destroy process
      api.tx.Assets.start_destroy({
        id: assetId,
      }).decodedCall,
      // Destroy accounts
      api.tx.Assets.destroy_accounts({
        id: assetId,
      }).decodedCall,
      // Destroy approvals
      api.tx.Assets.destroy_approvals({
        id: assetId,
      }).decodedCall,
      // Finish destroy
      api.tx.Assets.finish_destroy({
        id: assetId,
      }).decodedCall,
    ],
  })
}
