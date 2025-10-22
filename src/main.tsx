// src/main.tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import App from './App'
import { AppErrorBoundary } from './components/error-boundaries'
import { TransactionProvider } from './contexts/TransactionContext'
import { WalletProvider } from './contexts/WalletContext'
import { queryClient } from './lib/queryClient'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <WalletProvider>
        <TransactionProvider>
          <QueryClientProvider client={queryClient}>
            <App />
            <ReactQueryDevtools initialIsOpen={true} />
          </QueryClientProvider>
        </TransactionProvider>
      </WalletProvider>
    </AppErrorBoundary>
  </StrictMode>
)
