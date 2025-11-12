import type { ToastConfig } from './toastConfigs'
import type {
  CreateAssetParams,
  DestroyAssetParams,
  MintParams,
  TransferParams,
} from './assetOperations'

export const createAssetToasts: ToastConfig<CreateAssetParams> = {
  signing: 'Sign transaction to create asset',
  broadcasting: (hash: string) => `Asset creation transaction sent (${hash})`,
  inBlock: 'Asset creation included in block',
  finalized: (details?: CreateAssetParams) => {
    if (details) {
      return `Asset "${details.name}" (${details.symbol}) created with ID ${details.assetId}`
    }
    return 'Asset created successfully'
  },
  error: (error: string) => `Failed to create asset: ${error}`,
}

export const mintTokensToasts: ToastConfig<MintParams> = {
  signing: 'Sign transaction to mint tokens',
  broadcasting: (hash: string) => `Mint transaction sent (${hash})`,
  inBlock: 'Mint transaction included in block',
  finalized: (details?: MintParams) => {
    if (details) {
      return `Minted ${details.amount} tokens of asset ${details.assetId}`
    }
    return 'Tokens minted successfully'
  },
  error: (error: string) => `Failed to mint tokens: ${error}`,
}

export const transferTokensToasts: ToastConfig<TransferParams> = {
  signing: 'Sign transaction to transfer tokens',
  broadcasting: (hash: string) => `Transfer transaction sent (${hash})`,
  inBlock: 'Transfer transaction included in block',
  finalized: (details?: TransferParams) => {
    if (details) {
      return `Transferred ${details.amount} tokens of asset ${details.assetId}`
    }
    return 'Tokens transferred successfully'
  },
  error: (error: string) => `Failed to transfer tokens: ${error}`,
}

export const destroyAssetToasts: ToastConfig<DestroyAssetParams> = {
  signing: 'Sign transaction to destroy asset',
  broadcasting: (hash: string) => `Asset destruction transaction sent (${hash})`,
  inBlock: 'Asset destruction included in block',
  finalized: (details?: DestroyAssetParams) => {
    if (details) {
      return `Asset ${details.assetId} destroyed successfully`
    }
    return 'Asset destroyed successfully'
  },
  error: (error: string) => `Failed to destroy asset: ${error}`,
}
