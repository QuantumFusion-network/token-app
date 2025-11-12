import { useQuery } from '@tanstack/react-query'
import { useConnectionContext } from './useConnectionContext'

/**
 * Queries all existing assets and calculates the next available asset ID
 *
 * Uses TanStack Query to fetch asset entries from the chain.
 * Finds the maximum asset ID and returns the next available ID.
 *
 * @returns Object with nextAssetId, isLoading, and error
 */
export const useNextAssetId = () => {
  const { api } = useConnectionContext()

  return useQuery({
    queryKey: ['nextAssetId'],
    queryFn: async () => {
      if (!api) {
        throw new Error('API not connected')
      }

      const assets = await api.query.Assets.Asset.getEntries()

      if (assets.length === 0) {
        return '1'
      }

      const maxId = assets.reduce((max, entry) => {
        const id = entry.keyArgs[0]
        return id > max ? id : max
      }, 0)

      return String(maxId + 1)
    },
    enabled: !!api,
    staleTime: 30000, // 30s stale time
    gcTime: 300000, // 5min garbage collection
  })
}
