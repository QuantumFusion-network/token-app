import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/polkadot";
import { formatUnits } from "../utils/format";
import { useWallet } from "../hooks/useWallet";

interface AssetBalanceProps {
  assetId: number;
  accountId?: string;
}

export function AssetBalance({ assetId, accountId }: AssetBalanceProps) {
  const { selectedAccount } = useWallet();
  const targetAccount = accountId || selectedAccount?.address;

  const {
    data: balance,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["assetBalance", assetId, targetAccount],
    queryFn: async () => {
      if (!targetAccount) return null;
      return await api.query.Assets.Account.getValues([
        [assetId, targetAccount],
      ]);
    },
    enabled: !!targetAccount,
    refetchInterval: 10_000, // Update every 10 seconds
  });

  const { data: metadata } = useQuery({
    queryKey: ["assetMetadata", assetId],
    queryFn: () => api.query.Assets.Metadata.getValue(assetId),
    staleTime: 5 * 60 * 1000, // Metadata rarely changes
  });

  if (isLoading) {
    return <div className="animate-pulse h-4 bg-gray-200 rounded w-24" />;
  }

  if (error || !targetAccount) {
    return <div className="text-red-500 text-sm">Error loading balance</div>;
  }

  if (!balance) {
    return <div className="text-gray-500">0.000</div>;
  }

  const symbol = metadata
    ? new TextDecoder().decode(metadata.symbol.asBytes())
    : `Asset ${assetId}`;

  const decimals = metadata?.decimals ?? 12;
  const formattedBalance = formatUnits(balance[0]?.balance || 0n, decimals);

  return (
    <div className="font-mono">
      {formattedBalance} {symbol}
    </div>
  );
}
