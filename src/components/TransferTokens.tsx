import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWalletContext } from "../hooks/useWalletContext";
import { useTransactionStatus } from "../hooks/useTransactionStatus";
import { useTransactionToasts } from "../hooks/useTransactionToasts";
import { transferTokens } from "../lib/assetOperations";
import { invalidateBalanceQueries } from "../lib/queryHelpers";
import { transferTokensToastConfig } from "../lib/toastConfigs";

interface TransferForm {
  assetId: string;
  recipient: string;
  amount: string;
  decimals: number;
}

export function TransferTokens() {
  const { selectedAccount } = useWalletContext();
  const queryClient = useQueryClient();
  const { status, trackTransaction, reset } = useTransactionStatus();
  
  const { setTransactionDetails } = useTransactionToasts(status, transferTokensToastConfig);
  const [formData, setFormData] = useState<TransferForm>({
    assetId: "",
    recipient: "",
    amount: "",
    decimals: 12,
  });

  const transferMutation = useMutation({
    mutationFn: async (data: TransferForm) => {
      if (!selectedAccount) throw new Error("No account selected");

      setTransactionDetails({
        amount: data.amount,
        recipient: data.recipient,
        assetId: data.assetId,
      });

      const observable = transferTokens(data, selectedAccount);
      await trackTransaction(observable);
    },
    onSuccess: (_result, variables) => {
      // Invalidate balances for both sender and recipient
      invalidateBalanceQueries(queryClient, parseInt(variables.assetId), [
        selectedAccount?.address,
        variables.recipient,
      ]);

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
      console.error("Failed to transfer tokens:", error);
      // Toast error will be handled by transaction status tracking
    },
  });


  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    reset(); // Reset status before starting new transaction
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
        disabled={transferMutation.isPending || status.status !== "idle"}
        className="w-full bg-blue-500 text-white py-2 px-4 rounded disabled:opacity-50"
      >
        {status.status === "signing" && "Signing..."}
        {status.status === "broadcasting" && "Broadcasting..."}
        {status.status === "inBlock" && "In Block..."}
        {status.status === "finalized" && "Finalizing..."}
        {status.status === "error" && "Error - Try Again"}
        {status.status === "idle" &&
          (transferMutation.isPending ? "Transferring..." : "Transfer Tokens")}
      </button>

      {transferMutation.isError && (
        <div className="text-red-500 text-sm">
          Error: {transferMutation.error?.message}
        </div>
      )}
    </form>
  );
}
