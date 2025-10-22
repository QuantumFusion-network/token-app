import { createContext, useContext, useState, type ReactNode } from 'react'

import type { TxBroadcastEvent } from 'polkadot-api'

import type { ToastConfig } from '@/lib/toastConfigs'

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
  error?: Error
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

interface TransactionContextValue {
  transactions: Record<string, Transaction<unknown>>
  activeTransaction?: Transaction<unknown>
  startTransaction: <T = unknown>(
    type: string,
    toastConfig?: ToastConfig<T>
  ) => string
  trackTransaction: (
    id: string,
    observable: TransactionObservable
  ) => Promise<void>
  setTransactionDetails: <T = unknown>(id: string, details: T) => void
  completeTransaction: (id: string) => void
}

const TransactionContext = createContext<TransactionContextValue | undefined>(
  undefined
)

export function useTransactionContext() {
  const context = useContext(TransactionContext)
  if (!context) {
    throw new Error(
      'useTransactionContext must be used within a TransactionProvider'
    )
  }
  return context
}

interface TransactionProviderProps {
  children: ReactNode
}

export function TransactionProvider({ children }: TransactionProviderProps) {
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

  const getDispatchError = (dispatchError: {
    type: string
    value: unknown
  }): string => {
    if (dispatchError?.type === 'Module') {
      const error = dispatchError.value as {
        type: string
        value: { type: string }
      }
      return `${error.type}: ${error.value.type}`
    }
    return 'Unknown error'
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
          let dispatchError = 'Unknown error'

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
            case 'finalized':
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
              if (event.dispatchError) {
                dispatchError = getDispatchError(event.dispatchError)
              }
              updateTransactionStatus(id, {
                status: 'error',
                error: new Error(dispatchError),
              })
              reject(new Error(dispatchError))
              return
            default:
              return
          }

          updateTransactionStatus(id, newStatus)
        },
        error: (error: Error) => {
          console.error(`Transaction ${id} error:`, error)
          updateTransactionStatus(id, { status: 'error', error })
          reject(error)
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

  const value: TransactionContextValue = {
    transactions,
    activeTransaction: activeTransactionId
      ? transactions[activeTransactionId]
      : undefined,
    startTransaction,
    trackTransaction,
    setTransactionDetails,
    completeTransaction,
  }

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  )
}
