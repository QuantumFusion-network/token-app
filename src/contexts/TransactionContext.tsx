import type { ReactNode } from 'react'

import { TransactionContext } from '@/hooks'
import { useTransactionManager } from '@/hooks/useTransactionManager'

export function TransactionProvider({ children }: { children: ReactNode }) {
  const transaction = useTransactionManager()
  return (
    <TransactionContext.Provider value={transaction}>
      {children}
    </TransactionContext.Provider>
  )
}
