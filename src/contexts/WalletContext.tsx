import { createContext, type ReactNode } from 'react'

import type { NetworkId } from '@/lib'

import { useWallet } from './internal/useWallet'

type WalletContextType = ReturnType<typeof useWallet>

export const WalletContext = createContext<WalletContextType | undefined>(
  undefined
)

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
