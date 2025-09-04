import type { Binary } from "polkadot-api";
import { formatUnits } from "../utils/format";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "./ui/card";

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
  const formattedSupply = formatUnits(asset.supply, metadata.decimals);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{metadata.name.asText()}</CardTitle>
            <CardDescription>
              #{id} • {metadata.symbol.asText()}
            </CardDescription>
          </div>
          <div className="text-right text-sm text-gray-500">
            {asset.accounts} holders
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Total Supply:</span>
            <span className="font-mono">
              {formattedSupply} {metadata.symbol.asText()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-600">Decimals:</span>
            <span>{metadata.decimals}</span>
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
      </CardContent>

      <CardFooter className="border-t text-xs text-gray-500">
        <div className="w-full space-y-1">
          <div>
            Owner: {asset.owner.slice(0, 8)}...{asset.owner.slice(-8)}
          </div>
          <div>
            Admin: {asset.admin.slice(0, 8)}...{asset.admin.slice(-8)}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
