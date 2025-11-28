import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

import { AppErrorBoundary } from '@/components'
import {
  ConnectionProvider,
  TransactionProvider,
  useConnectionContext,
  WalletProvider,
} from '@/contexts'
import { queryClient } from '@/lib'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import App from './App'

// Wrapper to pass networkId from ConnectionContext to WalletProvider
function WalletProviderWithNetwork({ children }: { children: ReactNode }) {
  const { networkId } = useConnectionContext()
  return <WalletProvider networkId={networkId}>{children}</WalletProvider>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <ConnectionProvider>
        <WalletProviderWithNetwork>
          <TransactionProvider>
            <QueryClientProvider client={queryClient}>
              <App />
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </TransactionProvider>
        </WalletProviderWithNetwork>
      </ConnectionProvider>
    </AppErrorBoundary>
  </StrictMode>
)
