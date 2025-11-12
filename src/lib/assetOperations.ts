import { Binary, type TxCallData, type TypedApi } from 'polkadot-api'
import { MultiAddress, type qfn } from '@polkadot-api/descriptors'
import { parseUnits } from './utils'

type QfnApi = TypedApi<typeof qfn>

export interface CreateAssetParams {
  assetId: string
  minBalance: string
  name: string
  symbol: string
  decimals: string
  initialMintAmount: string
  initialMintBeneficiary: string
}

export interface MintParams {
  assetId: string
  recipient: string
  amount: string
  decimals: number
}

export interface TransferParams {
  assetId: string
  recipient: string
  amount: string
  decimals: number
}

export interface DestroyAssetParams {
  assetId: string
}

/**
 * Creates a new asset with metadata and optional initial mint
 * Uses batch_all for atomicity (all operations succeed or all fail)
 */
export const createAssetBatch = (
  api: QfnApi,
  params: CreateAssetParams,
  signerAddress: string
) => {
  const assetId = parseInt(params.assetId)
  const minBalance = BigInt(params.minBalance) * 10n ** BigInt(params.decimals)

  const createCall = api.tx.Assets.create({
    id: assetId,
    admin: MultiAddress.Id(signerAddress),
    min_balance: minBalance,
  }).decodedCall

  const metadataCall = api.tx.Assets.set_metadata({
    id: assetId,
    name: Binary.fromText(params.name),
    symbol: Binary.fromText(params.symbol),
    decimals: parseInt(params.decimals),
  }).decodedCall

  const calls: TxCallData[] = [createCall, metadataCall]

  if (params.initialMintAmount && parseFloat(params.initialMintAmount) > 0) {
    const mintAmount = parseUnits(
      params.initialMintAmount,
      parseInt(params.decimals)
    )
    const mintCall = api.tx.Assets.mint({
      id: assetId,
      beneficiary: MultiAddress.Id(params.initialMintBeneficiary),
      amount: mintAmount,
    }).decodedCall
    calls.push(mintCall)
  }

  return api.tx.Utility.batch_all({ calls })
}

/**
 * Mints additional tokens to a recipient
 */
export const mintTokens = (api: QfnApi, params: MintParams) => {
  return api.tx.Assets.mint({
    id: parseInt(params.assetId),
    beneficiary: MultiAddress.Id(params.recipient),
    amount: parseUnits(params.amount, params.decimals),
  })
}

/**
 * Transfers tokens to a recipient
 */
export const transferTokens = (api: QfnApi, params: TransferParams) => {
  return api.tx.Assets.transfer({
    id: parseInt(params.assetId),
    target: MultiAddress.Id(params.recipient),
    amount: parseUnits(params.amount, params.decimals),
  })
}

/**
 * Destroys an asset in a 5-step atomic process:
 * 1. freeze_asset - Prevents further operations
 * 2. start_destroy - Begins destruction process
 * 3. destroy_approvals - Removes all approvals
 * 4. destroy_accounts - Removes all account holdings
 * 5. finish_destroy - Completes destruction
 */
export const destroyAssetBatch = (api: QfnApi, params: DestroyAssetParams) => {
  const assetId = parseInt(params.assetId)

  const calls: TxCallData[] = [
    api.tx.Assets.freeze_asset({ id: assetId }).decodedCall,
    api.tx.Assets.start_destroy({ id: assetId }).decodedCall,
    api.tx.Assets.destroy_approvals({ id: assetId }).decodedCall,
    api.tx.Assets.destroy_accounts({ id: assetId }).decodedCall,
    api.tx.Assets.finish_destroy({ id: assetId }).decodedCall,
  ]

  return api.tx.Utility.batch_all({ calls })
}
