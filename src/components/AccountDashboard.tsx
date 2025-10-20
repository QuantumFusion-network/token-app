import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/chain";
import { useWalletContext } from "../hooks/useWalletContext";
import { formatUnits } from "../utils/format";
import { ComponentErrorBoundary } from "./error-boundaries";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Wallet, ExternalLink } from "lucide-react";

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

  if (!selectedAccount) {
    return null;
  }

  const nativeBalance = accountInfo?.data.free || 0n;
  const formattedNativeBalance = formatUnits(nativeBalance, 12); // QF Network uses 12 decimals

  // Truncate balance to 3 decimal places with ellipsis
  const truncatedBalance = (() => {
    const parts = formattedNativeBalance.split(".");
    if (parts.length === 1) return formattedNativeBalance;
    return `${parts[0]}.${parts[1].slice(0, 4)}...`;
  })();

  const faucetUrl = "https://faucet.qfnetwork.xyz"; // Replace with actual testnet faucet URL

  return (
    <div className="mb-8">
      {/* Single Stretched Summary Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/20 border-primary/20 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {/* Left Section - Balance */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <Wallet className="w-6 h-6 text-primary" />
                <div>
                  <div className="text-sm font-medium text-primary mb-1">
                    QF Balance
                  </div>
                  {isLoadingAccount ? (
                    <div className="h-8 bg-primary/20 animate-pulse rounded w-48" />
                  ) : (
                    <div className="text-2xl font-bold text-foreground font-mono">
                      {truncatedBalance}{" "}
                      <span className="text-lg text-primary">QF</span>
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
              onClick={() => window.open(faucetUrl, "_blank")}
            >
              <ExternalLink className="w-4 h-4" />
              Get Tokens
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AccountDashboard() {
  return (
    <ComponentErrorBoundary
      componentName="Account Dashboard"
      fallback={
        <div className="text-red-500 text-sm">Dashboard unavailable</div>
      }
    >
      <AccountDashboardInner />
    </ComponentErrorBoundary>
  );
}
