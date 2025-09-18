import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/polkadot";
import { useWalletContext } from "../hooks/useWalletContext";
import { useTransactionStatus } from "../hooks/useTransactionStatus";
import { useTransactionToasts } from "../hooks/useTransactionToasts";
import { invalidateAssetQueries } from "../lib/queryHelpers";
import { parseUnits } from "../utils/format";
import { MultiAddress } from "@polkadot-api/descriptors";
import { Binary } from "polkadot-api";

let id = 5;

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

  console.log("nextAssetId", nextAssetId);

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
    // assetId: nextAssetId?.toString() || "",
    assetId: String(id),
    minBalance: "1",
    name: "",
    symbol: "",
    decimals: "12",
    initialMintAmount: "",
  });

  const [currentStep, setCurrentStep] = useState<
    "idle" | "creating" | "metadata" | "minting" | "completed"
  >("idle");

  const createAssetMutation = useMutation({
    mutationFn: async (data: CreateAssetForm) => {
      if (!selectedAccount) throw new Error("No account selected");

      const assetId = parseInt(data.assetId);
      const minBalance = BigInt(data.minBalance) * 10n ** BigInt(data.decimals);

      setTransactionDetails({
        assetId: data.assetId,
        initialMintAmount: data.initialMintAmount,
      });

      // Step 1: Create asset
      setCurrentStep("creating");
      const createTx = api.tx.Assets.create({
        id: assetId,
        admin: MultiAddress.Id(selectedAccount.address),
        min_balance: minBalance,
      });

      const createObs = createTx.signSubmitAndWatch(
        selectedAccount.polkadotSigner
      );
      await trackTransaction(createObs);

      // Step 2: Set metadata
      setCurrentStep("metadata");
      reset(); // Reset status for next transaction
      const metadataTx = api.tx.Assets.set_metadata({
        id: assetId,
        name: Binary.fromText(data.name),
        symbol: Binary.fromText(data.symbol),
        decimals: parseInt(data.decimals),
      });

      const metadataObs = metadataTx.signSubmitAndWatch(
        selectedAccount.polkadotSigner
      );
      await trackTransaction(metadataObs);

      // Step 3: Mint tokens (if requested)
      if (data.initialMintAmount && parseFloat(data.initialMintAmount) > 0) {
        setCurrentStep("minting");
        reset(); // Reset status for next transaction
        const mintAmount = parseUnits(
          data.initialMintAmount,
          parseInt(data.decimals)
        );
        const mintTx = api.tx.Assets.mint({
          id: assetId,
          beneficiary: MultiAddress.Id(selectedAccount.address),
          amount: mintAmount,
        });

        const mintObs = mintTx.signSubmitAndWatch(
          selectedAccount.polkadotSigner
        );
        await trackTransaction(mintObs);
      }

      setCurrentStep("completed");
    },
    onSuccess: async () => {
      invalidateAssetQueries(queryClient);
      // Reset form
      setFormData({
        assetId: String(id++),
        // (await api.query.Assets.NextAssetId.getValue())?.toString() || "",
        minBalance: "1",
        name: "",
        symbol: "",
        decimals: "12",
        initialMintAmount: "",
      });
      // Delay reset to allow useEffect to process finalized status
      setTimeout(() => {
        reset();
        setCurrentStep("idle");
      }, 500);
    },
    onError: (error) => {
      console.error("Failed to create asset:", error);
      setCurrentStep("idle");
      // Toast error will be handled by transaction status tracking
    },
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    reset(); // Reset status before starting new transaction
    setCurrentStep("creating");
    createAssetMutation.mutate(formData);
  };

  if (!selectedAccount) {
    return <div>Please connect your wallet first</div>;
  }

  const getButtonText = () => {
    if (currentStep === "creating") {
      if (status.status === "signing") return "Sign Asset Creation...";
      if (status.status === "broadcasting") return "Creating Asset...";
      if (status.status === "inBlock") return "Asset Creation In Block...";
      if (status.status === "finalized") return "Asset Created, Next: Metadata";
      return "Creating Asset...";
    }

    if (currentStep === "metadata") {
      if (status.status === "signing") return "Sign Metadata Transaction...";
      if (status.status === "broadcasting") return "Setting Metadata...";
      if (status.status === "inBlock") return "Metadata In Block...";
      if (status.status === "finalized")
        return formData.initialMintAmount &&
          parseFloat(formData.initialMintAmount) > 0
          ? "Metadata Set, Next: Mint"
          : "Metadata Set, Completing...";
      return "Setting Metadata...";
    }

    if (currentStep === "minting") {
      if (status.status === "signing") return "Sign Mint Transaction...";
      if (status.status === "broadcasting") return "Minting Tokens...";
      if (status.status === "inBlock") return "Mint In Block...";
      if (status.status === "finalized") return "Tokens Minted, Completing...";
      return "Minting Tokens...";
    }

    if (status.status === "error") return "Error - Try Again";

    return createAssetMutation.isPending ? "Starting..." : "Create Asset";
  };

  const isDisabled = createAssetMutation.isPending || currentStep !== "idle";

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
