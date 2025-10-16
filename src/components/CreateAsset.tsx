import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/chain";
import { useWalletContext } from "../hooks/useWalletContext";
import { useTransaction } from "../hooks/useTransaction";
import { createAssetBatch } from "../lib/assetOperations";
import { invalidateAssetQueries } from "../lib/queryHelpers";
import { createAssetToasts } from "../lib/toastConfigs";
import { FeatureErrorBoundary } from "./error-boundaries";

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
        disabled={createAssetMutation.isPending}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {createAssetMutation.isPending ? "Creating..." : "Create Asset"}
      </button>

      {createAssetMutation.isError && (
        <div className="text-red-500 text-sm">
          Error: {createAssetMutation.error?.message}
        </div>
      )}
    </form>
  );
}

export function CreateAsset() {
  return (
    <FeatureErrorBoundary featureName="Create Asset">
      <CreateAssetInner />
    </FeatureErrorBoundary>
  );
}
