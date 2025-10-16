import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWalletContext } from "../hooks/useWalletContext";
import { useTransaction } from "../hooks/useTransaction";
import { transferTokens } from "../lib/assetOperations";
import { invalidateBalanceQueries } from "../lib/queryHelpers";
import { transferTokensToasts } from "../lib/toastConfigs";
import { FeatureErrorBoundary } from "./error-boundaries";

export interface TransferForm {
  assetId: string;
  recipient: string;
  amount: string;
  decimals: number;
}

const initialFormData: TransferForm = {
  assetId: "",
  recipient: "",
  amount: "",
  decimals: 12,
};

function TransferTokensInner() {
  const { selectedAccount } = useWalletContext();
  const queryClient = useQueryClient();
  const { executeTransaction } = useTransaction<TransferForm>(transferTokensToasts);
  const [formData, setFormData] = useState<TransferForm>(initialFormData);

  const transferMutation = useMutation({
    mutationFn: async (data: TransferForm) => {
      if (!selectedAccount) throw new Error("No account selected");

      const observable = transferTokens(data, selectedAccount);
      await executeTransaction('transferTokens', observable, data);
    },
    onSuccess: (_result, variables) => {
      // Invalidate balances for both sender and recipient
      invalidateBalanceQueries(queryClient, parseInt(variables.assetId), [
        selectedAccount?.address,
        variables.recipient,
      ]);

      setFormData({ ...initialFormData });
    },
    onError: (error) => {
      console.error("Failed to transfer tokens:", error);
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    transferMutation.mutate(formData);
  };

  if (!selectedAccount) {
    return <div>Please connect your wallet to transfer tokens</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <h2 className="text-xl font-bold">Transfer Tokens</h2>

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
        <label className="block text-sm font-medium mb-1">
          Amount to Transfer
        </label>
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
        disabled={transferMutation.isPending}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {transferMutation.isPending ? "Transferring..." : "Transfer Tokens"}
      </button>

      {transferMutation.isError && (
        <div className="text-red-500 text-sm">
          Error: {transferMutation.error?.message}
        </div>
      )}
    </form>
  );
}

export function TransferTokens() {
  return (
    <FeatureErrorBoundary featureName="Transfer Tokens">
      <TransferTokensInner />
    </FeatureErrorBoundary>
  );
}
