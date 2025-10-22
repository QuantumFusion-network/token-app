import type { ReactNode } from 'react'

import { useConnectionStatus } from '../hooks/useConnectionStatus'
import { ConnectionContext } from '../hooks/useConnectionContext'

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const connection = useConnectionStatus()
  return (
    <ConnectionContext.Provider value={connection}>
      {children}
    </ConnectionContext.Provider>
  )
}
