export {
  clearWalletConnection,
  loadWalletConnection,
  saveWalletConnection,
} from './walletStorage'
export {
  DEFAULT_LOCAL_URL,
  DEFAULT_NETWORK,
  getNetworkUrl,
  loadLocalUrl,
  loadNetwork,
  NETWORKS,
  saveLocalUrl,
  saveNetwork,
} from './networkStorage'

export type { StoredWalletConnection } from './walletStorage'
export type { NetworkConfig, NetworkId } from './networkStorage'
