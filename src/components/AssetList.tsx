import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/chain";
import { FeatureErrorBoundary } from "./error-boundaries";
import { AssetCard } from "./AssetCard";

function AssetListInner() {
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

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-48 bg-gray-200 animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        Error loading assets: {error.message}
      </div>
    );
  }

  if (!assets || assets.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No assets found. Create your first asset!
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Assets ({assets.length})</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map((asset) => (
          <AssetCard key={asset.id} {...asset} />
        ))}
      </div>
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
