import { formatUnits } from "../utils/format";

interface AssetCardProps {
  id: number;
  name: string;
  symbol: string;
  decimals: number;
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

export function AssetCard({
  id,
  name,
  symbol,
  decimals,
  asset,
}: AssetCardProps) {
  const formattedSupply = formatUnits(asset.supply, decimals);

  return (
    <div className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{name}</h3>
          <p className="text-gray-600">
            #{id} • {symbol}
          </p>
        </div>
        <div className="text-right text-sm text-gray-500">
          {asset.accounts} holders
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Total Supply:</span>
          <span className="font-mono">
            {formattedSupply} {symbol}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Decimals:</span>
          <span>{decimals}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Sufficient:</span>
          <span
            className={asset.is_sufficient ? "text-green-600" : "text-red-600"}
          >
            {asset.is_sufficient ? "Yes" : "No"}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t text-xs text-gray-500">
        <div>
          Owner: {asset.owner.slice(0, 8)}...{asset.owner.slice(-8)}
        </div>
        <div>
          Admin: {asset.admin.slice(0, 8)}...{asset.admin.slice(-8)}
        </div>
      </div>
    </div>
  );
}
