import { useRef, useState } from 'react'

import { createClient, type PolkadotClient, type TypedApi } from 'polkadot-api'
import {
  getWsProvider,
  WsEvent,
  type StatusChange,
  type WsJsonRpcProvider,
} from 'polkadot-api/ws-provider'

import {
  getNetworkUrl,
  loadNetwork,
  NETWORKS,
  queryClient,
  saveLocalUrl,
  saveNetwork,
} from '@/lib'
import type { NetworkId } from '@/lib'
import { qfn as chain } from '@polkadot-api/descriptors'

interface Connection {
  provider: WsJsonRpcProvider
  client: PolkadotClient
  api: TypedApi<typeof chain>
}

function createConnection(
  wsUrl: string,
  onStatusChanged: (status: StatusChange) => void,
  hasConnectedOnceRef: React.RefObject<boolean>
): Connection {
  const provider = getWsProvider(wsUrl, {
    onStatusChanged: (newStatus: StatusChange) => {
      console.log('Connection status changed:', newStatus)
      onStatusChanged(newStatus)

      if (newStatus.type === WsEvent.CONNECTED) {
        if (hasConnectedOnceRef.current) {
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
}

export function useConnectionStatus() {
  const [status, setStatus] = useState<StatusChange | null>(null)
  const [networkId, setNetworkId] = useState<NetworkId>(loadNetwork)
  const [currentUrl, setCurrentUrl] = useState(() => getNetworkUrl(networkId))
  const hasConnectedOnceRef = useRef(false)

  const [connection, setConnection] = useState<Connection>(() =>
    createConnection(currentUrl, setStatus, hasConnectedOnceRef)
  )

  const switchNetwork = (newNetworkId: NetworkId, customUrl?: string) => {
    // For local network, save custom URL if provided
    if (newNetworkId === 'local' && customUrl) {
      saveLocalUrl(customUrl)
    }

    const newUrl = customUrl ?? getNetworkUrl(newNetworkId)

    // Skip if same network and same URL
    if (newNetworkId === networkId && newUrl === currentUrl) return

    saveNetwork(newNetworkId)
    connection.client.destroy()
    hasConnectedOnceRef.current = false
    setStatus(null)

    const newConnection = createConnection(
      newUrl,
      setStatus,
      hasConnectedOnceRef
    )

    // Clear all cached data so components show loading state and refetch
    queryClient.clear()

    setConnection(newConnection)
    setNetworkId(newNetworkId)
    setCurrentUrl(newUrl)
  }

  const isConnected = status?.type === WsEvent.CONNECTED
  const isReconnecting =
    status?.type === WsEvent.CONNECTING && hasConnectedOnceRef.current

  return {
    isConnected,
    isReconnecting,
    status,
    networkId,
    currentUrl,
    availableNetworks: Object.values(NETWORKS),
    switchNetwork,
    provider: connection.provider,
    client: connection.client,
    api: connection.api,
  }
}
