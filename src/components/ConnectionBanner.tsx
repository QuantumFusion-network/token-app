import { AlertTriangle, Loader2 } from 'lucide-react'

import { useConnectionContext } from '../hooks/useConnectionContext'

export function ConnectionBanner() {
  const { isConnected, isReconnecting } = useConnectionContext()

  if (isConnected) {
    return null
  }

  return (
    <div className="bg-destructive/10 border-destructive/20 text-destructive flex items-center justify-center gap-3 border-b px-4 py-3">
      {isReconnecting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-sm font-medium">
            Reconnecting to QF Network...
          </span>
        </>
      ) : (
        <>
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">
            Connection to QF Network lost. Operations are disabled until
            connection is restored.
          </span>
        </>
      )}
    </div>
  )
}
