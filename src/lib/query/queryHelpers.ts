import type { QueryClient } from '@tanstack/react-query'

export const invalidateAssetQueries = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: ['assets'] })
  await queryClient.invalidateQueries({ queryKey: ['assetMetadata'] })
  // Use refetchQueries for nextAssetId to wait for fresh value before continuing.
  // This prevents race conditions where the next asset creation uses a stale ID.
  await queryClient.refetchQueries({ queryKey: ['nextAssetId'] })
}

export const invalidateBalanceQueries = (
  queryClient: QueryClient,
  assetId: number,
  addresses: (string | undefined)[]
) => {
  addresses.forEach((address) => {
    if (address) {
      queryClient
        .invalidateQueries({
          queryKey: ['assetBalance', assetId, address],
        })
        .catch((e: Error) => {
          console.log(e)
        })
    }
  })
}
