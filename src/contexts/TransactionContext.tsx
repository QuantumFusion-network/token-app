import { createContext, type ReactNode } from 'react'

import { useTransactionManager } from './internal/useTransactionManager'

type TransactionContextType = ReturnType<typeof useTransactionManager>

export const TransactionContext = createContext<
  TransactionContextType | undefined
>(undefined)

export function TransactionProvider({ children }: { children: ReactNode }) {
  const transaction = useTransactionManager()
  return (
    <TransactionContext.Provider value={transaction}>
      {children}
    </TransactionContext.Provider>
  )
}
