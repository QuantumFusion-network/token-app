import { useState } from "react";
import type { TxBroadcastEvent } from "polkadot-api";

export interface TransactionStatus {
  status:
    | "idle"
    | "signing"
    | "broadcasting"
    | "inBlock"
    | "finalized"
    | "error";
  txHash?: string;
  blockHash?: string;
  error?: Error;
  events?: unknown[];
}

export function useTransactionStatus() {
  const [status, setStatus] = useState<TransactionStatus>({ status: "idle" });

  const trackTransaction = (observable: {
    subscribe: (handlers: {
      next: (event: TxBroadcastEvent) => void;
      error: (error: Error) => void;
    }) => { unsubscribe: () => void };
  }) => {
    setStatus({ status: "signing" });

    return new Promise((resolve, reject) => {
      const subscription = observable.subscribe({
        next: (event: TxBroadcastEvent) => {
          console.log("Transaction status", event);
          switch (event.type) {
            case "signed":
              setStatus({ status: "signing" });
              break;
            case "broadcasted":
              setStatus({
                status: "broadcasting",
                txHash: event.txHash,
              });
              break;
            case "txBestBlocksState":
              setStatus({
                status: "inBlock",
                txHash: event.txHash,
              });
              console.log("Transaction in block", event);
              break;

            case "finalized":
              setStatus({
                status: "finalized",
                txHash: event.txHash,
                blockHash: event.block.hash,
                events: event.events,
              });
              console.log("Transaction finalized", event);
              resolve(event);
              break;
          }
        },
        error: (error: Error) => {
          setStatus({ status: "error", error });
          reject(error);
        },
      });

      // Cleanup function
      return () => subscription.unsubscribe();
    });
  };

  const reset = () => setStatus({ status: "idle" });

  return { status, trackTransaction, reset };
}
