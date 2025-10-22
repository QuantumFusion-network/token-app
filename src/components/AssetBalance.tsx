import { useQuery } from '@tanstack/react-query'

import { ComponentErrorBoundary } from '@/components'
import { useConnectionContext, useWalletContext } from '@/hooks'
import { formatUnits } from '@/lib'

interface AssetBalanceProps {
  assetId: number
  accountId?: string
}

function AssetBalanceInner({ assetId, accountId }: AssetBalanceProps) {
  const { selectedAccount } = useWalletContext()
  const { api } = useConnectionContext()
  const targetAccount = accountId || selectedAccount?.address

  const {
    data: balance,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['assetBalance', assetId, targetAccount],
    queryFn: async () => {
      if (!targetAccount) return null
      return await api.query.Assets.Account.getValues([
        [assetId, targetAccount],
      ])
    },
    enabled: !!targetAccount,
    refetchInterval: 10_000, // Update every 10 seconds
  })

  const { data: metadata } = useQuery({
    queryKey: ['assetMetadata', assetId],
    queryFn: () => api.query.Assets.Metadata.getValue(assetId),
    staleTime: 5 * 60 * 1000, // Metadata rarely changes
  })

  if (isLoading) {
    return <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
  }

  if (error || !targetAccount) {
    return <div className="text-sm text-red-500">Error loading balance</div>
  }

  if (!balance) {
    return <div className="text-gray-500">0.000</div>
  }

  const symbol = metadata
    ? new TextDecoder().decode(metadata.symbol.asBytes())
    : `Asset ${assetId}`

  const decimals = metadata?.decimals ?? 12
  const formattedBalance = formatUnits(balance[0]?.balance || 0n, decimals)

  return (
    <div className="font-mono">
      {formattedBalance} {symbol}
    </div>
  )
}

export function AssetBalance(props: AssetBalanceProps) {
  return (
    <ComponentErrorBoundary
      componentName="Asset Balance"
      fallback={<div className="text-sm text-red-500">Balance unavailable</div>}
    >
      <AssetBalanceInner {...props} />
    </ComponentErrorBoundary>
  )
}
