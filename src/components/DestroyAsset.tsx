import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWalletContext } from "../hooks/useWalletContext";
import { useTransaction } from "../hooks/useTransaction";
import { destroyAssetBatch } from "../lib/assetOperations";
import { invalidateAssetQueries } from "../lib/queryHelpers";
import { destroyAssetToasts } from "../lib/toastConfigs";
import { FeatureErrorBoundary } from "./error-boundaries";

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
      <div className="max-w-md">
        <h2 className="text-xl font-bold mb-4 text-red-600">
          ⚠️ Confirm Asset Destruction
        </h2>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 font-medium mb-2">
            You are about to permanently destroy:
          </p>
          <div className="bg-white rounded p-3 mb-3">
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

        <div className="flex space-x-3">
          <button
            onClick={handleConfirmDestroy}
            disabled={destroyAssetMutation.isPending}
            className="flex-1 bg-red-500 text-white py-2 px-4 rounded disabled:opacity-50 hover:bg-red-600"
          >
            {destroyAssetMutation.isPending
              ? "Destroying..."
              : "Yes, Destroy Asset"}
          </button>

          <button
            onClick={() => setShowConfirmation(false)}
            disabled={destroyAssetMutation.isPending}
            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded disabled:opacity-50 hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>

        {destroyAssetMutation.isError && (
          <div className="text-red-500 text-sm mt-4">
            Error: {destroyAssetMutation.error?.message}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2 className="text-xl font-bold">Destroy Asset</h2>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-yellow-800 text-sm">
          <strong>Warning:</strong> Asset destruction is permanent and
          irreversible. The chain will reject the transaction if you don't own
          the asset.
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Asset ID</label>
        <input
          type="number"
          value={formData.assetId}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              assetId: e.target.value,
            }))
          }
          className="w-full border border-gray-300 rounded px-3 py-2"
          required
          min="0"
          placeholder="Enter asset ID to destroy"
        />
      </div>

      <button
        type="submit"
        disabled={!formData.assetId || destroyAssetMutation.isPending}
        className="w-full bg-red-500 text-white py-2 px-4 rounded disabled:opacity-50 hover:bg-red-600"
      >
        Destroy Asset
      </button>

      {destroyAssetMutation.isError && (
        <div className="text-red-500 text-sm">
          Error: {destroyAssetMutation.error?.message}
        </div>
      )}
    </form>
  );
}

export function DestroyAsset() {
  return (
    <FeatureErrorBoundary featureName="Destroy Asset">
      <DestroyAssetInner />
    </FeatureErrorBoundary>
  );
}
