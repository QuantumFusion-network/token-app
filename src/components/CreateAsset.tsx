import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Binary } from "polkadot-api";
import { MultiAddress } from "@polkadot-api/descriptors";
import { api } from "../lib/polkadot";
import { useWallet } from "../hooks/useWallet";

interface CreateAssetForm {
  assetId: string;
  minBalance: string;
  name: string;
  symbol: string;
  decimals: string;
}

export function CreateAsset() {
  const { selectedAccount } = useWallet();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<CreateAssetForm>({
    assetId: "",
    minBalance: "1",
    name: "",
    symbol: "",
    decimals: "12",
  });

  const createAssetMutation = useMutation({
    mutationFn: async (data: CreateAssetForm) => {
      if (!selectedAccount) throw new Error("No account selected");

      const assetId = parseInt(data.assetId);
      const minBalance = BigInt(data.minBalance) * 10n ** BigInt(data.decimals);

      // Create the asset
      const createTx = api.tx.Assets.create({
        id: assetId,
        admin: MultiAddress.Id(selectedAccount.address),
        min_balance: minBalance,
      });

      await createTx.signAndSubmit(selectedAccount.polkadotSigner);

      // Set metadata
      const metadataTx = api.tx.Assets.set_metadata({
        id: assetId,
        name: Binary.fromText(data.name),
        symbol: Binary.fromText(data.symbol),
        decimals: parseInt(data.decimals),
      });

      return await metadataTx.signAndSubmit(selectedAccount.polkadotSigner);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assetMetadata"] });
      // Reset form
      setFormData({
        assetId: "",
        minBalance: "1",
        name: "",
        symbol: "",
        decimals: "12",
      });
    },
    onError: (error) => {
      console.error("Failed to create asset:", error);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    createAssetMutation.mutate(formData);
  };

  if (!selectedAccount) {
    return <div>Please connect your wallet first</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2 className="text-xl font-bold">Create New Asset</h2>

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
          className="w-full border rounded px-3 py-2"
          required
          min="1"
        />
      </div>

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
