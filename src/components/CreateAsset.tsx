import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/chain";
import { useWalletContext } from "../hooks/useWalletContext";
import { useTransaction } from "../hooks/useTransaction";
import { createAssetBatch } from "../lib/assetOperations";
import { invalidateAssetQueries } from "../lib/queryHelpers";
import { createAssetToasts } from "../lib/toastConfigs";
import { FeatureErrorBoundary } from "./error-boundaries";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export interface CreateAssetForm {
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
  console.log("id", id);

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
  const queryClient = useQueryClient();
  const { executeTransaction } =
    useTransaction<CreateAssetForm>(createAssetToasts);
  console.log("initialFormData", initialFormData);

  const [formData, setFormData] = useState<CreateAssetForm>(initialFormData);

  const createAssetMutation = useMutation({
    mutationFn: async (data: CreateAssetForm) => {
      if (!selectedAccount) throw new Error("No account selected");

      const observable = createAssetBatch(data, selectedAccount);
      await executeTransaction("createAsset", observable, data);
    },

    onSuccess: async () => {
      invalidateAssetQueries(queryClient);
      const nextAssetId = await getNextAssetId();

      setFormData({
        ...initialFormData,
        assetId: nextAssetId.toString(),
      });
    },

    onError: (error) => {
      console.error("Failed to create asset:", error);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("formData", formData);

    createAssetMutation.mutate(formData);
  };

  if (!selectedAccount) {
    return <div>Please connect your wallet first</div>;
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Create New Asset</CardTitle>
          <CardDescription>
            Create a new token asset on the QF Network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minBalance">Minimum Balance (in tokens)</Label>
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
                />
              </div>
            </div>

            {/* Initial Mint */}
            <div className="space-y-2">
              <Label htmlFor="initialMint">Initial Mint Amount (optional)</Label>
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
              />
              <p className="text-xs text-muted-foreground">
                Tokens will be minted to your connected account ({selectedAccount?.address.slice(0, 8)}...)
              </p>
            </div>

            {createAssetMutation.isError && (
              <div className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                {createAssetMutation.error?.message}
              </div>
            )}

            <Button
              type="submit"
              disabled={createAssetMutation.isPending}
              className="w-full"
            >
              {createAssetMutation.isPending ? "Creating Asset..." : "Create Asset"}
            </Button>
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
