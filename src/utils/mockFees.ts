type TransactionType = "createAsset" | "mintTokens" | "transferTokens" | "destroyAsset";

/**
 * Returns mock fee estimation for different transaction types
 * TODO: Replace with actual fee estimation from polkadot-api
 *
 * @param type - The type of transaction
 * @returns Fee amount in QF tokens (as formatted string)
 */
export const getMockFee = (type: TransactionType): string => {
  const fees: Record<TransactionType, string> = {
    createAsset: "0.0145",
    mintTokens: "0.0089",
    transferTokens: "0.0067",
    destroyAsset: "0.0234",
  };

  return fees[type];
};
