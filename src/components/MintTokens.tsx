import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWalletContext } from "../hooks/useWalletContext";
import { useTransaction } from "../hooks/useTransaction";
import { mintTokens } from "../lib/assetOperations";
import {
  invalidateBalanceQueries,
  invalidateAssetQueries,
} from "../lib/queryHelpers";
import { mintTokensToasts } from "../lib/toastConfigs";
import { FeatureErrorBoundary } from "./error-boundaries";

export interface MintForm {
  assetId: string;
  recipient: string;
  amount: string;
  decimals: number;
}

function MintTokensInner() {
  const { selectedAccount } = useWalletContext();
  const queryClient = useQueryClient();
  const { executeTransaction } = useTransaction<MintForm>(mintTokensToasts);

  const [formData, setFormData] = useState<MintForm>({
    assetId: "",
    recipient: "",
    amount: "",
    decimals: 12,
  });

  const mintMutation = useMutation({
    mutationFn: async (data: MintForm) => {
      if (!selectedAccount) throw new Error("No account selected");

      const observable = mintTokens(data, selectedAccount);
      await executeTransaction('mintTokens', observable, data);
    },
    onSuccess: (_result, variables) => {
      invalidateBalanceQueries(queryClient, parseInt(variables.assetId), [
        variables.recipient,
      ]);
      invalidateAssetQueries(queryClient);

      // Reset form
      setFormData({
        assetId: "",
        recipient: "",
        amount: "",
        decimals: 12,
      });
    },
    onError: (error) => {
      console.error("Failed to mint tokens:", error);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
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
        disabled={mintMutation.isPending}
        className="w-full bg-green-500 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {mintMutation.isPending ? "Minting..." : "Mint Tokens"}
      </button>

      {mintMutation.isError && (
        <div className="text-red-500 text-sm">
          Error: {mintMutation.error?.message}
        </div>
      )}
    </form>
  );
}

export function MintTokens() {
  return (
    <FeatureErrorBoundary featureName="Mint Tokens">
      <MintTokensInner />
    </FeatureErrorBoundary>
  );
}
