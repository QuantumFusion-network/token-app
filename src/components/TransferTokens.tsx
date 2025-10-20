import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWalletContext } from "../hooks/useWalletContext";
import { useTransaction } from "../hooks/useTransaction";
import { transferTokens } from "../lib/assetOperations";
import { invalidateBalanceQueries } from "../lib/queryHelpers";
import { transferTokensToasts } from "../lib/toastConfigs";
import { FeatureErrorBoundary } from "./error-boundaries";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export interface TransferForm {
  assetId: string;
  recipient: string;
  amount: string;
  decimals: number;
}

const initialFormData: TransferForm = {
  assetId: "",
  recipient: "",
  amount: "",
  decimals: 12,
};

function TransferTokensInner() {
  const { selectedAccount } = useWalletContext();
  const queryClient = useQueryClient();
  const { executeTransaction } =
    useTransaction<TransferForm>(transferTokensToasts);
  const [formData, setFormData] = useState<TransferForm>(initialFormData);

  const transferMutation = useMutation({
    mutationFn: async (data: TransferForm) => {
      if (!selectedAccount) throw new Error("No account selected");

      const observable = transferTokens(data, selectedAccount);
      await executeTransaction("transferTokens", observable, data);
    },
    onSuccess: (_result, variables) => {
      // Invalidate balances for both sender and recipient
      invalidateBalanceQueries(queryClient, parseInt(variables.assetId), [
        selectedAccount?.address,
        variables.recipient,
      ]);

      setFormData({ ...initialFormData });
    },
    onError: (error) => {
      console.error("Failed to transfer tokens:", error);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    transferMutation.mutate(formData);
  };

  if (!selectedAccount) {
    return <div>Please connect your wallet to transfer tokens</div>;
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Transfer Tokens</CardTitle>
          <CardDescription>
            Send tokens from your account to another address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              <Label htmlFor="amount">Amount to Transfer</Label>
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

            {transferMutation.isError && (
              <div className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                {transferMutation.error?.message}
              </div>
            )}

            <Button
              type="submit"
              disabled={transferMutation.isPending}
              className="w-full"
            >
              {transferMutation.isPending ? "Transferring Tokens..." : "Transfer Tokens"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function TransferTokens() {
  return (
    <FeatureErrorBoundary featureName="Transfer Tokens">
      <TransferTokensInner />
    </FeatureErrorBoundary>
  );
}
