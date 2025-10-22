import { ExternalLink, Wallet } from 'lucide-react'

import { useQuery } from '@tanstack/react-query'

import { useConnectionContext } from '../hooks/useConnectionContext'
import { useWalletContext } from '../hooks/useWalletContext'
import { formatUnits } from '../utils/format'
import { ComponentErrorBoundary } from './error-boundaries'
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'

function AccountDashboardInner() {
  const { selectedAccount } = useWalletContext()
  const { api } = useConnectionContext()

  // Get account's native token balance
  const { data: accountInfo, isLoading: isLoadingAccount } = useQuery({
    queryKey: ['accountInfo', selectedAccount?.address],
    queryFn: async () => {
      if (!selectedAccount?.address) return null
      return await api.query.System.Account.getValue(selectedAccount.address)
    },
    enabled: !!selectedAccount?.address,
    refetchInterval: 10_000,
  })

  if (!selectedAccount) {
    return null
  }

  const nativeBalance = accountInfo?.data.free || 0n
  const formattedNativeBalance = formatUnits(nativeBalance, 12) // QF Network uses 12 decimals

  // Truncate balance to 3 decimal places with ellipsis
  const truncatedBalance = (() => {
    const parts = formattedNativeBalance.split('.')
    if (parts.length === 1) return formattedNativeBalance
    return `${parts[0]}.${parts[1].slice(0, 4)}...`
  })()

  const faucetUrl = 'https://faucet.qfnetwork.xyz' // Replace with actual testnet faucet URL

  return (
    <div className="mb-6">
      {/* Single Stretched Summary Card */}
      <Card className="from-primary/10 to-primary/20 border-primary/20 bg-gradient-to-br shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Left Section - Balance */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <Wallet className="text-primary h-6 w-6" />
                <div>
                  <div className="text-primary mb-1 text-sm font-medium">
                    QF Balance
                  </div>
                  {isLoadingAccount ? (
                    <div className="bg-primary/20 h-8 w-48 animate-pulse rounded" />
                  ) : (
                    <div className="text-foreground font-mono text-2xl font-bold">
                      {truncatedBalance}{' '}
                      <span className="text-primary text-lg">QF</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Section - Faucet Button */}
            <Button
              variant="default"
              size="lg"
              className="gap-2"
              onClick={() => window.open(faucetUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              Get Tokens
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function AccountDashboard() {
  return (
    <ComponentErrorBoundary
      componentName="Account Dashboard"
      fallback={
        <div className="text-sm text-red-500">Dashboard unavailable</div>
      }
    >
      <AccountDashboardInner />
    </ComponentErrorBoundary>
  )
}
