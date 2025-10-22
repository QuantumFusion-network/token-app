import { useState } from 'react'

import { Coins, Filter } from 'lucide-react'

import { useQuery } from '@tanstack/react-query'

import { useWalletContext } from '../hooks/useWalletContext'
import { api } from '../lib/chain'
import { AccountDashboard } from './AccountDashboard'
import { AssetCard } from './AssetCard'
import { FeatureErrorBoundary } from './error-boundaries'
import { Button } from './ui/button'

type FilterType = 'all' | 'owned' | 'held'

function AssetListInner() {
  const { selectedAccount } = useWalletContext()
  const [filter, setFilter] = useState<FilterType>('all')

  // Query asset entries with reactive updates
  const {
    data: assets,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['assets'],
    queryFn: async () => {
      // Get all asset entries
      const entries = await api.query.Assets.Asset.getEntries({
        at: 'best',
      })

      return Promise.all(
        entries.map(async (entry) => {
          const assetId = entry.keyArgs[0]
          const asset = entry.value

          // Get metadata for each asset
          const metadata = await api.query.Assets.Metadata.getValue(assetId)

          return {
            id: assetId,
            asset,
            metadata,
          }
        })
      )
    },
    refetchInterval: 30_000, // Refetch every 30 seconds
  })

  // Query user's asset balances for filtering
  const { data: userBalances } = useQuery({
    queryKey: ['userAssetBalances', selectedAccount?.address],
    queryFn: async () => {
      if (!selectedAccount?.address) return []

      const entries = await api.query.Assets.Account.getEntries({
        at: 'best',
      })

      return entries
        .filter((entry) => {
          const [, accountAddress] = entry.keyArgs
          return (
            accountAddress === selectedAccount.address &&
            entry.value.balance > 0n
          )
        })
        .map((entry) => entry.keyArgs[0]) // Return asset IDs
    },
    enabled: !!selectedAccount?.address,
    refetchInterval: 30_000,
  })

  if (isLoading) {
    return (
      <div>
        <AccountDashboard />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="from-muted/20 to-muted/40 h-96 animate-pulse rounded-xl bg-gradient-to-br shadow-lg"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-destructive py-8 text-center">
        Error loading assets: {error.message}
      </div>
    )
  }

  if (!assets || assets.length === 0) {
    return (
      <div>
        <AccountDashboard />
        <div className="py-8 text-center text-gray-500">
          No assets found. Create your first asset!
        </div>
      </div>
    )
  }

  // Filter assets based on selected filter
  const filteredAssets = assets.filter((asset) => {
    if (filter === 'all') return true
    if (!selectedAccount) return false

    if (filter === 'owned') {
      return (
        asset.asset.owner === selectedAccount.address ||
        asset.asset.admin === selectedAccount.address
      )
    }

    if (filter === 'held') {
      return userBalances?.includes(asset.id) || false
    }

    return true
  })

  const filterOptions = [
    { value: 'all' as const, label: 'All Assets', count: assets.length },
    {
      value: 'owned' as const,
      label: 'My Assets',
      count: assets.filter(
        (asset) =>
          selectedAccount &&
          (asset.asset.owner === selectedAccount.address ||
            asset.asset.admin === selectedAccount.address)
      ).length,
    },
    {
      value: 'held' as const,
      label: 'Assets I Hold',
      count: userBalances?.length || 0,
    },
  ]

  return (
    <div>
      <AccountDashboard />

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {filter === 'all' && `Assets (${filteredAssets.length})`}
          {filter === 'owned' && `My Assets (${filteredAssets.length})`}
          {filter === 'held' && `Assets I Hold (${filteredAssets.length})`}
        </h2>

        <div className="flex items-center gap-2">
          <div className="text-muted-foreground flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          <div className="flex gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(option.value)}
                className={`text-sm transition-all ${
                  filter === option.value
                    ? 'shadow-lg'
                    : 'hover:-translate-y-0.5 hover:shadow-md'
                }`}
              >
                {option.label}
                {option.count > 0 && (
                  <span
                    className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                      filter === option.value
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {option.count}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="py-16 text-center">
          <div className="bg-muted mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full">
            <Coins className="text-muted-foreground h-8 w-8" />
          </div>
          <h3 className="text-foreground mb-2 text-lg font-semibold">
            {filter === 'owned' && 'No assets owned'}
            {filter === 'held' && 'No assets held'}
            {filter === 'all' && 'No assets found'}
          </h3>
          <p className="text-muted-foreground">
            {filter === 'owned' &&
              "You don't own any assets yet. Create your first asset!"}
            {filter === 'held' &&
              "You don't hold any assets yet. Get some tokens first!"}
            {filter === 'all' && 'No assets found on the network.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {filteredAssets.map((asset) => (
            <AssetCard key={asset.id} {...asset} />
          ))}
        </div>
      )}
    </div>
  )
}

export function AssetList() {
  return (
    <FeatureErrorBoundary featureName="Assets">
      <AssetListInner />
    </FeatureErrorBoundary>
  )
}
