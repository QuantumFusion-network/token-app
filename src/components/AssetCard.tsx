import type { Binary } from "polkadot-api";
import { formatUnits } from "../utils/format";
import {
  Card,
  CardContent,
} from "./ui/card";
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
import {
  MoreVertical,
  Coins,
  Send,
  Trash2
} from "lucide-react";

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

  const accentColor = isOwner
    ? "text-primary"
    : isAdmin
    ? "text-accent-foreground"
    : "text-muted-foreground";

  const dotColor = isOwner
    ? "bg-primary"
    : isAdmin
    ? "bg-accent"
    : "bg-muted-foreground";

  return (
    <Card className={`${cardColors} shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden`}>
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-20 h-20 opacity-10">
        <div className={`w-full h-full rounded-bl-full ${isOwner ? 'bg-primary' : isAdmin ? 'bg-accent' : 'bg-muted-foreground'}`}></div>
      </div>

      <CardContent className="p-6 relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-2 h-2 ${dotColor} rounded-full`}></div>
              <h3 className="text-xl font-bold text-foreground">{metadata.name.asText()}</h3>
              {canManage && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-7 h-7 p-0 opacity-60 hover:opacity-100">
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

            <div className="flex items-center gap-2 mb-1">
              <span className={`text-sm font-medium ${accentColor}`}>
                #{id} • {metadata.symbol.asText()}
              </span>
              {isOwner && <Badge className="text-xs bg-primary/20 text-primary border-primary/30">Owner</Badge>}
              {isAdmin && !isOwner && <Badge variant="secondary" className="text-xs">Admin</Badge>}
            </div>

            <div className={`text-xs ${accentColor}/70`}>
              {asset.accounts} holders
            </div>
          </div>
        </div>

        {/* Your Balance - Prominent Display */}
        {selectedAccount && (
          <div className={`${isOwner ? 'bg-primary/5' : isAdmin ? 'bg-accent/5' : 'bg-muted/50'} rounded-xl p-4 mb-4`}>
            <div className={`text-sm font-medium ${accentColor} mb-1`}>Your Balance</div>
            <div className="text-2xl font-bold text-foreground font-mono">
              <AssetBalance assetId={id} />
            </div>
          </div>
        )}

        {/* Asset Stats */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Supply</span>
            <span className="font-mono text-sm font-medium text-foreground">
              {formattedSupply} {metadata.symbol.asText()}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Decimals</span>
            <span className="text-sm font-medium text-foreground">{metadata.decimals}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Sufficient</span>
            <Badge
              variant={asset.is_sufficient ? "default" : "destructive"}
              className="text-xs"
            >
              {asset.is_sufficient ? "Yes" : "No"}
            </Badge>
          </div>
        </div>

        {/* Owner Info Footer */}
        <div className={`mt-4 pt-3 border-t ${isOwner ? 'border-primary/20' : isAdmin ? 'border-accent/20' : 'border-border'} space-y-1`}>
          <div className="text-xs text-muted-foreground">
            <span className="text-muted-foreground/60">Owner:</span> {asset.owner.slice(0, 6)}...{asset.owner.slice(-4)}
          </div>
          {asset.owner !== asset.admin && (
            <div className="text-xs text-muted-foreground">
              <span className="text-muted-foreground/60">Admin:</span> {asset.admin.slice(0, 6)}...{asset.admin.slice(-4)}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
