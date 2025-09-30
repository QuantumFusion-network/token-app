import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/qfnetwork";
import { useWalletContext } from "../hooks/useWalletContext";
import { useTransactionStatus } from "../hooks/useTransactionStatus";
import { useTransactionToasts } from "../hooks/useTransactionToasts";
import { createAssetBatch } from "../lib/assetOperations";
import { invalidateAssetQueries } from "../lib/queryHelpers";

interface CreateAssetForm {
  assetId: string;
  minBalance: string;
  name: string;
  symbol: string;
  decimals: string;
  initialMintAmount: string;
}
const nextAssetId = await api.query.Assets.NextAssetId.getValue();
export function CreateAsset() {
  const { selectedAccount } = useWalletContext();
  const queryClient = useQueryClient();
  const { status, trackTransaction, reset } = useTransactionStatus();

  const { setTransactionDetails } = useTransactionToasts(status, {
    signing: "Please sign the transaction in your wallet",
    broadcasting: (hash: string) =>
      `Transaction submitted. 
    Hash: ${hash.slice(0, 16)}...`,
    inBlock: "Transaction included in block",
    finalized: (details) => {
      if (
        details?.initialMintAmount &&
        parseFloat(details.initialMintAmount) > 0
      ) {
        return `${details.initialMintAmount} tokens minted successfully!`;
      }
      return `Asset ${details?.assetId} created successfully!`;
    },
    error: (error: string) => `Transaction failed: ${error}`,
  });

  const [formData, setFormData] = useState<CreateAssetForm>({
    assetId: nextAssetId?.toString() || "",
    minBalance: "1",
    name: "",
    symbol: "",
    decimals: "12",
    initialMintAmount: "",
  });

  const createAssetMutation = useMutation({
    mutationFn: async (data: CreateAssetForm) => {
      if (!selectedAccount) throw new Error("No account selected");

      setTransactionDetails({
        assetId: data.assetId,
        initialMintAmount: data.initialMintAmount,
      });

      const obs = createAssetBatch(data, selectedAccount);
      await trackTransaction(obs);
    },

    onSuccess: async () => {
      invalidateAssetQueries(queryClient);
      // Reset form
      setFormData({
        assetId:
          (await api.query.Assets.NextAssetId.getValue())?.toString() || "",
        minBalance: "1",
        name: "",
        symbol: "",
        decimals: "12",
        initialMintAmount: "",
      });
      // Delay reset to allow useEffect to process finalized status
      setTimeout(() => reset(), 500);
    },
    onError: (error) => {
      console.error("Failed to create asset:", error);
      // Toast error will be handled by transaction status tracking
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    reset(); // Reset status before starting new transaction
    createAssetMutation.mutate(formData);
  };

  if (!selectedAccount) {
    return <div>Please connect your wallet first</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2 className="text-xl font-bold">Create New Asset</h2>

      <div>
        <label className="block text-sm font-medium mb-1">Token Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              name: e.target.value,
            }))
          }
          className="w-full border rounded px-3 py-2"
          required
          maxLength={50}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Token Symbol</label>
        <input
          type="text"
          value={formData.symbol}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              symbol: e.target.value.toUpperCase(),
            }))
          }
          className="w-full border rounded px-3 py-2"
          required
          maxLength={10}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Decimals</label>
        <input
          type="number"
          value={formData.decimals}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              decimals: e.target.value,
            }))
          }
          className="w-full border rounded px-3 py-2"
          min="0"
          max="18"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Minimum Balance (in tokens)
        </label>
        <input
          type="number"
          value={formData.minBalance}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              minBalance: e.target.value,
            }))
          }
          className="w-full border rounded px-3 py-2"
          min="0.000000000001"
          step="0.000000000001"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Initial Mint Amount (optional)
        </label>
        <input
          type="number"
          value={formData.initialMintAmount}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              initialMintAmount: e.target.value,
            }))
          }
          className="w-full border rounded px-3 py-2"
          min="0"
          step="0.000000000001"
          placeholder="Amount to mint to your account"
        />
        <p className="text-xs text-gray-500 mt-1">
          Tokens will be minted to your connected account (
          {selectedAccount?.address.slice(0, 8)}...)
        </p>
      </div>

      <button
        type="submit"
        disabled={createAssetMutation.isPending || status.status !== "idle"}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {status.status === "signing" && "Signing..."}
        {status.status === "broadcasting" && "Broadcasting..."}
        {status.status === "inBlock" && "In Block..."}
        {status.status === "finalized" && "Finalizing..."}
        {status.status === "error" && "Error - Try Again"}
        {status.status === "idle" &&
          (createAssetMutation.isPending ? "Creating..." : "Create Asset")}
      </button>

      {createAssetMutation.isError && (
        <div className="text-red-500 text-sm">
          Error: {createAssetMutation.error?.message}
        </div>
      )}
    </form>
  );
}
