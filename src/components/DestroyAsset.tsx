import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWalletContext } from "../hooks/useWalletContext";
import { useTransactionStatus } from "../hooks/useTransactionStatus";
import { useTransactionToasts } from "../hooks/useTransactionToasts";
import { destroyAssetBatch } from "../lib/assetOperations";
import { invalidateAssetQueries } from "../lib/queryHelpers";
import { destroyAssetToastConfig } from "../lib/toastConfigs";

interface DestroyAssetForm {
  assetId: string;
}

export function DestroyAsset() {
  const { selectedAccount } = useWalletContext();
  const queryClient = useQueryClient();
  const { status, trackTransaction, reset } = useTransactionStatus();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const { setTransactionDetails } = useTransactionToasts(status, destroyAssetToastConfig);

  const [formData, setFormData] = useState<DestroyAssetForm>({
    assetId: "",
  });

  const destroyAssetMutation = useMutation({
    mutationFn: async (data: DestroyAssetForm) => {
      if (!selectedAccount) throw new Error("No account selected");

      setTransactionDetails({
        assetId: data.assetId,
      });

      const obs = destroyAssetBatch(data, selectedAccount);
      await trackTransaction(obs);
    },
    onSuccess: async () => {
      invalidateAssetQueries(queryClient);
      // Reset form
      setFormData({
        assetId: "",
      });
      setShowConfirmation(false);
      // Delay reset to allow useEffect to process finalized status
      setTimeout(() => reset(), 500);
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
    reset(); // Reset status before starting new transaction
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
            <p><strong>Asset ID:</strong> {formData.assetId}</p>
          </div>
          <p className="text-red-700 text-sm">
            <strong>This action cannot be undone.</strong> The asset will be permanently removed
            from the blockchain, and all associated tokens will be destroyed.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleConfirmDestroy}
            disabled={destroyAssetMutation.isPending || status.status !== "idle"}
            className="flex-1 bg-red-500 text-white py-2 px-4 rounded disabled:opacity-50 hover:bg-red-600"
          >
            {status.status === "signing" && "Signing..."}
            {status.status === "broadcasting" && "Broadcasting..."}
            {status.status === "inBlock" && "In Block..."}
            {status.status === "finalized" && "Finalizing..."}
            {status.status === "error" && "Error - Try Again"}
            {status.status === "idle" &&
              (destroyAssetMutation.isPending ? "Destroying..." : "Yes, Destroy Asset")}
          </button>

          <button
            onClick={() => setShowConfirmation(false)}
            disabled={destroyAssetMutation.isPending || status.status !== "idle"}
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
          <strong>Warning:</strong> Asset destruction is permanent and irreversible.
          The chain will reject the transaction if you don't own the asset.
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
        disabled={
          !formData.assetId ||
          destroyAssetMutation.isPending ||
          status.status !== "idle"
        }
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