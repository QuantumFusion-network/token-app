import { useState, type FormEvent } from "react";
import { useWalletContext } from "../hooks/useWalletContext";
import { useAssetMutation } from "../hooks/useAssetMutation";
import { useFee } from "../hooks/useFee";
import { transferTokens } from "../lib/assetOperations";
import { invalidateBalanceQueries } from "../lib/queryHelpers";
import { transferTokensToasts } from "../lib/toastConfigs";
import { FeatureErrorBoundary } from "./error-boundaries";
import { AccountDashboard } from "./AccountDashboard";
import { TransactionReview } from "./TransactionReview";
import { FeeDisplay } from "./FeeDisplay";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";
import { Send, ArrowRight } from "lucide-react";

export interface TransferParams {
  assetId: string;
  recipient: string;
  amount: string;
  decimals: number;
}

const initialFormData: TransferParams = {
  assetId: "",
  recipient: "",
  amount: "",
  decimals: 12,
};

function TransferTokensInner() {
  const { selectedAccount } = useWalletContext();
  const [formData, setFormData] = useState<TransferParams>(initialFormData);

  const { mutation: transferMutation, transaction } =
    useAssetMutation<TransferParams>({
      params: formData,
      operationFn: transferTokens,
      toastConfig: transferTokensToasts,
      transactionKey: "transferTokens",
      isValid: (params) =>
        params.assetId !== "" &&
        !isNaN(parseInt(params.assetId)) &&
        params.recipient !== "" &&
        params.amount !== "" &&
        parseFloat(params.amount) > 0,
      onSuccess: (queryClient) => {
        // Invalidate balances for both sender and recipient
        invalidateBalanceQueries(queryClient, parseInt(formData.assetId), [
          selectedAccount?.address,
          formData.recipient,
        ]);

        setFormData({ ...initialFormData });
      },
    });

  const feeState = useFee(transaction, selectedAccount?.address);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    transferMutation.mutate();
  };

  if (!selectedAccount) {
    return <div>Please connect your wallet to transfer tokens</div>;
  }

  const reviewData = {
    assetId: formData.assetId,
    from: selectedAccount.address,
    to: formData.recipient,
    amount: formData.amount,
  };

  return (
    <div>
      <AccountDashboard />
      <div className="flex items-center gap-4 mb-4">
        <Send className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-bold text-foreground leading-tight">
          Transfer Tokens
        </h1>
      </div>
      <Card className="shadow-lg gap-8">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid: Form Fields + Review */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Fields - 2 columns */}
              <div className="lg:col-span-2 space-y-4">
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
                    className="h-12"
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
                    className="font-mono text-sm h-12"
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
                    className="h-12"
                  />
                </div>

                {transferMutation.isError && (
                  <div className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                    {transferMutation.error?.message}
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
                disabled={transferMutation.isPending}
                size="lg"
                className="w-full lg:w-auto ml-auto"
              >
                {transferMutation.isPending
                  ? "Transferring Tokens..."
                  : "Transfer Tokens"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
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
