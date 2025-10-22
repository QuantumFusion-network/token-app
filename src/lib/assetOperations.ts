import { Binary, type TxCallData } from 'polkadot-api'

import { MultiAddress } from '@polkadot-api/descriptors'

import { parseUnits } from '../utils/format'
import { api } from './chain'

export interface CreateAssetParams {
  assetId: string
  minBalance: string
  name: string
  symbol: string
  decimals: string
  initialMintAmount: string
}

export interface MintTokensParams {
  assetId: string
  recipient: string
  amount: string
  decimals: number
}

export interface TransferTokensParams {
  assetId: string
  recipient: string
  amount: string
  decimals: number
}

export interface DestroyAssetParams {
  assetId: string
}

export const createAssetBatch = (
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

    const mintTx = api.tx.Assets.mint({
      id: assetId,
      beneficiary: MultiAddress.Id(signerAddress),
      amount: mintAmount,
    }).decodedCall

    calls.push(mintTx)
  }

  return api.tx.Utility.batch_all({ calls })
}

export const mintTokens = (params: MintTokensParams) => {
  const assetId = parseInt(params.assetId)
  const amount = parseUnits(params.amount, params.decimals)

  return api.tx.Assets.mint({
    id: assetId,
    beneficiary: MultiAddress.Id(params.recipient),
    amount,
  })
}

export const transferTokens = (params: TransferTokensParams) => {
  const assetId = parseInt(params.assetId)
  const amount = parseUnits(params.amount, params.decimals)

  return api.tx.Assets.transfer({
    id: assetId,
    target: MultiAddress.Id(params.recipient),
    amount,
  })
}

export const destroyAssetBatch = (params: DestroyAssetParams) => {
  const assetId = parseInt(params.assetId)

  const freezeCall = api.tx.Assets.freeze_asset({
    id: assetId,
  }).decodedCall

  const startDestroyCall = api.tx.Assets.start_destroy({
    id: assetId,
  }).decodedCall

  const destroyAccountsCall = api.tx.Assets.destroy_accounts({
    id: assetId,
  }).decodedCall

  const destroyApprovalsCall = api.tx.Assets.destroy_approvals({
    id: assetId,
  }).decodedCall

  const finishDestroyCall = api.tx.Assets.finish_destroy({
    id: assetId,
  }).decodedCall

  const calls: TxCallData[] = [
    freezeCall,
    startDestroyCall,
    destroyApprovalsCall,
    destroyAccountsCall,
    finishDestroyCall,
  ]

  return api.tx.Utility.batch_all({ calls })
}
