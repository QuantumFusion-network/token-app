import { createContext, useContext } from 'react'

import type { useWallet } from './useWallet'

type WalletContextType = ReturnType<typeof useWallet>

export const WalletContext = createContext<WalletContextType | undefined>(
  undefined
)
export function useWalletContext() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWalletContext must be used within a WalletProvider')
  }
  return context
}
