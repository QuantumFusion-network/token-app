import { useState } from 'react'

import { type TxBroadcastEvent } from 'polkadot-api'

import type { ToastConfig } from '@/lib/toastConfigs'
import type { TransactionError } from '@/lib/transactionErrors'
import {
  createDispatchError,
  createTransactionError,
} from '@/lib/errorParsing'

interface TransactionObservable {
  subscribe: (handlers: {
    next: (event: TxBroadcastEvent) => void
    error: (error: Error) => void
  }) => { unsubscribe: () => void }
}

export interface TransactionStatus {
  status:
    | 'idle'
    | 'signing'
    | 'broadcasting'
    | 'inBlock'
    | 'finalized'
    | 'error'
  txHash?: string
  blockHash?: string
  error?: TransactionError
  events?: unknown[]
}

export interface Transaction<T = unknown> {
  id: string
  type: string
  status: TransactionStatus
  details?: T
  toastConfig?: ToastConfig<T>
  subscription?: { unsubscribe: () => void }
}

/**
 * Internal transaction lifecycle manager.
 *
 * @internal
 * This hook should ONLY be used by TransactionProvider.
 * Do not use directly in components or other hooks.
 *
 * Manages transaction state, lifecycle, and subscriptions.
 * Handles the full lifecycle from signing → broadcasting → finalized/error.
 */
export function useTransactionManager() {
  const [transactions, setTransactions] = useState<
    Record<string, Transaction<unknown>>
  >({})
  const [activeTransactionId, setActiveTransactionId] = useState<
    string | undefined
  >()

  const startTransaction = <T = unknown,>(
    type: string,
    toastConfig?: ToastConfig<T>
  ): string => {
    const id = `${type}_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 9)}`
    const transaction: Transaction<T> = {
      id,
      type,
      status: { status: 'idle' },
      toastConfig,
    }

    // Update state immediately - no async dispatch
    setTransactions((prev) => ({
      ...prev,
      [id]: transaction as Transaction<unknown>,
    }))
    setActiveTransactionId(id)
    return id
  }

  const updateTransactionStatus = (id: string, status: TransactionStatus) => {
    setTransactions((prev) => {
      const transaction = prev[id]
      if (!transaction) return prev

      return {
        ...prev,
        [id]: { ...transaction, status },
      }
    })
  }

  const trackTransaction = async (
    id: string,
    observable: TransactionObservable
  ) => {
    // Transaction is available immediately since we use direct state updates
    updateTransactionStatus(id, { status: 'signing' })

    return new Promise<void>((resolve, reject) => {
      const subscription = observable.subscribe({
        next: (event: TxBroadcastEvent) => {
          console.log(`Transaction ${id} status:`, event)

          let newStatus: TransactionStatus

          switch (event.type) {
            case 'signed':
              newStatus = { status: 'signing' }
              break
            case 'broadcasted':
              newStatus = { status: 'broadcasting', txHash: event.txHash }
              break
            case 'txBestBlocksState':
              newStatus = { status: 'inBlock', txHash: event.txHash }
              break
            case 'finalized': {
              if (event.ok) {
                newStatus = {
                  status: 'finalized',
                  txHash: event.txHash,
                  blockHash: event.block.hash,
                  events: event.events,
                }
                updateTransactionStatus(id, newStatus)
                resolve()
                break
              }
              // Transaction finalized but failed during runtime execution
              const transaction = transactions[id]
              const dispatchError = createDispatchError(event.dispatchError, {
                transactionType: transaction?.type,
                transactionId: id,
                details: transaction?.details,
                txHash: event.txHash,
                blockHash: event.block.hash,
              })
              updateTransactionStatus(id, {
                status: 'error',
                error: dispatchError,
              })
              reject(dispatchError)
              return
            }
            default:
              return
          }

          updateTransactionStatus(id, newStatus)
        },
        error: (error: Error) => {
          // Create typed error with transaction context
          const transaction = transactions[id]
          const transactionError = createTransactionError(error, {
            transactionType: transaction?.type,
            transactionId: id,
            details: transaction?.details,
          })
          updateTransactionStatus(id, {
            status: 'error',
            error: transactionError,
          })
          reject(transactionError)
        },
      })

      // Store subscription for cleanup
      setTransactions((prev) => {
        const transaction = prev[id]
        if (!transaction) return prev
        return {
          ...prev,
          [id]: { ...transaction, subscription },
        }
      })
    })
  }

  const setTransactionDetails = <T = unknown,>(id: string, details: T) => {
    setTransactions((prev) => {
      const transaction = prev[id]
      if (!transaction) return prev

      return {
        ...prev,
        [id]: { ...transaction, details },
      }
    })
  }

  const completeTransaction = (id: string) => {
    setTransactions((prev) => {
      const transaction = prev[id]
      if (transaction?.subscription) {
        transaction.subscription.unsubscribe()
      }
      return prev
    })

    setActiveTransactionId((prev) => (prev === id ? undefined : prev))
  }

  return {
    transactions,
    activeTransaction: activeTransactionId
      ? transactions[activeTransactionId]
      : undefined,
    startTransaction,
    trackTransaction,
    setTransactionDetails,
    completeTransaction,
  }
}
