import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/chain";
import { useWalletContext } from "../hooks/useWalletContext";
import { formatUnits } from "../utils/format";
import { ComponentErrorBoundary } from "./error-boundaries";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { User, Wallet, Coins } from "lucide-react";

function AccountDashboardInner() {
  const { selectedAccount } = useWalletContext();

  // Get account's native token balance
  const { data: accountInfo, isLoading: isLoadingAccount } = useQuery({
    queryKey: ["accountInfo", selectedAccount?.address],
    queryFn: async () => {
      if (!selectedAccount?.address) return null;
      return await api.query.System.Account.getValue(selectedAccount.address);
    },
    enabled: !!selectedAccount?.address,
    refetchInterval: 10_000,
  });

  // Get all assets to count how many the user holds
  const { data: assetBalances, isLoading: isLoadingBalances } = useQuery({
    queryKey: ["userAssetBalances", selectedAccount?.address],
    queryFn: async () => {
      if (!selectedAccount?.address) return [];

      // Get all asset account entries for this user
      const entries = await api.query.Assets.Account.getEntries({
        at: "best",
      });

      // Filter for entries where the account matches the selected account
      return entries.filter(entry => {
        const [assetId, accountAddress] = entry.keyArgs;
        return accountAddress === selectedAccount.address && entry.value.balance > 0n;
      });
    },
    enabled: !!selectedAccount?.address,
    refetchInterval: 30_000,
  });

  if (!selectedAccount) {
    return null;
  }

  const nativeBalance = accountInfo?.data.free || 0n;
  const formattedNativeBalance = formatUnits(nativeBalance, 12); // QF Network uses 12 decimals
  const assetCount = assetBalances?.length || 0;

  return (
    <div className="mb-8">
      {/* Bento Grid Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Main Balance Card - Larger */}
        <Card className="md:col-span-2 lg:col-span-2 bg-gradient-to-br from-primary/10 to-primary/20 border-primary/20 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm font-medium text-primary">QF Balance</span>
              </div>
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-2">
              {isLoadingAccount ? (
                <div className="h-12 bg-primary/20 animate-pulse rounded-lg w-48" />
              ) : (
                <div className="text-4xl font-bold text-foreground font-mono">
                  {formattedNativeBalance} <span className="text-2xl text-primary">QF</span>
                </div>
              )}
              <p className="text-sm text-primary/80">Native token balance</p>
            </div>
          </CardContent>
        </Card>

        {/* Asset Holdings Card */}
        <Card className="bg-gradient-to-br from-accent/10 to-accent/20 border-accent/20 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-sm font-medium text-accent-foreground">Portfolio</span>
              </div>
              <Coins className="w-5 h-5 text-accent-foreground" />
            </div>
            <div className="space-y-2">
              {isLoadingBalances ? (
                <div className="h-10 bg-accent/20 animate-pulse rounded-lg w-16" />
              ) : (
                <div className="text-3xl font-bold text-foreground">
                  {assetCount}
                </div>
              )}
              <p className="text-sm text-accent-foreground/80">Asset holdings</p>
              {assetCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  Active
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Info Card */}
        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/20 border-secondary/20 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-secondary-foreground rounded-full"></div>
                <span className="text-sm font-medium text-secondary-foreground">Account</span>
              </div>
              <User className="w-5 h-5 text-secondary-foreground" />
            </div>
            <div className="space-y-2">
              <div className="text-lg font-bold text-foreground">
                {selectedAccount.name || "Unnamed"}
              </div>
              <div className="font-mono text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                {selectedAccount.address.slice(0, 8)}...{selectedAccount.address.slice(-8)}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function AccountDashboard() {
  return (
    <ComponentErrorBoundary
      componentName="Account Dashboard"
      fallback={<div className="text-red-500 text-sm">Dashboard unavailable</div>}
    >
      <AccountDashboardInner />
    </ComponentErrorBoundary>
  );
}