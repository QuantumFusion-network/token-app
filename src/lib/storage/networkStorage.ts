const NETWORK_STORAGE_KEY = 'qfn-selected-network'
const LOCAL_URL_STORAGE_KEY = 'qfn-local-url'

export type NetworkId = 'testnet' | 'local'

export interface NetworkConfig {
  id: NetworkId
  name: string
  url: string
}

export const DEFAULT_LOCAL_URL = 'ws://127.0.0.1:9944'

export const NETWORKS: Record<NetworkId, NetworkConfig> = {
  testnet: {
    id: 'testnet',
    name: 'QF Testnet',
    url: 'wss://test.qfnetwork.xyz',
  },
  local: {
    id: 'local',
    name: 'Local Node',
    url: DEFAULT_LOCAL_URL,
  },
}

export const DEFAULT_NETWORK: NetworkId = 'testnet'

// Network selection
export function saveNetwork(networkId: NetworkId): void {
  try {
    localStorage.setItem(NETWORK_STORAGE_KEY, networkId)
  } catch (error) {
    console.warn('Failed to save network selection to localStorage:', error)
  }
}

export function loadNetwork(): NetworkId {
  try {
    const stored = localStorage.getItem(NETWORK_STORAGE_KEY)
    if (stored && stored in NETWORKS) {
      return stored as NetworkId
    }
    return DEFAULT_NETWORK
  } catch (error) {
    console.warn('Failed to load network selection from localStorage:', error)
    return DEFAULT_NETWORK
  }
}

// Local URL (separate storage)
export function saveLocalUrl(url: string): void {
  try {
    localStorage.setItem(LOCAL_URL_STORAGE_KEY, url)
  } catch (error) {
    console.warn('Failed to save local URL to localStorage:', error)
  }
}

export function loadLocalUrl(): string {
  try {
    const stored = localStorage.getItem(LOCAL_URL_STORAGE_KEY)
    if (stored && stored.length > 0) {
      return stored
    }
    return DEFAULT_LOCAL_URL
  } catch (error) {
    console.warn('Failed to load local URL from localStorage:', error)
    return DEFAULT_LOCAL_URL
  }
}

// Get effective URL for a network (uses stored local URL for 'local')
export function getNetworkUrl(networkId: NetworkId): string {
  if (networkId === 'local') {
    return loadLocalUrl()
  }
  return NETWORKS[networkId].url
}
