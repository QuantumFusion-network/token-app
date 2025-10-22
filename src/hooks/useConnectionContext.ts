import { createContext, useContext } from 'react'

import type { useConnectionStatus } from './useConnectionStatus'

type ConnectionContextType = ReturnType<typeof useConnectionStatus>

export const ConnectionContext = createContext<
  ConnectionContextType | undefined
>(undefined)

export function useConnectionContext() {
  const context = useContext(ConnectionContext)
  if (context === undefined) {
    throw new Error(
      'useConnectionContext must be used within a ConnectionProvider'
    )
  }
  return context
}
