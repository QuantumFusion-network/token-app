import { useQuery } from '@tanstack/react-query'

import { useConnectionContext } from '../contexts/useConnectionContext'

export function useNextAssetId() {
  const { api } = useConnectionContext()

  const { data, isLoading } = useQuery({
    queryKey: ['nextAssetId'],
    queryFn: async () => {
      const result = await api.query.Assets.NextAssetId.getValue()
      if (result === undefined) {
        throw new Error(
          'NextAssetId returned undefined - chain configuration error'
        )
      }
      return result
    },
    staleTime: 0,
    gcTime: 0,
  })

  return {
    nextAssetId: data?.toString() ?? '',
    isLoading,
  }
}
