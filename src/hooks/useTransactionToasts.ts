import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface TransactionDetails {
  amount?: string;
  recipient?: string;
  assetId?: string;
}

interface TransactionStatus {
  status: "idle" | "signing" | "broadcasting" | "inBlock" | "finalized" | "error";
  txHash?: string;
  error?: { message: string };
}

interface ToastConfig {
  signing?: string;
  broadcasting?: (hash: string) => string;
  inBlock?: string;
  finalized: string | ((details: TransactionDetails | null) => string);
  error?: (error: string) => string;
}

export function useTransactionToasts(status: TransactionStatus, config: ToastConfig) {
  const transactionDetailsRef = useRef<TransactionDetails | null>(null);

  useEffect(() => {
    switch (status.status) {
      case "signing":
        if (config.signing) {
          toast.info(config.signing);
        }
        break;
      case "broadcasting":
        if (config.broadcasting && status.txHash) {
          toast.info(config.broadcasting(status.txHash), { duration: 8000 });
        }
        break;
      case "inBlock":
        if (config.inBlock) {
          toast.info(config.inBlock, { duration: 8000 });
        }
        break;
      case "finalized": {
        const details = transactionDetailsRef.current;
        const message = typeof config.finalized === "function" 
          ? config.finalized(details)
          : config.finalized;
        toast.success(message, { duration: 8000 });
        break;
      }
      case "error":
        if (status.error) {
          const message = config.error 
            ? config.error(status.error.message)
            : `Transaction failed: ${status.error.message}`;
          toast.error(message, { duration: 8000 });
        }
        break;
    }
  }, [status, config]);

  const setTransactionDetails = (details: TransactionDetails) => {
    transactionDetailsRef.current = details;
  };

  const clearTransactionDetails = () => {
    transactionDetailsRef.current = null;
  };

  return {
    setTransactionDetails,
    clearTransactionDetails,
  };
}