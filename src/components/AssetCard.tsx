import { Coins, MoreVertical, Send, Trash2, TrendingUp, Users } from 'lucide-react'
import type { Binary } from 'polkadot-api'

import { AssetBalance } from '@/components'
import {
  Badge,
  Button,
  Card,
  CardContent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui'
import { useWalletContext } from '@/hooks'
import { formatUnits } from '@/lib'

interface AssetCardProps {
  id: number
  metadata: {
    symbol: Binary
    name: Binary
    decimals: number
    deposit: bigint
    is_frozen: boolean
  }
  asset: {
    supply: bigint
    owner: string
    issuer: string
    admin: string
    is_sufficient: boolean
    accounts: number
    sufficients: number
  }
}

export function AssetCard({ id, metadata, asset }: AssetCardProps) {
  const { selectedAccount } = useWalletContext()
  const formattedSupply = formatUnits(asset.supply, metadata.decimals)

  const isOwner = selectedAccount?.address === asset.owner
  const isAdmin = selectedAccount?.address === asset.admin
  const canManage = isOwner || isAdmin

  const handleMint = () => {
    // This would typically trigger a modal or navigate to mint page
    console.log('Mint tokens for asset', id)
  }

  const handleTransfer = () => {
    // This would typically trigger a modal or navigate to transfer page
    console.log('Transfer tokens for asset', id)
  }

  const handleDestroy = () => {
    // This would typically trigger a modal or navigate to destroy page
    console.log('Destroy asset', id)
  }

  // Dynamic styling based on ownership using semantic theme colors
  const cardColors = isOwner
    ? 'bg-gradient-to-br from-primary/8 via-primary/5 to-transparent border-primary/30'
    : isAdmin
      ? 'bg-gradient-to-br from-accent/8 via-accent/5 to-transparent border-accent/30'
      : 'bg-card/50 border-border/60'

  const borderGlow = isOwner
    ? 'shadow-[0_0_0_1px_oklch(var(--primary)/0.2)]'
    : isAdmin
      ? 'shadow-[0_0_0_1px_oklch(var(--accent)/0.2)]'
      : ''

  return (
    <Card
      className={`${cardColors} ${borderGlow} relative shadow-lg backdrop-blur-sm transition-shadow duration-200`}
    >
      <CardContent className="relative p-4">
        {/* Header with Asset Name and Symbol */}
        <div className="mb-3 flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-1 flex items-baseline justify-between gap-3">
              <h3 className="text-foreground text-2xl leading-tight font-bold">
                {metadata.name.asText()}
              </h3>

              <Badge
                variant="outline"
                className="justify-self-end font-mono text-xs"
              >
                ID #{id}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {metadata.is_frozen && (
                <div className="text-destructive flex items-center gap-1.5">
                  <div className="bg-destructive h-1.5 w-1.5 animate-pulse rounded-full" />
                  <span className="text-xs font-medium">Frozen</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions Menu */}
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-60 transition-opacity hover:opacity-100"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleMint}>
                  <Coins className="mr-2 h-4 w-4" />
                  Mint Tokens
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleTransfer}>
                  <Send className="mr-2 h-4 w-4" />
                  Transfer
                </DropdownMenuItem>
                {isOwner && (
                  <DropdownMenuItem
                    onClick={handleDestroy}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Destroy Asset
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Key Metrics - Side by Side Stat Cards */}
        <div className="mb-3 grid grid-cols-2 gap-3">
          {/* Total Supply Card */}
          <div className="bg-muted/30 border-border/40 rounded-lg border p-3">
            <div className="mb-1.5 flex items-center gap-2">
              <TrendingUp className="text-primary h-4 w-4" />
              <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Total Supply
              </span>
            </div>
            <div className="text-foreground font-mono text-xl font-bold">
              {`${formattedSupply} ${metadata.symbol.asText()}`}
            </div>
          </div>

          {/* Holders Card */}
          <div className="bg-muted/30 border-border/40 rounded-lg border p-3">
            <div className="mb-1.5 flex items-center gap-2">
              <Users className="text-accent h-4 w-4" />
              <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Holders
              </span>
            </div>
            <div className="text-foreground font-mono text-xl font-bold">
              {`${asset.accounts} ${
                asset.accounts === 1 ? 'Account' : 'Accounts'
              }`}
            </div>
          </div>
        </div>

        {/* YOUR DATA Section */}
        {selectedAccount && (
          <div className="mb-3">
            <div className="space-y-1.5">
              <div className="border-border/50 flex items-center justify-between border-b py-1.5">
                <span className="text-muted-foreground text-sm">
                  Your Balance
                </span>
                <span className="text-foreground font-mono text-sm font-semibold">
                  <AssetBalance assetId={id} />
                </span>
              </div>
              <div className="border-border/50 flex items-center justify-between border-b py-1.5">
                <span className="text-muted-foreground text-sm">Owner</span>
                <div className="flex items-center gap-2">
                  <span className="text-foreground font-mono text-xs">
                    {asset.owner.slice(0, 6)}...{asset.owner.slice(-4)}
                  </span>
                  {isOwner && (
                    <Badge className="bg-primary/20 text-primary border-primary/30 px-2 py-0.5 text-xs">
                      You
                    </Badge>
                  )}
                </div>
              </div>
              {asset.owner !== asset.admin && (
                <div className="border-border/50 flex items-center justify-between border-b py-1.5">
                  <span className="text-muted-foreground text-sm">Admin</span>
                  <div className="flex items-center gap-2">
                    <span className="text-foreground font-mono text-xs">
                      {asset.admin.slice(0, 6)}...{asset.admin.slice(-4)}
                    </span>
                    {isAdmin && (
                      <Badge className="bg-accent/20 text-accent border-accent/30 px-2 py-0.5 text-xs">
                        You
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ASSET METADATA Section */}
        <div>
          <div className="space-y-1.5">
            <div className="border-border/50 flex items-center justify-between border-b py-1.5">
              <span className="text-muted-foreground text-sm">Decimals</span>
              <span className="text-foreground text-sm font-medium">
                {metadata.decimals}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5">
              <span className="text-muted-foreground text-sm">Sufficient</span>
              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    asset.is_sufficient
                      ? 'bg-green-500'
                      : 'bg-muted-foreground/40'
                  }`}
                />
                <span className="text-foreground text-sm font-medium">
                  {asset.is_sufficient ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
