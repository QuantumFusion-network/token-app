import { createContext, type ReactNode } from 'react'

import { useConnectionStatus } from './internal/useConnectionStatus'

type ConnectionContextType = ReturnType<typeof useConnectionStatus>

export const ConnectionContext = createContext<
  ConnectionContextType | undefined
>(undefined)

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const connection = useConnectionStatus()
  return (
    <ConnectionContext.Provider value={connection}>
      {children}
    </ConnectionContext.Provider>
  )
}
