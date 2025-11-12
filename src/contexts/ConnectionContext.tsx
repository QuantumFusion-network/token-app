import type { ReactNode } from 'react'

import { ConnectionContext, useConnectionStatus } from '@/hooks'

export function ConnectionProvider({ children }: { children: ReactNode }) {
  const connection = useConnectionStatus()
  return (
    <ConnectionContext.Provider value={connection}>
      {children}
    </ConnectionContext.Provider>
  )
}
