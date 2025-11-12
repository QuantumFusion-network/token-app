import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatUnits } from '@/lib/utils'

interface AssetInfo {
  id: number
  name: string
  symbol: string
  decimals: number
  supply: bigint
  accounts: number
  owner: string
}

interface AssetCardProps {
  asset: AssetInfo
  onMint?: (assetId: number) => void
  onTransfer?: (assetId: number) => void
  onDestroy?: (assetId: number) => void
}

/**
 * Asset card displaying token information and actions
 *
 * Shows:
 * - Asset name, symbol, ID
 * - Total supply and account count
 * - Action menu (mint, transfer, destroy)
 */
export function AssetCard({
  asset,
  onMint,
  onTransfer,
  onDestroy,
}: AssetCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {asset.name}
          <Badge variant="outline">#{asset.id}</Badge>
        </CardTitle>
        <CardDescription>{asset.symbol}</CardDescription>
        <CardAction>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onMint && (
                <DropdownMenuItem onClick={() => onMint(asset.id)}>
                  Mint Tokens
                </DropdownMenuItem>
              )}
              {onTransfer && (
                <DropdownMenuItem onClick={() => onTransfer(asset.id)}>
                  Transfer Tokens
                </DropdownMenuItem>
              )}
              {onDestroy && (
                <DropdownMenuItem
                  onClick={() => onDestroy(asset.id)}
                  className="text-destructive"
                >
                  Destroy Asset
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Decimals:</span>
          <span className="font-mono">{asset.decimals}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Supply:</span>
          <span className="font-mono">
            {formatUnits(asset.supply, asset.decimals)}
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Accounts:</span>
          <span className="font-mono">{asset.accounts}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Owner:</span>
          <span className="truncate font-mono text-xs">
            {asset.owner.slice(0, 8)}...{asset.owner.slice(-8)}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
