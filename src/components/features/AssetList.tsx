import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useConnectionContext } from '@/hooks/useConnectionContext'
import { AssetCard } from './AssetCard'

interface AssetInfo {
  id: number
  name: string
  symbol: string
  decimals: number
  supply: bigint
  accounts: number
  owner: string
}

interface AssetListProps {
  onMint?: (assetId: number) => void
  onTransfer?: (assetId: number) => void
  onDestroy?: (assetId: number) => void
}

/**
 * Asset list with search and filter functionality
 *
 * Queries all assets from the chain and displays them as cards.
 * Supports filtering by asset name, symbol, or ID.
 */
export function AssetList({ onMint, onTransfer, onDestroy }: AssetListProps) {
  const { api } = useConnectionContext()
  const [searchTerm, setSearchTerm] = useState('')

  const {
    data: assets,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      if (!api) {
        throw new Error('API not connected')
      }

      const assetEntries = await api.query.Assets.Asset.getEntries()
      const metadataEntries = await api.query.Assets.Metadata.getEntries()

      const assetList: AssetInfo[] = []

      for (const entry of assetEntries) {
        const assetId = entry.keyArgs[0]
        const assetDetails = entry.value

        if (!assetDetails) continue

        // Find corresponding metadata
        const metadata = metadataEntries.find(
          (m) => m.keyArgs[0] === assetId
        )?.value

        assetList.push({
          id: assetId,
          name: metadata?.name ? metadata.name.asText() : `Asset ${assetId}`,
          symbol: metadata?.symbol ? metadata.symbol.asText() : 'N/A',
          decimals: metadata?.decimals ?? 0,
          supply: assetDetails.supply,
          accounts: assetDetails.accounts,
          owner: assetDetails.owner,
        })
      }

      return assetList.sort((a, b) => a.id - b.id)
    },
    enabled: !!api,
    staleTime: 30000,
    gcTime: 300000,
  })

  const filteredAssets = assets?.filter((asset) => {
    const search = searchTerm.toLowerCase()
    return (
      asset.name.toLowerCase().includes(search) ||
      asset.symbol.toLowerCase().includes(search) ||
      asset.id.toString().includes(search)
    )
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Loading assets...</Badge>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Badge variant="destructive">
          Failed to load assets: {error instanceof Error ? error.message : 'Unknown error'}
        </Badge>
      </div>
    )
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="space-y-4">
        <Badge variant="outline">No assets found</Badge>
        <p className="text-sm text-muted-foreground">
          Create your first asset to get started
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="search">Search Assets</Label>
        <Input
          id="search"
          placeholder="Search by name, symbol, or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="outline">
          {filteredAssets?.length ?? 0} asset{filteredAssets?.length === 1 ? '' : 's'}
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAssets?.map((asset) => (
          <AssetCard
            key={asset.id}
            asset={asset}
            onMint={onMint}
            onTransfer={onTransfer}
            onDestroy={onDestroy}
          />
        ))}
      </div>
    </div>
  )
}
