import { Binary, type TxCallData, type TypedApi } from 'polkadot-api'

import { MultiAddress, type qfn } from '@polkadot-api/descriptors'

import { toPlanck } from './decimal-scaling'

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

export const createAssetBatch = (
  api: QfnApi,
  params: CreateAssetParams,
  signerAddress: string
) => {
  const assetId = parseInt(params.assetId)
  const minBalance = toPlanck(params.minBalance, parseInt(params.decimals))

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
    const mintAmount = toPlanck(
      params.initialMintAmount,
      parseInt(params.decimals)
    )

    const mintTx = api.tx.Assets.mint({
      id: assetId,
      beneficiary: MultiAddress.Id(params.initialMintBeneficiary),
      amount: mintAmount,
    }).decodedCall

    calls.push(mintTx)
  }

  return api.tx.Utility.batch_all({ calls })
}

export const mintTokens = (api: QfnApi, params: MintParams) => {
  const assetId = parseInt(params.assetId)
  const amount = toPlanck(params.amount, params.decimals)

  return api.tx.Assets.mint({
    id: assetId,
    beneficiary: MultiAddress.Id(params.recipient),
    amount,
  })
}

export const transferTokens = (api: QfnApi, params: TransferParams) => {
  const assetId = parseInt(params.assetId)
  const amount = toPlanck(params.amount, params.decimals)

  return api.tx.Assets.transfer({
    id: assetId,
    target: MultiAddress.Id(params.recipient),
    amount,
  })
}

export const destroyAssetBatch = (api: QfnApi, params: DestroyAssetParams) => {
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
