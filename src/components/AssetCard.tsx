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
import {
  MoreVertical,
  Coins,
  Send,
  Trash2,
  TrendingUp,
  Users,
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
    ? "bg-gradient-to-br from-primary/8 via-primary/5 to-transparent border-primary/30"
    : isAdmin
    ? "bg-gradient-to-br from-accent/8 via-accent/5 to-transparent border-accent/30"
    : "bg-card/50 border-border/60";

  const borderGlow = isOwner
    ? "shadow-[0_0_0_1px_oklch(var(--primary)/0.2)]"
    : isAdmin
    ? "shadow-[0_0_0_1px_oklch(var(--accent)/0.2)]"
    : "";

  return (
    <Card
      className={`${cardColors} ${borderGlow} shadow-lg transition-shadow duration-200 relative backdrop-blur-sm`}
    >
      <CardContent className="p-8 relative">
        {/* Header with Asset Name and Symbol */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex justify-between items-baseline gap-3 mb-1">
              <h3 className="text-2xl font-bold text-foreground leading-tight">
                {metadata.name.asText()}
              </h3>

              <Badge
                variant="outline"
                className="text-xs font-mono justify-self-end"
              >
                ID #{id}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              {metadata.is_frozen && (
                <div className="flex items-center gap-1.5 text-destructive">
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
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
                  className="w-8 h-8 p-0 opacity-60 hover:opacity-100 transition-opacity"
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

        {/* Key Metrics - Side by Side Stat Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Total Supply Card */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border/40">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Total Supply
              </span>
            </div>
            <div className="text-xl font-bold text-foreground font-mono">
              {`${formattedSupply} ${metadata.symbol.asText()}`}
            </div>
          </div>

          {/* Holders Card */}
          <div className="bg-muted/30 rounded-lg p-4 border border-border/40">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-accent" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Holders
              </span>
            </div>
            <div className="text-xl font-bold text-foreground font-mono">
              {`${asset.accounts} ${
                asset.accounts === 1 ? "Account" : "Accounts"
              }`}
            </div>
          </div>
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
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-foreground">
                    {asset.owner.slice(0, 6)}...{asset.owner.slice(-4)}
                  </span>
                  {isOwner && (
                    <Badge className="text-xs px-2 py-0.5 bg-primary/20 text-primary border-primary/30">
                      You
                    </Badge>
                  )}
                </div>
              </div>
              {asset.owner !== asset.admin && (
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Admin</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-foreground">
                      {asset.admin.slice(0, 6)}...{asset.admin.slice(-4)}
                    </span>
                    {isAdmin && (
                      <Badge className="text-xs px-2 py-0.5 bg-accent/20 text-accent border-accent/30">
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
          <div className="space-y-2">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Decimals</span>
              <span className="text-sm font-medium text-foreground">
                {metadata.decimals}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Sufficient</span>
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    asset.is_sufficient
                      ? "bg-green-500"
                      : "bg-muted-foreground/40"
                  }`}
                />
                <span className="text-sm font-medium text-foreground">
                  {asset.is_sufficient ? "Yes" : "No"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
