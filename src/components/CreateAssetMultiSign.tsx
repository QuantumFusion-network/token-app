import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/chain";
import { useWalletContext } from "../hooks/useWalletContext";
import { useTransaction } from "../hooks/useTransaction";
import { invalidateAssetQueries } from "../lib/queryHelpers";
import { createAssetToasts } from "../lib/toastConfigs";

interface CreateAssetForm {
  assetId: string;
  minBalance: string;
  name: string;
  symbol: string;
  decimals: string;
  initialMintAmount: string;
}

const getNextAssetId = async () => {
  return await api.query.Assets.NextAssetId.getValue();
};

const initialAssetId = await getNextAssetId();

if (!initialAssetId) throw new Error("No next asset id");

const initialFormData = {
  assetId: initialAssetId.toString(),
  minBalance: "1",
  name: "",
  symbol: "",
  decimals: "12",
  initialMintAmount: "",
};

export function CreateAsset() {
  const { selectedAccount } = useWalletContext();
  const queryClient = useQueryClient();
  const { executeTransaction } = useTransaction<CreateAssetForm>(createAssetToasts);

  const [formData, setFormData] = useState<CreateAssetForm>(initialFormData);

  const [currentStep, setCurrentStep] = useState<
    "idle" | "creating" | "metadata" | "minting" | "completed"
  >("idle");

  const createAssetMutation = useMutation({
    mutationFn: async (data: CreateAssetForm) => {
      if (!selectedAccount) throw new Error("No account selected");

      // Use the same batch approach as the main CreateAsset component
      const { createAssetBatch } = await import("../lib/assetOperations");
      const observable = createAssetBatch(data, selectedAccount);
      await executeTransaction('createAssetBatch', observable, data);
    },
    onSuccess: async () => {
      invalidateAssetQueries(queryClient);

      const nextAssetId = await getNextAssetId();
      if (!nextAssetId) throw new Error("No next asset id");

      // Reset form
      setFormData({
        ...initialFormData,
        assetId: nextAssetId.toString(),
      });

      setCurrentStep("idle");
    },
    onError: (error) => {
      console.error("Failed to create asset:", error);
      setCurrentStep("idle");
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setCurrentStep("creating");
    createAssetMutation.mutate(formData);
  };

  if (!selectedAccount) {
    return <div>Please connect your wallet first</div>;
  }

  const getButtonText = () => {
    if (createAssetMutation.isPending) {
      return "Creating Asset...";
    }
    return "Create Asset";
  };

  const isDisabled = createAssetMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2 className="text-xl font-bold">Create New Asset</h2>

      {currentStep !== "idle" && (
        <div className="bg-blue-50 border border-blue-200 rounded p-3">
          <div className="text-sm font-medium text-blue-800">
            {currentStep === "creating" && "Step 1/3: Creating Asset"}
            {currentStep === "metadata" && "Step 2/3: Setting Metadata"}
            {currentStep === "minting" && "Step 3/3: Minting Tokens"}
            {currentStep === "completed" && "✓ Asset Created Successfully"}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Each step requires a separate transaction signature
          </div>
        </div>
      )}

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
        disabled={isDisabled}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {getButtonText()}
      </button>

      {createAssetMutation.isError && (
        <div className="text-red-500 text-sm">
          Error: {createAssetMutation.error?.message}
        </div>
      )}
    </form>
  );
}
