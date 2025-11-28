import type {
  CreateAssetParams,
  DestroyAssetParams,
  MintParams,
  TransferParams,
} from '@/lib'

export interface ToastConfig<T> {
  signing: string
  broadcasting: (hash: string) => string
  inBlock: string
  finalized: (details?: T) => string
  error: (error: string) => string
}

export const createAssetToasts: ToastConfig<CreateAssetParams> = {
  signing: 'Please sign the transaction in your wallet',
  broadcasting: () => 'Submitting asset creation batch...',
  inBlock: 'Asset creation transaction included in block...',
  finalized: (details) => {
    if (
      details?.initialMintAmount &&
      parseFloat(details.initialMintAmount) > 0
    ) {
      return `Asset ${details?.assetId} created and ${details.initialMintAmount} tokens minted to ${details.initialMintBeneficiary?.slice(0, 8)}...!`
    }
    return `Asset ${details?.assetId} created successfully!`
  },
  error: (_error: string) => `Transaction failed!`,
}

export const mintTokensToasts: ToastConfig<MintParams> = {
  signing: 'Please sign the mint transaction in your wallet',
  broadcasting: () => 'Submitting mint transaction...',
  inBlock: 'Mint transaction included in block...',
  finalized: (details) => {
    return details
      ? `${
          details.amount
        } tokens minted successfully to ${details.recipient?.slice(
          0,
          8
        )}... for Asset ID ${details.assetId}!`
      : 'Tokens minted successfully!'
  },
  error: (_error: string) => `Mint transaction failed!`,
}

export const transferTokensToasts: ToastConfig<TransferParams> = {
  signing: 'Please sign the transfer transaction in your wallet',
  broadcasting: () => 'Submitting transfer transaction...',
  inBlock: 'Transfer transaction included in block...',
  finalized: (details) => {
    return details
      ? `${
          details.amount
        } tokens transferred successfully to ${details.recipient}... for Asset ID ${details.assetId}!`
      : 'Tokens transferred successfully!'
  },
  error: (_error: string) => `Transfer transaction failed`,
}

export const destroyAssetToasts: ToastConfig<DestroyAssetParams> = {
  signing: 'Please sign the asset destruction transaction in your wallet',
  broadcasting: () => 'Submitting asset destruction batch...',
  inBlock: 'Asset destruction transaction in block...',
  finalized: (details) => `Asset ${details?.assetId} destroyed successfully!`,
  error: (_error: string) => `Asset destruction failed`,
}
