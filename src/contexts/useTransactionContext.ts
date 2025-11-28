import { useContext } from 'react'

import { TransactionContext } from './TransactionContext'

/**
 * Access transaction state directly.
 *
 * Use this hook when you need to read or observe transactions
 * (e.g., for monitoring, debugging, or reactive UI like toast notifications).
 *
 * For executing transactions, prefer using `useTransaction` instead,
 * which provides a simpler high-level API.
 *
 * @example
 * ```tsx
 * // Reading all transactions for monitoring
 * const { transactions, activeTransaction } = useTransactionContext()
 *
 * // Observing state changes
 * useEffect(() => {
 *   Object.values(transactions).forEach(tx => {
 *     console.log(`Transaction ${tx.id} status:`, tx.status)
 *   })
 * }, [transactions])
 * ```
 */
export function useTransactionContext() {
  const context = useContext(TransactionContext)
  if (context === undefined) {
    throw new Error(
      'useTransactionContext must be used within a TransactionProvider'
    )
  }
  return context
}
