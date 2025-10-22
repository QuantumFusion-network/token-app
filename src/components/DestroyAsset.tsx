import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWalletContext } from "../hooks/useWalletContext";
import { useTransaction } from "../hooks/useTransaction";
import { destroyAssetBatch } from "../lib/assetOperations";
import { invalidateAssetQueries } from "../lib/queryHelpers";
import { destroyAssetToasts } from "../lib/toastConfigs";
import { getMockFee } from "../utils/mockFees";
import { FeatureErrorBoundary } from "./error-boundaries";
import { AccountDashboard } from "./AccountDashboard";
import { TransactionReview } from "./TransactionReview";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { AlertTriangle, ArrowRight, Trash } from "lucide-react";

export interface DestroyAssetForm {
  assetId: string;
}

function DestroyAssetInner() {
  const { selectedAccount } = useWalletContext();
  const queryClient = useQueryClient();
  const { executeTransaction } =
    useTransaction<DestroyAssetForm>(destroyAssetToasts);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [formData, setFormData] = useState<DestroyAssetForm>({
    assetId: "",
  });

  const destroyAssetMutation = useMutation({
    mutationFn: async (data: DestroyAssetForm) => {
      if (!selectedAccount) throw new Error("No account selected");

      const observable = destroyAssetBatch(data, selectedAccount);
      await executeTransaction("destroyAsset", observable, data);
    },
    onSuccess: async () => {
      await invalidateAssetQueries(queryClient);
      // Reset form
      setFormData({
        assetId: "",
      });
      setShowConfirmation(false);
    },
    onError: (error) => {
      console.error("Failed to destroy asset:", error);
      setShowConfirmation(false);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirmDestroy = () => {
    destroyAssetMutation.mutate(formData);
  };

  if (!selectedAccount) {
    return <div>Please connect your wallet first</div>;
  }

  const reviewData = {
    assetId: formData.assetId,
  };

  if (showConfirmation) {
    return (
      <div>
        <AccountDashboard />
        <div className="max-w-3xl mx-auto">
          <Card className="border-destructive/30 shadow-lg">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="w-5 h-5" />
                <CardTitle>Confirm Asset Destruction</CardTitle>
              </div>
              <CardDescription className="text-red-700">
                This action cannot be undone
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 font-medium mb-2">
                  You are about to permanently destroy:
                </p>
                <div className="bg-white rounded p-3 mb-2">
                  <p>
                    <strong>Asset ID:</strong> {formData.assetId}
                  </p>
                </div>
                <p className="text-red-700 text-sm">
                  <strong>This action cannot be undone.</strong> The asset will
                  be permanently removed from the blockchain, and all associated
                  tokens will be destroyed.
                </p>
              </div>

              {destroyAssetMutation.isError && (
                <div className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                  {destroyAssetMutation.error?.message}
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  onClick={handleConfirmDestroy}
                  disabled={destroyAssetMutation.isPending}
                  className="flex-1"
                >
                  {destroyAssetMutation.isPending
                    ? "Destroying Asset..."
                    : "Yes, Destroy Asset"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowConfirmation(false)}
                  disabled={destroyAssetMutation.isPending}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AccountDashboard />
      <div className="flex items-center gap-4 mb-4">
        <Trash className="w-5 h-5 text-destructive" />
        <h1 className="text-2xl font-bold text-foreground leading-tight">
          Destroy Asset
        </h1>
      </div>
      <Card className="shadow-lg gap-8">
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid: Form Fields + Review */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form Fields - 2 columns */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                    <p className="text-destructive text-sm">
                      <strong>Warning:</strong> Asset destruction is permanent
                      and irreversible. The chain will reject the transaction if
                      you don't own the asset.
                    </p>
                  </div>
                </div>

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
                    min="0"
                    placeholder="Enter asset ID to destroy"
                    className="h-12"
                  />
                </div>

                {destroyAssetMutation.isError && (
                  <div className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                    {destroyAssetMutation.error?.message}
                  </div>
                )}
              </div>

              {/* Review Column - 1 column */}
              <div className="lg:col-span-1">
                <TransactionReview data={reviewData} variant="destructive" />
              </div>
            </div>

            {/* Fee + CTA Section */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-4 pt-4 border-t border-destructive/20">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Estimated Fee:
                </span>
                <Badge
                  variant="outline"
                  className="text-base font-semibold font-mono border-destructive/30"
                >
                  {getMockFee("destroyAsset")} QF
                </Badge>
              </div>
              <Button
                type="submit"
                variant="destructive"
                size="lg"
                disabled={!formData.assetId || destroyAssetMutation.isPending}
                className="w-full lg:w-auto"
              >
                {destroyAssetMutation.isPending
                  ? "Destroying Asset..."
                  : "Destroy Asset"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export function DestroyAsset() {
  return (
    <FeatureErrorBoundary featureName="Destroy Asset">
      <DestroyAssetInner />
    </FeatureErrorBoundary>
  );
}
