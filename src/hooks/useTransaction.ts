import type { TxBroadcastEvent } from 'polkadot-api'

import { useTransactionContext } from '@/hooks'
import type { ToastConfig } from '@/lib'

interface TransactionObservable {
  subscribe: (handlers: {
    next: (event: TxBroadcastEvent) => void
    error: (error: Error) => void
  }) => { unsubscribe: () => void }
}

/**
 * High-level API for executing blockchain transactions.
 *
 * This is the recommended hook for components and mutations that need
 * to execute transactions. It handles the full transaction lifecycle
 * automatically: start → sign → broadcast → track → complete.
 *
 * For advanced use cases that need direct access to transaction state
 * (like monitoring or debugging), use `useTransactionContext` instead.
 *
 * @param toastConfig - Optional toast configuration for transaction notifications
 * @returns Object with `executeTransaction` function
 *
 * @example
 * ```tsx
 * // In a component or mutation
 * const { executeTransaction } = useTransaction<MintParams>({
 *   signing: 'Signing mint transaction...',
 *   finalized: (details) => `Minted ${details.amount} tokens`,
 *   error: (message) => `Failed to mint: ${message}`,
 * })
 *
 * // Execute the transaction
 * await executeTransaction('mint', observable, { amount: '100', assetId: 1 })
 * ```
 */
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
