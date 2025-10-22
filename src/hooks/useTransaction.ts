// No React imports needed for React 19
import type { TxBroadcastEvent } from 'polkadot-api'

import { useTransactionContext } from '../contexts/TransactionContext'
import type { ToastConfig } from '../lib/toastConfigs'

interface TransactionObservable {
  subscribe: (handlers: {
    next: (event: TxBroadcastEvent) => void
    error: (error: Error) => void
  }) => { unsubscribe: () => void }
}

export function useTransaction<T = unknown>(toastConfig?: ToastConfig<T>) {
  const {
    startTransaction,
    trackTransaction,
    setTransactionDetails,
    completeTransaction,
  } = useTransactionContext()

  const executeTransaction = async (
    type: string,
    observable: TransactionObservable,
    details?: T
  ) => {
    const transactionId = startTransaction(type, toastConfig)

    try {
      if (details) {
        setTransactionDetails(transactionId, details)
      }

      await trackTransaction(transactionId, observable)

      // Delay completion to allow final toast to show
      setTimeout(() => completeTransaction(transactionId), 500)
    } catch (error) {
      // Error handling is done in the context, just complete the transaction
      setTimeout(() => completeTransaction(transactionId), 500)
      throw error
    }
  }

  return {
    executeTransaction,
  }
}
