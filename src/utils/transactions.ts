// import { api } from "../lib/polkadot";
// import type { PolkadotSigner } from "polkadot-api";

// /**
//  * Utility to batch multiple transactions
//  */
// export async function batchTransactions(
//   transactions: Array<{ tx: any; signer: PolkadotSigner }>,
//   signer: PolkadotSigner
// ) {
//   const calls = transactions.map(({ tx }) => tx.decodedCall);

//   const batchTx = api.tx.Utility.batch_all({
//     calls,
//   });

//   return await batchTx.signAndSubmit(signer);
// }

// /**
//  * Estimate transaction fees
//  */
// export async function estimateFee(tx: any, signer: PolkadotSigner) {
//   // This is a simplified example - actual fee estimation would need
//   // to be implemented based on the specific transaction
//   return {
//     partialFee: 0n,
//     weight: { refTime: 0n, proofSize: 0n },
//   };
// }
