import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWalletContext } from "../hooks/useWalletContext";
import { useTransaction } from "../hooks/useTransaction";
import { destroyAssetBatch } from "../lib/assetOperations";
import { invalidateAssetQueries } from "../lib/queryHelpers";
import { destroyAssetToasts } from "../lib/toastConfigs";
import { FeatureErrorBoundary } from "./error-boundaries";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { AlertTriangle } from "lucide-react";

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
      invalidateAssetQueries(queryClient);
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

  if (showConfirmation) {
    return (
      <div className="max-w-2xl">
        <Card className="border-red-200">
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
                <strong>This action cannot be undone.</strong> The asset will be
                permanently removed from the blockchain, and all associated tokens
                will be destroyed.
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
    );
  }

  return (
    <div className="max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Destroy Asset
          </CardTitle>
          <CardDescription>
            Permanently remove an asset from the blockchain (owner only)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-destructive-foreground text-sm">
                  <strong>Warning:</strong> Asset destruction is permanent and
                  irreversible. The chain will reject the transaction if you don't own
                  the asset.
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
              />
            </div>

            {destroyAssetMutation.isError && (
              <div className="text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 p-3 rounded-md">
                {destroyAssetMutation.error?.message}
              </div>
            )}

            <Button
              type="submit"
              variant="destructive"
              disabled={!formData.assetId || destroyAssetMutation.isPending}
              className="w-full"
            >
              Destroy Asset
            </Button>
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
