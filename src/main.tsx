import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import App from './App'
import { AppErrorBoundary } from '@/components'
import { ConnectionProvider, TransactionProvider, WalletProvider } from '@/contexts'
import { queryClient } from '@/lib'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <ConnectionProvider>
        <WalletProvider>
          <TransactionProvider>
            <QueryClientProvider client={queryClient}>
              <App />
              <ReactQueryDevtools initialIsOpen={true} />
            </QueryClientProvider>
          </TransactionProvider>
        </WalletProvider>
      </ConnectionProvider>
    </AppErrorBoundary>
  </StrictMode>
)
