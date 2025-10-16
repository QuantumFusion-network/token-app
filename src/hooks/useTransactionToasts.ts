import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { useTransactionContext } from '../contexts/TransactionContext';

export function useTransactionToasts() {
  const { transactions } = useTransactionContext();
  const processedStatusRef = useRef<Record<string, string>>({});

  useEffect(() => {
    Object.values(transactions).forEach((transaction) => {
      const { id, status, toastConfig, details } = transaction;

      if (!toastConfig) return;

      // Only show toast if status has changed for this transaction
      const lastProcessedStatus = processedStatusRef.current[id];
      if (lastProcessedStatus === status.status) return;

      // Update the processed status
      processedStatusRef.current[id] = status.status;

      switch (status.status) {
        case 'signing':
          if (toastConfig.signing) {
            toast.info(toastConfig.signing);
          }
          break;

        case 'broadcasting':
          if (toastConfig.broadcasting && status.txHash) {
            toast.info(toastConfig.broadcasting(status.txHash), { duration: 8000 });
          }
          break;

        case 'inBlock':
          if (toastConfig.inBlock) {
            toast.info(toastConfig.inBlock, { duration: 8000 });
          }
          break;

        case 'finalized': {
          const message = typeof toastConfig.finalized === 'function'
            ? toastConfig.finalized(details)
            : toastConfig.finalized;
          toast.success(message, { duration: 8000 });
          break;
        }

        case 'error':
          if (status.error && toastConfig.error) {
            const message = toastConfig.error(status.error.message);
            toast.error(message, { duration: 8000 });
          }
          break;
      }
    });

    // Clean up processed statuses for removed transactions
    const currentTransactionIds = new Set(Object.keys(transactions));
    Object.keys(processedStatusRef.current).forEach(id => {
      if (!currentTransactionIds.has(id)) {
        delete processedStatusRef.current[id];
      }
    });
  }, [transactions]);

  return null;
}