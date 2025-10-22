import { useState, type FormEvent } from "react";
import { api } from "../lib/chain";
import { useWalletContext } from "../hooks/useWalletContext";
import { useAssetMutation } from "../hooks/useAssetMutation";
import { useFee } from "../hooks/useFee";
import { createAssetBatch } from "../lib/assetOperations";
import { invalidateAssetQueries } from "../lib/queryHelpers";
import { createAssetToasts } from "../lib/toastConfigs";
import { FeatureErrorBoundary } from "./error-boundaries";
import { AccountDashboard } from "./AccountDashboard";
import { TransactionReview } from "./TransactionReview";
import { FeeDisplay } from "./FeeDisplay";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { ArrowRight, Plus } from "lucide-react";

export interface CreateAssetParams {
  assetId: string;
  minBalance: string;
  name: string;
  symbol: string;
  decimals: string;
  initialMintAmount: string;
}

const getNextAssetId = async () => {
  const id = await api.query.Assets.NextAssetId.getValue();
  if (!id) throw new Error("No next asset id");

  return id;
};

const initialAssetId = await getNextAssetId();

const initialFormData = {
  assetId: initialAssetId.toString(),
  minBalance: "1",
  name: "",
  symbol: "",
  decimals: "12",
  initialMintAmount: "",
};

function CreateAssetInner() {
  const { selectedAccount } = useWalletContext();
  const [formData, setFormData] = useState<CreateAssetParams>(initialFormData);

  const { mutation: createAssetMutation, transaction } =
    useAssetMutation<CreateAssetParams>({
      params: formData,
      operationFn: (params) =>
        createAssetBatch(params, selectedAccount?.address ?? ""),
      toastConfig: createAssetToasts,
      transactionKey: "createAsset",
      isValid: (params) =>
        params.assetId !== "" &&
        !isNaN(parseInt(params.assetId)) &&
        params.name !== "" &&
        params.symbol !== "" &&
        params.decimals !== "" &&
        !isNaN(parseInt(params.decimals)) &&
        params.minBalance !== "" &&
        parseFloat(params.minBalance) > 0,
      onSuccess: async (queryClient) => {
        await invalidateAssetQueries(queryClient);
        const nextAssetId = await getNextAssetId();

        setFormData({
          ...initialFormData,
          assetId: nextAssetId.toString(),
        });
      },
    });

  const feeState = useFee(transaction, selectedAccount?.address);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createAssetMutation.mutate();
  };

  if (!selectedAccount) {
    return <div>Please connect your wallet first</div>;
  }

  const reviewData = {
    name: formData.name,
    symbol: formData.symbol,
    decimals: formData.decimals,
    minBalance: formData.minBalance,
    ...(formData.initialMintAmount && {
      initialMint: formData.initialMintAmount,
    }),
  };

  return (
    <div>
      <AccountDashboard />
      <div className="flex items-center gap-4 mb-4 text-left">
        <Plus className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-bold text-foreground leading-tight">
          Create New Asset
        </h1>
      </div>

      <Card className="shadow-lg gap-8">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid: Form Fields + Review */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Fields - 2 columns */}
              <div className="lg:col-span-2 space-y-4">
                {/* Basic Token Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Token Name</Label>
                    <Input
                      id="name"
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                      maxLength={50}
                      placeholder="My Token"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="symbol">Token Symbol</Label>
                    <Input
                      id="symbol"
                      type="text"
                      value={formData.symbol}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          symbol: e.target.value.toUpperCase(),
                        }))
                      }
                      required
                      maxLength={10}
                      placeholder="MTK"
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Token Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="decimals">Decimals</Label>
                    <Input
                      id="decimals"
                      type="number"
                      value={formData.decimals}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          decimals: e.target.value,
                        }))
                      }
                      min="0"
                      max="18"
                      className="h-12"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="minBalance">
                      Minimum Balance (in tokens)
                    </Label>
                    <Input
                      id="minBalance"
                      type="number"
                      value={formData.minBalance}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          minBalance: e.target.value,
                        }))
                      }
                      min="0.000000000001"
                      step="0.000000000001"
                      className="h-12"
                    />
                  </div>
                </div>

                {/* Initial Mint */}
                <div className="space-y-2">
                  <Label htmlFor="initialMint">
                    Initial Mint Amount (optional)
                  </Label>
                  <Input
                    id="initialMint"
                    type="number"
                    value={formData.initialMintAmount}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        initialMintAmount: e.target.value,
                      }))
                    }
                    min="0"
                    step="0.000000000001"
                    placeholder="Amount to mint to your account"
                    className="h-12"
                  />
                  <p className="text-xs text-muted-foreground">
                    Tokens will be minted to your connected account (
                    {selectedAccount?.address.slice(0, 8)}...)
                  </p>
                </div>

                {createAssetMutation.isError && (
                  <div className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                    {createAssetMutation.error?.message}
                  </div>
                )}
              </div>

              {/* Review Column - 1 column */}
              <div className="lg:col-span-1">
                <TransactionReview data={reviewData} />
              </div>
            </div>

            {/* Fee + CTA Section */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-4 border-t">
              <FeeDisplay {...feeState} />
              <Button
                type="submit"
                disabled={createAssetMutation.isPending}
                size="lg"
                className="w-full lg:w-auto ml-auto"
              >
                {createAssetMutation.isPending
                  ? "Creating Asset..."
                  : "Create Asset"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function CreateAsset() {
  return (
    <FeatureErrorBoundary featureName="Create Asset">
      <CreateAssetInner />
    </FeatureErrorBoundary>
  );
}
