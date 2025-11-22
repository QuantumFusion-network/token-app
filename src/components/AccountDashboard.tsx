import { ExternalLink, Wallet } from 'lucide-react'

import { ComponentErrorBoundary } from '@/components'
import { Button, Card, CardContent } from '@/components/ui'
import { useConnectionContext, useWalletContext } from '@/hooks'
import { formatBalance, fromPlanck } from '@/lib'
import { useQuery } from '@tanstack/react-query'

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
  console.log('nativeBalance', nativeBalance)
  const formattedNativeBalance = formatBalance(fromPlanck(nativeBalance, 18), {
    symbol: 'QF',
    displayDecimals: 2,
    locale: 'en-US',
  })

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
                      {formattedNativeBalance}{' '}
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
