import type { QueryClient } from '@tanstack/react-query'

/**
 * Invalidates all asset-related queries
 *
 * Call this after mutations that modify assets:
 * - Creating new assets
 * - Destroying assets
 * - Updating asset metadata
 */
export const invalidateAssetQueries = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries({ queryKey: ['assets'] })
  await queryClient.invalidateQueries({ queryKey: ['nextAssetId'] })
}

/**
 * Invalidates balance queries for specific asset or all assets
 *
 * Call this after mutations that modify balances:
 * - Minting tokens
 * - Transferring tokens
 * - Burning tokens
 *
 * @param queryClient - TanStack Query client
 * @param assetId - Optional specific asset ID to invalidate
 */
export const invalidateBalanceQueries = async (
  queryClient: QueryClient,
  assetId?: string
) => {
  if (assetId) {
    await queryClient.invalidateQueries({
      queryKey: ['balance', assetId],
    })
  } else {
    await queryClient.invalidateQueries({
      queryKey: ['balance'],
    })
  }
}
