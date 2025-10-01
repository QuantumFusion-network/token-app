interface ToastConfig {
  signing: string;
  broadcasting: (hash: string) => string;
  inBlock: string;
  finalized: (details?: any) => string;
  error: (error: string) => string;
}

export const createAssetToastConfig: ToastConfig = {
  signing: "Please sign the transaction in your wallet",
  broadcasting: (hash: string) =>
    `Transaction submitted. \n    Hash: ${hash.slice(0, 16)}...`,
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
};

export const mintTokensToastConfig: ToastConfig = {
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
};

export const transferTokensToastConfig: ToastConfig = {
  signing: "Please sign the transfer transaction in your wallet",
  broadcasting: (hash: string) => `Transfer transaction submitted. Hash: ${hash.slice(0, 16)}...`,
  inBlock: "Transfer transaction included in block",
  finalized: (details) => {
    return details
      ? `${details.amount} tokens transferred successfully to ${details.recipient?.slice(0, 8)}... for Asset ID ${details.assetId}!`
      : "Tokens transferred successfully!";
  },
  error: (error: string) => `Transfer transaction failed: ${error}`,
};

export const destroyAssetToastConfig: ToastConfig = {
  signing: "Please sign the asset destruction transaction in your wallet",
  broadcasting: (hash: string) =>
    `Asset destruction submitted.\n    Hash: ${hash.slice(0, 16)}...`,
  inBlock: "Asset destruction in progress...",
  finalized: (details) => `Asset ${details?.assetId} destroyed successfully!`,
  error: (error: string) => `Asset destruction failed: ${error}`,
};