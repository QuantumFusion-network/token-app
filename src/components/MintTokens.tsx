import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWalletContext } from "../hooks/useWalletContext";
import { useTransaction } from "../hooks/useTransaction";
import { mintTokens } from "../lib/assetOperations";
import {
  invalidateBalanceQueries,
  invalidateAssetQueries,
} from "../lib/queryHelpers";
import { mintTokensToasts } from "../lib/toastConfigs";
import { FeatureErrorBoundary } from "./error-boundaries";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export interface MintForm {
  assetId: string;
  recipient: string;
  amount: string;
  decimals: number;
}

const initialFormData = {
  assetId: "",
  recipient: "",
  amount: "",
  decimals: 12,
};

function MintTokensInner() {
  const { selectedAccount } = useWalletContext();
  const queryClient = useQueryClient();
  const { executeTransaction } = useTransaction<MintForm>(mintTokensToasts);

  const [formData, setFormData] = useState<MintForm>(initialFormData);

  const mintMutation = useMutation({
    mutationFn: async (data: MintForm) => {
      if (!selectedAccount) throw new Error("No account selected");

      const observable = mintTokens(data, selectedAccount);
      await executeTransaction("mintTokens", observable, data);
    },
    onSuccess: (_result, variables) => {
      invalidateBalanceQueries(queryClient, parseInt(variables.assetId), [
        variables.recipient,
      ]);
      invalidateAssetQueries(queryClient);

      // Reset form
      setFormData({ ...initialFormData });
    },
    onError: (error) => {
      console.error("Failed to mint tokens:", error);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    mintMutation.mutate(formData);
  };

  if (!selectedAccount) {
    return <div>Please connect your wallet to mint tokens</div>;
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Mint Tokens</CardTitle>
          <CardDescription>
            Mint tokens to any address (owner privileges required)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="assetId">Asset ID</Label>
              <Input
                id="assetId"
                type="number"
                value={formData.assetId}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    assetId: e.target.value,
                  }))
                }
                required
                min="1"
                placeholder="Enter asset ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient Address</Label>
              <Input
                id="recipient"
                type="text"
                value={formData.recipient}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    recipient: e.target.value,
                  }))
                }
                className="font-mono text-sm"
                required
                placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount to Mint</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                required
                min="0"
                step="0.000000000001"
                placeholder="0.0"
              />
            </div>

            {mintMutation.isError && (
              <div className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                {mintMutation.error?.message}
              </div>
            )}

            <Button
              type="submit"
              disabled={mintMutation.isPending}
              className="w-full"
            >
              {mintMutation.isPending ? "Minting Tokens..." : "Mint Tokens"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function MintTokens() {
  return (
    <FeatureErrorBoundary featureName="Mint Tokens">
      <MintTokensInner />
    </FeatureErrorBoundary>
  );
}
