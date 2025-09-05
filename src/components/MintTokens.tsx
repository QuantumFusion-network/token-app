import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MultiAddress } from "@polkadot-api/descriptors";
import { api } from "../lib/polkadot";
import { useWalletContext } from "../hooks/useWalletContext";
import { useTransactionStatus } from "../hooks/useTransactionStatus";
import { useTransactionToasts } from "../hooks/useTransactionToasts";
import { parseUnits } from "../utils/format";

interface MintForm {
  assetId: string;
  recipient: string;
  amount: string;
  decimals: number;
}

export function MintTokens() {
  const { selectedAccount } = useWalletContext();
  const queryClient = useQueryClient();
  const { status, trackTransaction, reset } = useTransactionStatus();
  console.log("Mint tokens status", status);
  const { setTransactionDetails } = useTransactionToasts(status, {
    signing: "Please sign the mint transaction in your wallet",
    broadcasting: (hash: string) =>
      `Mint transaction submitted. Hash: ${hash.slice(0, 16)}...`,
    inBlock: "Mint transaction included in block",
    finalized: (details) => {
      return details
        ? `${
            details.amount
          } tokens minted successfully to ${details.recipient?.slice(
            0,
            8
          )}... for Asset ID ${details.assetId}!`
        : "Tokens minted successfully!";
    },
    error: (error: string) => `Mint transaction failed: ${error}`,
  });
  const [formData, setFormData] = useState<MintForm>({
    assetId: "",
    recipient: "",
    amount: "",
    decimals: 12,
  });

  const mintMutation = useMutation({
    mutationFn: async (data: MintForm) => {
      if (!selectedAccount) throw new Error("No account selected");

      const assetId = parseInt(data.assetId);
      const amount = parseUnits(data.amount, data.decimals);

      const tx = api.tx.Assets.mint({
        id: assetId,
        beneficiary: MultiAddress.Id(data.recipient),
        amount,
      });

      setTransactionDetails({
        amount: data.amount,
        recipient: data.recipient,
        assetId: data.assetId,
      });

      // Use signSubmitAndWatch for transaction tracking
      const observable = tx.signSubmitAndWatch(selectedAccount.polkadotSigner);

      // Track the transaction through all phases
      await trackTransaction(observable);
    },
    onSuccess: (_result, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: [
          "assetBalance",
          parseInt(variables.assetId),
          variables.recipient,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["assets"],
      });

      // Reset form
      setFormData({
        assetId: "",
        recipient: "",
        amount: "",
        decimals: 12,
      });
      // Delay reset to allow useEffect to process finalized status
      setTimeout(() => reset(), 100);
    },
    onError: (error) => {
      console.error("Failed to mint tokens:", error);
      // Toast error will be handled by transaction status tracking
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    reset(); // Reset status before starting new transaction
    mintMutation.mutate(formData);
  };

  if (!selectedAccount) {
    return <div>Please connect your wallet to mint tokens</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2 className="text-xl font-bold">Mint Tokens</h2>

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
        <label className="block text-sm font-medium mb-1">
          Recipient Address
        </label>
        <input
          type="text"
          value={formData.recipient}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              recipient: e.target.value,
            }))
          }
          className="w-full border rounded px-3 py-2 font-mono text-sm"
          required
          placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Amount to Mint</label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              amount: e.target.value,
            }))
          }
          className="w-full border rounded px-3 py-2"
          required
          min="0"
          step="0.000000000001"
        />
      </div>

      <button
        type="submit"
        disabled={mintMutation.isPending || status.status !== "idle"}
        className="w-full bg-green-500 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {status.status === "signing" && "Signing..."}
        {status.status === "broadcasting" && "Broadcasting..."}
        {status.status === "inBlock" && "In Block..."}
        {status.status === "finalized" && "Finalizing..."}
        {status.status === "error" && "Error - Try Again"}
        {status.status === "idle" &&
          (mintMutation.isPending ? "Minting..." : "Mint Tokens")}
      </button>

      {mintMutation.isError && (
        <div className="text-red-500 text-sm">
          Error: {mintMutation.error?.message}
        </div>
      )}
    </form>
  );
}
