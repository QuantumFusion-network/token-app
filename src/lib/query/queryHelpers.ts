import type { QueryClient } from '@tanstack/react-query'

export const invalidateAssetQueries = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: ['assets'] })
  await queryClient.invalidateQueries({ queryKey: ['assetMetadata'] })
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
