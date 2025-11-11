import { useRef, useState } from 'react'

import { createClient } from 'polkadot-api'
import {
  getWsProvider,
  WsEvent,
  type StatusChange,
} from 'polkadot-api/ws-provider'

import { queryClient } from '@/lib'
import { qfn as chain } from '@polkadot-api/descriptors'

const wsUrl = 'wss://test.qfnetwork.xyz'

export function useConnectionStatus() {
  const [status, setStatus] = useState<StatusChange | null>(null)
  const hasConnectedOnceRef = useRef(false)

  // Create provider, client, and api once using lazy state initialization
  const [connection] = useState(() => {
    const provider = getWsProvider(wsUrl, {
      onStatusChanged: (newStatus: StatusChange) => {
        console.log('Connection status changed:', newStatus)
        setStatus(newStatus)

        // Track if we've ever been connected
        if (newStatus.type === WsEvent.CONNECTED) {
          if (hasConnectedOnceRef.current) {
            // This is a reconnection - invalidate queries
            console.log('Reconnected - invalidating queries')
            queryClient.invalidateQueries().catch((e: Error) => {
              console.error('Failed to invalidate queries:', e)
            })
          }
          hasConnectedOnceRef.current = true
        }
      },
    })

    const client = createClient(provider)
    const api = client.getTypedApi(chain)

    return { provider, client, api }
  })

  const isConnected = status?.type === WsEvent.CONNECTED
  const isReconnecting =
    status?.type === WsEvent.CONNECTING && hasConnectedOnceRef.current

  return {
    isConnected,
    isReconnecting,
    status,
    provider: connection.provider,
    client: connection.client,
    api: connection.api,
  }
}
