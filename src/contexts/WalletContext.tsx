import type { ReactNode } from 'react'

import { useWallet, WalletContext } from '@/hooks'

export function WalletProvider({ children }: { children: ReactNode }) {
  const wallet = useWallet()
  return (
    <WalletContext.Provider value={wallet}>{children}</WalletContext.Provider>
  )
}
