import { useQuery } from '@tanstack/react-query'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useWalletContext } from '@/hooks/useWalletContext'
import { useConnectionContext } from '@/hooks/useConnectionContext'
import { formatFee } from '@/lib/utils'

/**
 * Account dashboard showing balance and faucet link
 *
 * Displays:
 * - Connected account address
 * - Native token balance (QFN)
 * - Faucet link for testnet tokens
 */
export const AccountDashboard = () => {
  const { selectedAccount } = useWalletContext()
  const { api } = useConnectionContext()

  const { data: balance, isLoading } = useQuery({
    queryKey: ['balance', 'native', selectedAccount?.address],
    queryFn: async () => {
      if (!api || !selectedAccount) {
        return null
      }

      const accountInfo = await api.query.System.Account.getValue(
        selectedAccount.address
      )

      return accountInfo?.data.free ?? 0n
    },
    enabled: !!api && !!selectedAccount,
    staleTime: 30000,
    gcTime: 300000,
  })

  if (!selectedAccount) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>No account selected</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account</CardTitle>
        <CardDescription className="font-mono text-xs">
          {selectedAccount.address}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Balance:</span>
          {isLoading ? (
            <Badge variant="secondary">Loading...</Badge>
          ) : balance !== null && balance !== undefined ? (
            <Badge variant="outline">{formatFee(balance)} QFN</Badge>
          ) : (
            <Badge variant="outline">Unknown</Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground">
          Need testnet tokens?{' '}
          <a
            href="https://faucet.qfnetwork.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Visit the faucet
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
