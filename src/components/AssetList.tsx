import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/chain";
import { FeatureErrorBoundary } from "./error-boundaries";
import { AssetCard } from "./AssetCard";
import { AccountDashboard } from "./AccountDashboard";
import { Button } from "./ui/button";
import { useWalletContext } from "../hooks/useWalletContext";
import { Filter, Coins } from "lucide-react";

type FilterType = "all" | "owned" | "held";

function AssetListInner() {
  const { selectedAccount } = useWalletContext();
  const [filter, setFilter] = useState<FilterType>("all");

  // Query asset entries with reactive updates
  const {
    data: assets,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      // Get all asset entries
      const entries = await api.query.Assets.Asset.getEntries({
        at: "best",
      });

      return Promise.all(
        entries.map(async (entry) => {
          const assetId = entry.keyArgs[0];
          const asset = entry.value;

          // Get metadata for each asset
          const metadata = await api.query.Assets.Metadata.getValue(assetId);

          return {
            id: assetId,
            asset,
            metadata,
          };
        })
      );
    },
    refetchInterval: 30_000, // Refetch every 30 seconds
  });

  // Query user's asset balances for filtering
  const { data: userBalances } = useQuery({
    queryKey: ["userAssetBalances", selectedAccount?.address],
    queryFn: async () => {
      if (!selectedAccount?.address) return [];

      const entries = await api.query.Assets.Account.getEntries({
        at: "best",
      });

      return entries
        .filter(entry => {
          const [assetId, accountAddress] = entry.keyArgs;
          return accountAddress === selectedAccount.address && entry.value.balance > 0n;
        })
        .map(entry => entry.keyArgs[0]); // Return asset IDs
    },
    enabled: !!selectedAccount?.address,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div>
        <AccountDashboard />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="h-72 bg-gradient-to-br from-muted/20 to-muted/40 animate-pulse rounded-xl shadow-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-center py-8">
        Error loading assets: {error.message}
      </div>
    );
  }

  if (!assets || assets.length === 0) {
    return (
      <div>
        <AccountDashboard />
        <div className="text-gray-500 text-center py-8">
          No assets found. Create your first asset!
        </div>
      </div>
    );
  }

  // Filter assets based on selected filter
  const filteredAssets = assets.filter(asset => {
    if (filter === "all") return true;
    if (!selectedAccount) return false;

    if (filter === "owned") {
      return asset.asset.owner === selectedAccount.address ||
             asset.asset.admin === selectedAccount.address;
    }

    if (filter === "held") {
      return userBalances?.includes(asset.id) || false;
    }

    return true;
  });

  const filterOptions = [
    { value: "all" as const, label: "All Assets", count: assets.length },
    { value: "owned" as const, label: "My Assets", count: assets.filter(asset => selectedAccount && (asset.asset.owner === selectedAccount.address || asset.asset.admin === selectedAccount.address)).length },
    { value: "held" as const, label: "Assets I Hold", count: userBalances?.length || 0 }
  ];

  return (
    <div>
      <AccountDashboard />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">
          {filter === "all" && `Assets (${filteredAssets.length})`}
          {filter === "owned" && `My Assets (${filteredAssets.length})`}
          {filter === "held" && `Assets I Hold (${filteredAssets.length})`}
        </h2>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          <div className="flex gap-2">
            {filterOptions.map((option) => (
              <Button
                key={option.value}
                variant={filter === option.value ? "default" : "outline"}
                size="sm"
                onClick={() => setFilter(option.value)}
                className={`text-sm transition-all ${
                  filter === option.value
                    ? "shadow-lg"
                    : "hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                {option.label}
                {option.count > 0 && (
                  <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                    filter === option.value
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {option.count}
                  </span>
                )}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
            <Coins className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {filter === "owned" && "No assets owned"}
            {filter === "held" && "No assets held"}
            {filter === "all" && "No assets found"}
          </h3>
          <p className="text-muted-foreground">
            {filter === "owned" && "You don't own any assets yet. Create your first asset!"}
            {filter === "held" && "You don't hold any assets yet. Get some tokens first!"}
            {filter === "all" && "No assets found on the network."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAssets.map((asset) => (
            <AssetCard key={asset.id} {...asset} />
          ))}
        </div>
      )}
    </div>
  );
}

export function AssetList() {
  return (
    <FeatureErrorBoundary featureName="Assets">
      <AssetListInner />
    </FeatureErrorBoundary>
  );
}
