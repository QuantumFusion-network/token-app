import { useContext } from 'react'

import { ConnectionContext } from './ConnectionContext'

export function useConnectionContext() {
  const context = useContext(ConnectionContext)
  if (context === undefined) {
    throw new Error(
      'useConnectionContext must be used within a ConnectionProvider'
    )
  }
  return context
}
