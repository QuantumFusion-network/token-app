import { useState, useEffect, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MultiAddress } from "@polkadot-api/descriptors";
import { toast } from "sonner";
import { api } from "../lib/polkadot";
import { useWalletContext } from "../hooks/useWalletContext";
import { useTransactionStatus } from "../hooks/useTransactionStatus";
import { Binary } from "polkadot-api";

interface CreateAssetForm {
  assetId: string;
  minBalance: string;
  name: string;
  symbol: string;
  decimals: string;
}
const nextAssetId = await api.query.Assets.NextAssetId.getValue();
export function CreateAsset() {
  const { selectedAccount } = useWalletContext();
  const queryClient = useQueryClient();
  const { status, trackTransaction, reset } = useTransactionStatus();
  const [formData, setFormData] = useState<CreateAssetForm>({
    assetId: nextAssetId?.toString() || "",
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

      const createCall = api.tx.Assets.create({
        id: assetId,
        admin: MultiAddress.Id(selectedAccount.address),
        min_balance: minBalance,
      }).decodedCall;

      const metadataCall = api.tx.Assets.set_metadata({
        id: assetId,
        name: Binary.fromText(data.name),
        symbol: Binary.fromText(data.symbol),
        decimals: parseInt(data.decimals),
      }).decodedCall;

      const batch = api.tx.Utility.batch_all({
        calls: [createCall, metadataCall],
      });

      const obs = batch.signSubmitAndWatch(selectedAccount.polkadotSigner);

      trackTransaction(obs);
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["assets"] });
      queryClient.invalidateQueries({ queryKey: ["assetMetadata"] });
      // Reset form
      setFormData({
        assetId:
          (await api.query.Assets.NextAssetId.getValue())?.toString() || "",
        minBalance: "1",
        name: "",
        symbol: "",
        decimals: "12",
      });
      reset(); // Reset transaction status
    },
    onError: (error) => {
      console.error("Failed to create asset:", error);
      // Toast error will be handled by transaction status tracking
    },
  });

  // Toast notifications based on transaction status
  useEffect(() => {
    switch (status.status) {
      case "signing":
        toast.info("Please sign the transaction in your wallet");
        break;
      case "broadcasting":
        toast.info(
          `Transaction submitted. Hash: ${status.txHash?.slice(0, 16)}...`,
          { duration: 8000 }
        );
        break;
      case "inBlock":
        toast.info("Transaction included in block", { duration: 8000 });
        break;
      case "finalized":
        toast.success("Asset created successfully!", { duration: 8000 });
        break;
      case "error":
        toast.error(`Transaction failed: ${status.error?.message}`, {
          duration: 8000,
        });
        break;
    }
  }, [status]);

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
