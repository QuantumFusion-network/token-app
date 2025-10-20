import type { Binary } from "polkadot-api";
import { formatUnits } from "../utils/format";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { AssetBalance } from "./AssetBalance";
import { useWalletContext } from "../hooks/useWalletContext";
import { MoreVertical, Coins, Send, Trash2 } from "lucide-react";

interface AssetCardProps {
  id: number;
  metadata: {
    symbol: Binary;
    name: Binary;
    decimals: number;
    deposit: bigint;
    is_frozen: boolean;
  };
  asset: {
    supply: bigint;
    owner: string;
    issuer: string;
    admin: string;
    is_sufficient: boolean;
    accounts: number;
    sufficients: number;
  };
}

export function AssetCard({ id, metadata, asset }: AssetCardProps) {
  const { selectedAccount } = useWalletContext();
  const formattedSupply = formatUnits(asset.supply, metadata.decimals);

  const isOwner = selectedAccount?.address === asset.owner;
  const isAdmin = selectedAccount?.address === asset.admin;
  const canManage = isOwner || isAdmin;

  const handleMint = () => {
    // This would typically trigger a modal or navigate to mint page
    console.log("Mint tokens for asset", id);
  };

  const handleTransfer = () => {
    // This would typically trigger a modal or navigate to transfer page
    console.log("Transfer tokens for asset", id);
  };

  const handleDestroy = () => {
    // This would typically trigger a modal or navigate to destroy page
    console.log("Destroy asset", id);
  };

  // Dynamic styling based on ownership using semantic theme colors
  const cardColors = isOwner
    ? "bg-gradient-to-br from-primary/10 to-primary/20 border-primary/20"
    : isAdmin
    ? "bg-gradient-to-br from-accent/10 to-accent/20 border-accent/20"
    : "bg-gradient-to-br from-muted/20 to-muted/40 border-border";

  return (
    <Card
      className={`${cardColors} shadow-lg hover:shadow-xl transition-all duration-200 relative`}
    >
      <CardContent className="p-8 relative">
        {/* Header with Asset Name */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h3 className="text-3xl font-bold text-foreground leading-tight mb-2">
              {`#${id}  ${metadata.name.asText()}`}
            </h3>
          </div>

          {/* Actions Menu */}
          {canManage && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-8 h-8 p-0 opacity-60 hover:opacity-100"
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleMint}>
                  <Coins className="w-4 h-4 mr-2" />
                  Mint Tokens
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleTransfer}>
                  <Send className="w-4 h-4 mr-2" />
                  Transfer
                </DropdownMenuItem>
                {isOwner && (
                  <DropdownMenuItem
                    onClick={handleDestroy}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Destroy Asset
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* YOUR DATA Section */}
        {selectedAccount && (
          <div className="mb-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">
                  Your Balance
                </span>
                <span className="text-sm font-mono font-semibold text-foreground">
                  <AssetBalance assetId={id} />
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-sm text-muted-foreground">Owner</span>
                <span className="text-xs font-mono text-foreground">
                  {asset.owner.slice(0, 6)}...{asset.owner.slice(-4)}
                </span>
              </div>
              {asset.owner !== asset.admin && (
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Admin</span>
                  <span className="text-xs font-mono text-foreground">
                    {asset.admin.slice(0, 6)}...{asset.admin.slice(-4)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ASSET METADATA Section */}
        <div>
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">
                Total Supply
              </span>
              <span className="text-sm font-mono font-semibold text-foreground">
                {formattedSupply} {metadata.symbol.asText()}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Decimals</span>
              <span className="text-sm font-medium text-foreground">
                {metadata.decimals}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Holders</span>
              <span className="text-sm font-medium text-foreground">
                {asset.accounts}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Sufficient</span>
              <Badge
                variant={asset.is_sufficient ? "default" : "destructive"}
                className="text-xs"
              >
                {asset.is_sufficient ? "Yes" : "No"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
