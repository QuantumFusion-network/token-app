import type { TypedApi, SS58String } from 'polkadot-api'
import { Binary } from 'polkadot-api'
import type { qfn } from '@polkadot-api/descriptors'

/**
 * Asset metadata information
 */
export interface AssetMetadata {
  name: string
  symbol: string
  decimals: number
}

/**
 * Asset details
 */
export interface AssetDetails {
  id: number
  owner: SS58String
  issuer: SS58String
  admin: SS58String
  freezer: SS58String
  supply: bigint
  minBalance: bigint
  isSufficient: boolean
  accounts: number
  sufficients: number
  approvals: number
  status: string
}

/**
 * Fetches metadata for a specific asset
 * @param api - Typed Polkadot API
 * @param assetId - The asset ID to query
 * @returns Asset metadata or null if not found
 */
export async function getAssetMetadata(
  api: TypedApi<typeof qfn>,
  assetId: number,
): Promise<AssetMetadata | null> {
  const metadata = await api.query.Assets.Metadata.getValue(assetId)

  if (!metadata) {
    return null
  }

  return {
    name: metadata.name.asText(),
    symbol: metadata.symbol.asText(),
    decimals: metadata.decimals,
  }
}

/**
 * Fetches details for a specific asset
 * @param api - Typed Polkadot API
 * @param assetId - The asset ID to query
 * @returns Asset details or null if not found
 */
export async function getAssetDetails(
  api: TypedApi<typeof qfn>,
  assetId: number,
): Promise<AssetDetails | null> {
  const details = await api.query.Assets.Asset.getValue(assetId)

  if (!details) {
    return null
  }

  return {
    id: assetId,
    owner: details.owner,
    issuer: details.issuer,
    admin: details.admin,
    freezer: details.freezer,
    supply: details.supply,
    minBalance: details.min_balance,
    isSufficient: details.is_sufficient,
    accounts: details.accounts,
    sufficients: details.sufficients,
    approvals: details.approvals,
    status: details.status.type,
  }
}

/**
 * Fetches the balance of a specific asset for an account
 * @param api - Typed Polkadot API
 * @param assetId - The asset ID
 * @param account - The account address
 * @returns Balance amount or null if account doesn't hold this asset
 */
export async function getAssetBalance(
  api: TypedApi<typeof qfn>,
  assetId: number,
  account: SS58String,
): Promise<bigint | null> {
  const accountInfo = await api.query.Assets.Account.getValue(
    assetId,
    account,
  )

  if (!accountInfo) {
    return null
  }

  return accountInfo.balance
}

/**
 * Fetches all assets on the chain
 * @param api - Typed Polkadot API
 * @returns Array of asset IDs
 */
export async function getAllAssets(
  api: TypedApi<typeof qfn>,
): Promise<number[]> {
  const entries = await api.query.Assets.Asset.getEntries()

  return entries.map(({ keyArgs }) => keyArgs[0] as number)
}

/**
 * Fetches native balance for an account
 * @param api - Typed Polkadot API
 * @param account - The account address
 * @returns Account balance information
 */
export async function getNativeBalance(
  api: TypedApi<typeof qfn>,
  account: SS58String,
) {
  const accountInfo = await api.query.System.Account.getValue(account)

  return {
    free: accountInfo.data.free,
    reserved: accountInfo.data.reserved,
    frozen: accountInfo.data.frozen,
    flags: accountInfo.data.flags,
  }
}
