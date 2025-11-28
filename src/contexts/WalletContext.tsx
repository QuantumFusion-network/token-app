import type { ReactNode } from 'react'

import { useWallet, WalletContext } from '@/hooks'
import type { NetworkId } from '@/lib'

interface WalletProviderProps {
  networkId: NetworkId
  children: ReactNode
}

export function WalletProvider({ networkId, children }: WalletProviderProps) {
  const wallet = useWallet(networkId)
  return (
    <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
  )
}
